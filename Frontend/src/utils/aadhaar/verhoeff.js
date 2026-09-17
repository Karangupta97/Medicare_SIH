/**
 * Verhoeff checksum + Aadhaar formatting/masking helpers (client-side).
 *
 * WHY client-side Verhoeff: it lets us disable the submit button until the
 * entered number is well-formed, giving instant feedback and avoiding a wasted
 * network round-trip / paid OKYC call on an obviously-invalid number. The
 * BACKEND remains the authority (it re-validates and calls the KYC provider);
 * this is purely a UX gate. Mirrors Backend/utils/aadhaar/verhoeff.util.js.
 */

// Verhoeff dihedral (D5) multiplication table.
const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

// Verhoeff permutation table.
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/** Validate the Verhoeff checksum of a digits-only string. */
export function verhoeffValidate(num) {
  if (typeof num !== "string" || !/^\d+$/.test(num)) return false;
  let c = 0;
  const reversed = num.split("").reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = D[c][P[i % 8][parseInt(reversed[i], 10)]];
  }
  return c === 0;
}

/**
 * Full Aadhaar validation: exactly 12 digits, first digit 2-9 (UIDAI rule),
 * and a valid Verhoeff check digit.
 */
export function isValidAadhaarNumber(aadhaar) {
  const digits = onlyDigits(aadhaar);
  if (!/^[2-9]\d{11}$/.test(digits)) return false;
  return verhoeffValidate(digits);
}

/** Strip everything except digits (handles pasted "1234 5678 9012" etc.). */
export function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 12);
}

/**
 * Format a raw digit string into groups of 4 for display: "123456789012" ->
 * "1234 5678 9012".
 */
export function formatAadhaarGroups(value) {
  const d = onlyDigits(value);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Privacy mask: once the full 12 digits are present, show only the last 4 as
 * "XXXX XXXX 1234". While still typing, show the grouped digits so the user can
 * verify what they entered. WHY: reduces shoulder-surfing exposure of a
 * government ID number once entry is complete, while keeping entry usable.
 */
export function maskAadhaarForDisplay(value) {
  const d = onlyDigits(value);
  if (d.length < 12) return formatAadhaarGroups(d);
  return `XXXX XXXX ${d.slice(8)}`;
}
