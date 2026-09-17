import React from "react";
import { ShieldCheck, MonitorSmartphone } from "lucide-react";

/**
 * New-device security moment shown AFTER a successful login from an
 * unrecognized device. Deliberately a full interstitial (not a dismissible
 * toast) so the user actually registers that a new device signed in — this is
 * the moment to catch account takeover. Offers a direct link to review/revoke
 * sessions.
 *
 * NOTE: by the time this shows, login already succeeded (step-up OTP passed), so
 * this is a confirmation + awareness step, not a gate.
 */
const DeviceTrustPrompt = ({ onAcknowledge, onReviewSessions }) => (
  <div className="text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#4318FF]/10">
      <MonitorSmartphone className="h-7 w-7 text-[#4318FF]" aria-hidden="true" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900">New device login — was this you?</h2>
    <p className="mt-2 text-sm text-gray-600">
      You just signed in from a device we haven't seen before. If this was you,
      you're all set. If not, review your active sessions and sign out
      everywhere.
    </p>

    <div className="mt-6 space-y-3">
      <button
        onClick={onAcknowledge}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4318FF] py-2.5 font-medium text-white"
      >
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Yes, this was me
      </button>
      <button
        onClick={onReviewSessions}
        className="w-full rounded-lg border border-gray-300 py-2.5 font-medium text-gray-700"
      >
        Review active sessions
      </button>
    </div>
  </div>
);

export default DeviceTrustPrompt;
