/**
 * Verhoeff checksum validation for Aadhaar numbers.
 *
 * WHY: UIDAI Aadhaar numbers embed a Verhoeff check digit as their 12th digit.
 * Validating the checksum locally lets us reject typos and a large fraction of
 * random/enumerated numbers BEFORE spending a paid Sandbox OKYC API call and
 * before any network round-trip — this is both a cost control and an
 * enumeration-resistance control (invalid numbers never reach the provider).
 *
 * This is a pure, offline algorithm. It does NOT confirm the Aadhaar exists —
 * only that the number is well-formed. Existence is proven by OTP verification.
 *
 * Reference: Verhoeff algorithm (dihedral group D5) multiplication (d),
 * permutation (p) and inverse (inv) tables.
 */

// Multiplication table (D5 dihedral group)
const d = [
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

// Permutation table
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Validates the Verhoeff checksum of a numeric string.
 * @param {string} num - digits only
 * @returns {boolean}
 */
export function verhoeffValidate(num) {
  if (typeof num !== "string" || !/^\d+$/.test(num)) return false;
  let c = 0;
  const reversed = num.split("").reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = d[c][p[i % 8][parseInt(reversed[i], 10)]];
  }
  return c === 0;
}

/**
 * Full Aadhaar format + checksum validation.
 * WHY server-side: never trust client validation for an identity number. We
 * enforce exactly 12 digits AND a valid Verhoeff check digit before any
 * external call.
 * @param {string} aadhaar
 * @returns {boolean}
 */
export function isValidAadhaarNumber(aadhaar) {
  if (typeof aadhaar !== "string") return false;
  // Exactly 12 digits, no separators. First digit of a real Aadhaar is never
  // 0 or 1 per UIDAI rules — we enforce that as an extra cheap sanity check.
  if (!/^[2-9]\d{11}$/.test(aadhaar)) return false;
  return verhoeffValidate(aadhaar);
}
