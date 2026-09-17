import React, { useState, useMemo, useCallback, useEffect } from "react";
import { validatePinStrength } from "../../../utils/aadhaar/pin";

/**
 * UPI-style 6-digit PIN entry, familiar to Indian users.
 *
 * MODES:
 *  - mode="set": two-step (enter → confirm) like UPI PIN setup, with client-side
 *    weakness validation (mirrors backend) and a mismatch check on confirm.
 *  - mode="enter": single-step for login.
 *
 * SECURITY:
 *  - Digits are masked (● dots) with an optional reveal toggle.
 *  - The PIN lives in local state ONLY and is cleared immediately after submit
 *    so it isn't retained in devtools-visible state; never logged / analytics.
 *  - Haptic feedback via navigator.vibrate on keypress where available (mobile).
 *  - Numeric on-screen keypad so it works without a device keyboard and matches
 *    the UPI mental model; inputmode numeric on the hidden aggregator too.
 */
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

function PinDots({ length, reveal, digits }) {
  return (
    <div className="flex justify-center gap-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={i}
          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
            i < length ? "border-[#4318FF] bg-[#4318FF]/10" : "border-gray-300"
          }`}
        >
          {i < length ? (reveal ? digits[i] : "●") : ""}
        </span>
      ))}
    </div>
  );
}

const PinPad = ({ mode = "enter", loading, onSubmit, title, subtitle }) => {
  const [stage, setStage] = useState("first"); // "first" | "confirm" (set mode)
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [reveal, setReveal] = useState(false);
  const [localError, setLocalError] = useState(null);

  const weakness = useMemo(() => (pin.length === 6 ? validatePinStrength(pin) : null), [pin]);

  const press = useCallback(
    (key) => {
      if (loading) return;
      setLocalError(null);
      if (navigator.vibrate) navigator.vibrate(8); // subtle haptic on mobile
      if (key === "del") {
        setPin((p) => p.slice(0, -1));
        return;
      }
      if (!/^\d$/.test(key)) return;
      setPin((p) => (p.length < 6 ? p + key : p));
    },
    [loading]
  );

  // PHYSICAL KEYBOARD SUPPORT: accept the number row AND the numeric keypad, plus
  // Backspace/Delete — so users with a hardware keyboard/numpad can type the PIN
  // instead of only clicking the on-screen keypad. e.key is "0".."9" for both
  // the top-row digits and the numpad digits, so a single check covers both.
  useEffect(() => {
    const onKeyDown = (e) => {
      // Ignore when a modifier is held (e.g. Cmd+R) or focus is on another input.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;

      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        press(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        press("del");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [press]);

  const proceed = () => {
    if (pin.length !== 6 || loading) return;

    if (mode === "set") {
      // Enforce weakness rules client-side before advancing (backend re-checks).
      if (stage === "first") {
        const w = validatePinStrength(pin);
        if (!w.valid) {
          setLocalError(w.reason);
          setPin("");
          return;
        }
        setFirstPin(pin);
        setPin("");
        setStage("confirm");
        return;
      }
      // confirm stage: must match.
      if (pin !== firstPin) {
        setLocalError("PINs don't match. Please try again.");
        setPin("");
        setStage("first");
        setFirstPin("");
        return;
      }
      const finalPin = pin;
      // Clear all PIN material from state before handing off.
      setPin("");
      setFirstPin("");
      setStage("first");
      onSubmit(finalPin);
      return;
    }

    // enter mode
    const finalPin = pin;
    setPin("");
    onSubmit(finalPin);
  };

  // Auto-advance when 6 digits are entered (UPI feel), but only in enter mode or
  // the set-flow stages where a mismatch/weakness check gates it.
  useEffect(() => {
    if (pin.length === 6) {
      // small delay so the last dot renders before we transition
      const t = setTimeout(proceed, 120);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const heading =
    title || (mode === "set" ? (stage === "first" ? "Set your 6-digit PIN" : "Confirm your PIN") : "Enter your PIN");

  return (
    <div>
      <div className="mb-5 text-center">
        <h2 className="text-[18px] font-semibold text-[#2B3674]">{heading}</h2>
        {subtitle && <p className="mt-1 text-[13px] text-[#707EAE]">{subtitle}</p>}
      </div>

      {/* SR-only status of how many digits are entered + why masked. */}
      <p className="sr-only" aria-live="polite">
        {pin.length} of 6 digits entered. Your PIN is hidden for security.
      </p>

      <PinDots length={pin.length} reveal={reveal} digits={pin} />

      <div className="mt-2 text-center">
        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          className="text-xs font-medium text-[#4318FF]"
          aria-label={reveal ? "Hide PIN digits" : "Show PIN digits"}
        >
          {reveal ? "Hide" : "Show"}
        </button>
      </div>

      {(localError || (weakness && !weakness.valid)) && (
        <p className="mt-3 text-center text-sm text-red-600" role="alert">
          {localError || weakness.reason}
        </p>
      )}

      {/* On-screen numeric keypad (UPI-style). */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {KEYS.map((k, i) =>
          k === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={loading}
              onClick={() => press(k)}
              aria-label={k === "del" ? "Delete last digit" : `Digit ${k}`}
              className="h-14 rounded-[16px] bg-[#F4F7FE] text-xl font-semibold text-[#2B3674] hover:bg-[#4318FF]/5 active:bg-[#4318FF]/10 transition-all duration-200 disabled:opacity-50"
            >
              {k === "del" ? "⌫" : k}
            </button>
          )
        )}
      </div>

      {/* Hint that the hardware keyboard/numpad works too. */}
      <p className="mt-3 text-center text-[12px] text-[#707EAE]">
        Tap the keys or type using your keyboard / numpad.
      </p>

      {loading && <p className="mt-4 text-center text-sm text-gray-500">Please wait…</p>}
    </div>
  );
};

export default PinPad;
