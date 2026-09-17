// Vitest global setup: adds jest-dom matchers and jsdom shims used by the
// Aadhaar auth components.
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount React trees between tests to avoid state bleed.
afterEach(() => {
  cleanup();
});

// jsdom lacks navigator.vibrate (used for haptic feedback on PIN entry) — stub
// it so components that call it don't throw in tests.
if (!navigator.vibrate) {
  Object.defineProperty(navigator, "vibrate", { value: vi.fn(), writable: true });
}

// jsdom doesn't implement OTP WebOTP API (navigator.credentials.get) — stub to a
// never-resolving promise so autofill wiring is inert in tests.
if (!navigator.credentials) {
  Object.defineProperty(navigator, "credentials", {
    value: { get: vi.fn(() => new Promise(() => {})) },
    writable: true,
  });
}
