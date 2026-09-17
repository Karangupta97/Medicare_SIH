import axios from "axios";

/**
 * CAPTCHA / bot-attestation middleware.
 *
 * WHY: Before spending a paid OKYC call (registration Step A / login OTP
 * generation), we require proof the caller is a human/attested device. This is
 * a second enumeration + OTP-bombing defense layered on top of rate limiting.
 *
 * DEFAULT / DEVIATION: the repo has no captcha provider wired up. We implement
 * a provider-agnostic verifier that supports Google reCAPTCHA / hCaptcha via a
 * shared secret, and a documented DEV bypass. In production set
 * CAPTCHA_PROVIDER + CAPTCHA_SECRET; mobile clients can instead send an
 * attestation token (Play Integrity / App Attest) verified by swapping the
 * verifier below. The seam is intentionally small so it's easy to replace.
 */

async function verifyRecaptcha(token, remoteIp) {
  const secret = process.env.CAPTCHA_SECRET;
  const resp = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    null,
    { params: { secret, response: token, remoteip: remoteIp }, timeout: 8000 }
  );
  return !!resp.data?.success;
}

async function verifyHcaptcha(token, remoteIp) {
  const secret = process.env.CAPTCHA_SECRET;
  const params = new URLSearchParams({ secret, response: token });
  if (remoteIp) params.append("remoteip", remoteIp);
  const resp = await axios.post("https://api.hcaptcha.com/siteverify", params, {
    timeout: 8000,
  });
  return !!resp.data?.success;
}

export const requireCaptcha = async (req, res, next) => {
  const provider = (process.env.CAPTCHA_PROVIDER || "").toLowerCase();

  // DEV bypass: only when explicitly disabled AND not in production. Documented
  // so it can never be silently on in prod.
  if (!provider || provider === "disabled") {
    if (process.env.NODE_ENV === "production") {
      console.error("[captcha] CAPTCHA_PROVIDER not configured in production — refusing OKYC call.");
      return res.status(400).json({
        success: false,
        message: "Verification is temporarily unavailable. Please try again later.",
      });
    }
    // Non-prod: allow through so local/dev testing works without a captcha.
    return next();
  }

  const token = req.body?.captchaToken || req.headers["x-captcha-token"];
  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Human verification is required to continue.",
    });
  }

  try {
    let ok = false;
    if (provider === "recaptcha") ok = await verifyRecaptcha(token, req.ip);
    else if (provider === "hcaptcha") ok = await verifyHcaptcha(token, req.ip);
    else {
      console.error(`[captcha] unknown CAPTCHA_PROVIDER: ${provider}`);
      return res.status(500).json({ success: false, message: "Verification misconfigured." });
    }

    if (!ok) {
      return res.status(400).json({
        success: false,
        message: "Human verification failed. Please try again.",
      });
    }
    return next();
  } catch (err) {
    console.error("[captcha] verification error:", err.message);
    // Fail closed for a paid, abuse-prone action.
    return res.status(400).json({
      success: false,
      message: "Could not complete verification. Please try again.",
    });
  }
};
