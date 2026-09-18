import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { startInMemoryMongo, fakeReq, fakeRes, makeFakeKycProvider } from "./helpers/dbHarness.js";

const harness = await startInMemoryMongo();
const SKIP = !harness.available && "mongodb-memory-server unavailable";

// A Verhoeff-valid test Aadhaar number (computed, not a real one).
function withCheckDigit(eleven) {
  const d = [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0],
  ];
  const p = [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
  ];
  const inv = [0,4,3,2,1,5,6,7,8,9];
  let c = 0;
  const rev = eleven.split("").reverse();
  for (let i = 0; i < rev.length; i++) c = d[c][p[(i + 1) % 8][parseInt(rev[i], 10)]];
  return eleven + inv[c];
}
const AADHAAR = withCheckDigit("23456789012");
const GOOD_PIN = "428173";

// Lazily imported after the harness is wired.
let reg, login, factory, AadhaarUser, AadhaarSession, RegistrationSession;

test("setup modules", { skip: SKIP }, async () => {
  reg = await import("../../controllers/User/aadhaarRegistration.controller.js");
  login = await import("../../controllers/User/aadhaarLogin.controller.js");
  factory = await import("../../services/kyc/providerFactory.js");
  // Aadhaar auth is merged into the existing User model; tests assert against it.
  ({ User: AadhaarUser } = await import("../../models/User/user.model.js"));
  ({ AadhaarSession } = await import("../../models/User/aadhaarSession.model.js"));
  ({ RegistrationSession } = await import("../../models/User/registrationSession.model.js"));
});

/** Run the happy-path registration; returns the set-pin response body. */
async function register(aadhaar = AADHAAR, pin = GOOD_PIN, deviceId = "device-1") {
  const { provider, state } = makeFakeKycProvider();
  factory.__setKycProviderForTests(provider);

  // Step A
  let res = fakeRes();
  await reg.registerStepA(fakeReq({ body: { aadhaarNumber: aadhaar, consent: true, deviceId } }), res);
  assert.equal(res.body.success, true, "step A ok");
  const sessionId = res.body.sessionId;

  // Step B
  res = fakeRes();
  await reg.registerStepB(fakeReq({ body: { sessionId, otp: state.otpToSend, deviceId } }), res);
  assert.equal(res.body.success, true, "step B ok");

  // Step C
  res = fakeRes();
  await reg.registerSetPin(fakeReq({ body: { sessionId, pin, deviceId } }), res);
  return res;
}

test("registration happy path creates exactly one account + session", { skip: SKIP }, async () => {
  await harness.clear();
  const res = await register();
  assert.equal(res.statusCode, 201);
  assert.ok(res.body.accessToken && res.body.refreshToken);
  const count = await AadhaarUser().countDocuments({});
  assert.equal(count, 1);
  const sessions = await AadhaarSession().countDocuments({});
  assert.equal(sessions, 1, "first session issued");
});

test("duplicate Aadhaar is rejected on second registration (pre-check)", { skip: SKIP }, async () => {
  await harness.clear();
  await register();
  // Second attempt with the SAME Aadhaar should be rejected at step A.
  const { provider } = makeFakeKycProvider();
  factory.__setKycProviderForTests(provider);
  const res = fakeRes();
  await reg.registerStepA(fakeReq({ body: { aadhaarNumber: AADHAAR, consent: true } }), res);
  assert.equal(res.body.code, "ACCOUNT_EXISTS");
  assert.equal(await AadhaarUser().countDocuments({}), 1, "still one account");
});

test("duplicate Aadhaar RACE: unique index is the final authority", { skip: SKIP }, async () => {
  await harness.clear();
  const { provider, state } = makeFakeKycProvider();
  factory.__setKycProviderForTests(provider);

  // Two concurrent registrations that BOTH pass the pre-check and OTP, then race
  // to create the account. Only one may succeed; the other must hit E11000.
  async function upToSetPin(deviceId) {
    let res = fakeRes();
    await reg.registerStepA(fakeReq({ body: { aadhaarNumber: AADHAAR, consent: true, deviceId } }), res);
    const sessionId = res.body.sessionId;
    res = fakeRes();
    await reg.registerStepB(fakeReq({ body: { sessionId, otp: state.otpToSend, deviceId } }), res);
    return sessionId;
  }
  const s1 = await upToSetPin("dev-a");
  const s2 = await upToSetPin("dev-b");

  // Fire both set-pin calls concurrently.
  const r1 = fakeRes();
  const r2 = fakeRes();
  await Promise.all([
    reg.registerSetPin(fakeReq({ body: { sessionId: s1, pin: GOOD_PIN, deviceId: "dev-a" } }), r1),
    reg.registerSetPin(fakeReq({ body: { sessionId: s2, pin: GOOD_PIN, deviceId: "dev-b" } }), r2),
  ]);

  const successes = [r1, r2].filter((r) => r.statusCode === 201).length;
  const dupes = [r1, r2].filter((r) => r.body?.code === "ACCOUNT_EXISTS").length;
  assert.equal(successes, 1, "exactly one registration succeeds");
  assert.equal(dupes, 1, "the other is rejected as duplicate");
  assert.equal(await AadhaarUser().countDocuments({}), 1, "one account per Aadhaar, ever");
});

