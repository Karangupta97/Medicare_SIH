import mongoose from "mongoose";
import crypto from "crypto";
import { __setConnectionsForTests } from "../../../DB/connections.js";

/**
 * Test harness: boots an in-memory MongoDB (mongodb-memory-server if available),
 * wires it into the app's connection registry so the model factories
 * (getPatientDB().model(...)) resolve against it, and provides teardown.
 *
 * If mongodb-memory-server is not installed, callers should skip the suite.
 */
export async function startInMemoryMongo() {
  // Ensure required secrets exist for the modules under test.
  process.env.AADHAAR_HMAC_PEPPER ||= "test-pepper-do-not-use-in-prod-0123456789";
  process.env.AADHAAR_HMAC_PEPPER_VERSION ||= "1";
  process.env.AADHAAR_FIELD_ENC_KEY ||= crypto.randomBytes(32).toString("base64");
  process.env.AADHAAR_FIELD_ENC_KEY_VERSION ||= "1";
  process.env.JWT_SECRET ||= "test-jwt-secret";

  let MongoMemoryServer;
  try {
    ({ MongoMemoryServer } = await import("mongodb-memory-server"));
  } catch {
    return { available: false };
  }

  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  const conn = mongoose.createConnection(uri, { dbName: "PatientTest" });
  await conn.asPromise();

  // Wire into the app registry so model factories bind to this connection.
  __setConnectionsForTests({
    patientDB: conn,
    doctorDB: conn,
    managementDB: conn,
    feedbackDB: conn,
  });

  return {
    available: true,
    async stop() {
      await conn.close();
      await mongod.stop();
    },
    async clear() {
      const collections = await conn.db.collections();
      for (const c of collections) await c.deleteMany({});
    },
    conn,
  };
}

/** Build a minimal Express-like req for controller unit tests. */
export function fakeReq({ body = {}, headers = {}, user = null, ip = "203.0.113.9" } = {}) {
  return {
    body,
    headers: { "user-agent": "test-agent", ...headers },
    user,
    ip,
    socket: { remoteAddress: ip },
    get(h) {
      return this.headers[String(h).toLowerCase()];
    },
  };
}

/** Build a fake Express res capturing status + json. */
export function fakeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

/** A controllable fake KYC provider for deterministic flow tests. */
export function makeFakeKycProvider() {
  const state = {
    otpToSend: "654987", // NOTE: not a weak/denylisted value used as a PIN
    referenceId: "ref-" + crypto.randomBytes(4).toString("hex"),
    generateStatus: "otp_sent",
    verifyOverride: null, // set to a status to force a specific verify result
    kyc: {
      name: "Test Patient",
      dob: "1990-01-01",
      gender: "M",
      address: "1 Test Street, Test City, 560001",
      careOf: "S/O Tester",
      photoBase64: Buffer.from("fake-photo-bytes").toString("base64"),
      mobile: "9998887776",
      email: "patient@example.com",
    },
  };
  const provider = {
    get name() {
      return "fake";
    },
    async generateOtp() {
      if (state.generateStatus !== "otp_sent") {
        return { status: state.generateStatus, retryable: true, providerMessage: "forced" };
      }
      return { status: "otp_sent", referenceId: state.referenceId, retryable: false };
    },
    async verifyOtp(referenceId, otp) {
      if (state.verifyOverride) {
        return { status: state.verifyOverride, retryable: state.verifyOverride === "under_process", retryAfterMs: 10 };
      }
      if (otp === state.otpToSend) {
        return { status: "valid", retryable: false, kyc: { ...state.kyc } };
      }
      return { status: "invalid_otp", retryable: false, providerMessage: "wrong" };
    },
  };
  return { provider, state };
}
