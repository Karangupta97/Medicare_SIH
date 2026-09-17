import React, { useEffect } from "react";

/**
 * Provider-agnostic CAPTCHA / bot-attestation widget.
 *
 * DEFAULT / DEVIATION: the repo has no captcha provider configured. This widget
 * is a seam: set VITE_CAPTCHA_PROVIDER + VITE_CAPTCHA_SITE_KEY to wire up
 * reCAPTCHA/hCaptcha (load their script and render into #captcha-slot, then call
 * onToken with the solved token). When unconfigured (dev), it auto-issues a
 * dev-token so local flows work — the BACKEND still fails closed in production
 * if it doesn't get a real token, so this can't be an accidental prod bypass.
 *
 * It gates submit: the parent enables the submit button only after onToken fires
 * with a truthy token.
 */
const CaptchaWidget = ({ onToken, disabled }) => {
  const provider = import.meta.env.VITE_CAPTCHA_PROVIDER;

  useEffect(() => {
    if (!provider || provider === "disabled") {
      // Dev-only convenience token. Backend rejects this in production.
      onToken?.("dev-captcha-token");
      return;
    }
    // Real integration point: dynamically load the provider script and render
    // its widget into the slot below, wiring its callback to onToken. Left as a
    // documented stub to avoid pulling in a specific vendor SDK.
    // e.g. window.grecaptcha.render("captcha-slot", { sitekey, callback: onToken })
  }, [provider, onToken]);

  if (!provider || provider === "disabled") {
    return (
      <p className="mt-3 text-xs text-gray-400" aria-hidden="true">
        {/* Hidden from SR — purely a dev affordance. */}
        Bot protection is disabled in this environment.
      </p>
    );
  }

  return (
    <div className="mt-3">
      <div id="captcha-slot" aria-label="Human verification challenge" />
      {disabled && <p className="text-xs text-gray-400">Complete the verification to continue.</p>}
    </div>
  );
};

export default CaptchaWidget;