test("OTP expiry: expired registration session forces restart", { skip: SKIP }, async () => {
  await harness.clear();
  const { provider, state } = makeFakeKycProvider();
  factory.__setKycProviderForTests(provider);

  let res = fakeRes();
  await reg.registerStepA(fakeReq({ body: { aadhaarNumber: AADHAAR, consent: true } }), res);
  const sessionId = res.body.sessionId;

  // Force expiry by back-dating the session.
  await RegistrationSession().updateOne(
    { session_id: sessionId },
    { $set: { expires_at: new Date(Date.now() - 1000) } }
  );

  res = fakeRes();
  await reg.registerStepB(fakeReq({ body: { sessionId, otp: state.otpToSend } }), res);
  assert.equal(res.body.code, "SESSION_EXPIRED");
});

test("OTP attempt cap: 3 wrong OTPs invalidate the reference", { skip: SKIP }, async () => {
  await harness.clear();
  const { provider } = makeFakeKycProvider();
  factory.__setKycProviderForTests(provider);
  let res = fakeRes();
  await reg.registerStepA(fakeReq({ body: { aadhaarNumber: AADHAAR, consent: true } }), res);
  const sessionId = res.body.sessionId;

  for (let i = 0; i < 3; i++) {
    res = fakeRes();
    await reg.registerStepB(fakeReq({ body: { sessionId, otp: "000001" } }), res);
    assert.equal(res.body.success, false);
  }
  // 4th attempt: reference invalidated → restart required.
  res = fakeRes();
  await reg.registerStepB(fakeReq({ body: { sessionId, otp: "000001" } }), res);
  assert.equal(res.body.code, "RESTART_REQUIRED");
});

test("login PIN: known device succeeds; wrong PIN generic-fails", { skip: SKIP }, async () => {
  await harness.clear();
  await register(AADHAAR, GOOD_PIN, "device-1");

  // Correct PIN from the SAME device used at registration (known) → success.
  let res = fakeRes();
  await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: GOOD_PIN, deviceId: "device-1" } }), res);
  assert.equal(res.body.success, true, "known-device PIN login succeeds");
  assert.ok(res.body.accessToken);

  // Wrong PIN → generic invalid credentials.
  res = fakeRes();
  await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: "999999", deviceId: "device-1" } }), res);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /Invalid credentials/);
});

test("login PIN: a NEW/unknown device logs in directly (no step-up)", { skip: SKIP }, async () => {
  await harness.clear();
  await register(AADHAAR, GOOD_PIN, "device-1");
  const { provider } = makeFakeKycProvider();
  factory.__setKycProviderForTests(provider);

  // Device step-up is removed: a correct PIN from an unrecognized device logs in
  // directly and issues a session — no STEP_UP_REQUIRED, no forced OTP.
  const res = fakeRes();
  await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: GOOD_PIN, deviceId: "brand-new-device" } }), res);
  assert.equal(res.body.success, true, "new-device PIN login succeeds directly");
  assert.ok(res.body.accessToken, "session issued");
  assert.notEqual(res.body.code, "STEP_UP_REQUIRED", "no step-up");
});

test("PIN lockout: backoff engages after 3 failures", { skip: SKIP }, async () => {
  await harness.clear();
  await register(AADHAAR, GOOD_PIN, "device-1");

  for (let i = 0; i < 3; i++) {
    const res = fakeRes();
    await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: "999999", deviceId: "device-1" } }), res);
    assert.equal(res.statusCode, 401);
  }
  const user = await AadhaarUser().findOne({});
  assert.ok(user.pin_locked_until && user.pin_locked_until > new Date(), "account is locked out");

  // Even a CORRECT PIN is refused while locked (generic message).
  const res = fakeRes();
  await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: GOOD_PIN, deviceId: "device-1" } }), res);
  assert.equal(res.statusCode, 401);
});

