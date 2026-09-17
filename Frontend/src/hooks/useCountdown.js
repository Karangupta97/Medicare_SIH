import { useEffect, useState, useCallback } from "react";

/**
 * Countdown to an ABSOLUTE expiry timestamp (ms since epoch).
 *
 * WHY absolute, not a duration: the OTP expiry is dictated by the backend
 * (returned as expiresInSeconds → we compute an absolute deadline). Counting to
 * a fixed deadline stays correct across tab-suspend/resume and re-renders,
 * unlike a naive "seconds--" timer that drifts. When it hits 0, the "resend"
 * affordance becomes available.
 *
 * @param {number|null} expiresAt absolute ms timestamp, or null when inactive
 * @returns {{ secondsLeft: number, expired: boolean }}
 */
export function useCountdown(expiresAt) {
  const compute = useCallback(() => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
  }, [expiresAt]);

  const [secondsLeft, setSecondsLeft] = useState(compute);

  useEffect(() => {
    setSecondsLeft(compute());
    if (!expiresAt) return undefined;
    const id = setInterval(() => {
      const s = compute();
      setSecondsLeft(s);
      if (s <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt, compute]);

  return { secondsLeft, expired: secondsLeft <= 0 };
}