test("PIN lockout: freeze after 10 failures in 24h + revokes sessions", { skip: SKIP }, async () => {
  await harness.clear();
  await register(AADHAAR, GOOD_PIN, "device-1");

  // Clear lock windows between attempts so we can push to 10 counted failures.
  for (let i = 0; i < 10; i++) {
    await AadhaarUser().updateOne({}, { $set: { pin_locked_until: null } });
    const res = fakeRes();
    await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: "999999", deviceId: "device-1" } }), res);
  }
  const user = await AadhaarUser().findOne({});
  assert.equal(user.status, "frozen", "account frozen after 10 failures/24h");
  const active = await AadhaarSession().countDocuments({ user_id: user._id, revoked_at: null });
  assert.equal(active, 0, "all sessions revoked on freeze");

  // Frozen account returns the SAME generic message as wrong PIN (no enumeration).
  const res = fakeRes();
  await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: GOOD_PIN, deviceId: "device-1" } }), res);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /Invalid credentials/);
});

test("session revocation: logout-all revokes every active session", { skip: SKIP }, async () => {
  await harness.clear();
  const r = await register(AADHAAR, GOOD_PIN, "device-1");
  const user = await AadhaarUser().findOne({});

  // Add a second session by logging in from the same (known) device again.
  const l = fakeRes();
  await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: GOOD_PIN, deviceId: "device-1" } }), l);
  assert.ok(await AadhaarSession().countDocuments({ user_id: user._id, revoked_at: null }) >= 2);

  const res = fakeRes();
  await login.logoutEverywhere(fakeReq({ user: { id: String(user._id) } }), res);
  assert.equal(res.body.success, true);
  const active = await AadhaarSession().countDocuments({ user_id: user._id, revoked_at: null });
  assert.equal(active, 0, "no active sessions remain");
});

test("refresh token rotation: single-use, replay revokes chain", { skip: SKIP }, async () => {
  await harness.clear();
  const r = await register(AADHAAR, GOOD_PIN, "device-1");
  const first = r.body.refreshToken;

  // First refresh works and rotates.
  let res = fakeRes();
  await login.refreshSession(fakeReq({ body: { refreshToken: first, deviceId: "device-1" } }), res);
  assert.equal(res.body.success, true);
  const second = res.body.refreshToken;
  assert.notEqual(first, second, "token rotated");

  // Replaying the FIRST (now consumed) token is rejected and revokes the chain.
  res = fakeRes();
  await login.refreshSession(fakeReq({ body: { refreshToken: first, deviceId: "device-1" } }), res);
  assert.equal(res.statusCode, 401);

  // The rotated (second) token is now also revoked due to replay detection.
  res = fakeRes();
  await login.refreshSession(fakeReq({ body: { refreshToken: second, deviceId: "device-1" } }), res);
  assert.equal(res.statusCode, 401, "chain revoked after replay");
});

test("generic-error consistency: no-account vs frozen vs wrong-PIN all identical", { skip: SKIP }, async () => {
  await harness.clear();
  await register(AADHAAR, GOOD_PIN, "device-1");

  // no such account
  const other = withCheckDigit("34567890123");
  const rNoAcct = fakeRes();
  await login.loginWithPin(fakeReq({ body: { aadhaarNumber: other, pin: GOOD_PIN, deviceId: "device-1" } }), rNoAcct);

  // wrong pin
  const rWrong = fakeRes();
  await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: "999999", deviceId: "device-1" } }), rWrong);

  // frozen
  await AadhaarUser().updateOne({}, { $set: { status: "frozen" } });
  const rFrozen = fakeRes();
  await login.loginWithPin(fakeReq({ body: { aadhaarNumber: AADHAAR, pin: GOOD_PIN, deviceId: "device-1" } }), rFrozen);

  assert.equal(rNoAcct.statusCode, 401);
  assert.equal(rWrong.statusCode, 401);
  assert.equal(rFrozen.statusCode, 401);
  assert.equal(rNoAcct.body.message, rWrong.body.message);
  assert.equal(rWrong.body.message, rFrozen.body.message);
});

test.after(async () => {
  if (harness.available) await harness.stop();
});
