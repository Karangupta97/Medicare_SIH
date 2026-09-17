/**
 * Client-side PIN strength validation.
 *
 * WHY: mirrors the backend denylist/rules (Backend/utils/aadhaar/pin.util.js)
 * so the user gets INSTANT feedback ("PIN too common") instead of a round-trip
 * rejection. The BACKEND remains the authority — this is a UX convenience only,
 * and we never weaken the backend check based on it.
 */

// Keep in sync with the backend PIN_DENYLIST.
const PIN_DENYLIST = new Set([
  "000000", "111111", "222222", "333333", "444444", "555555",
  "666666", "777777", "888888", "999999",
  "123456", "654321", "123123", "112233", "121212", "123321",
  "789456", "159357", "100000", "101010", "011011", "696969",
]);

/**
 * @param {string} pin
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validatePinStrength(pin) {
  if (typeof pin !== "string" || !/^\d{6}$/.test(pin)) {
    return { valid: false, reason: "PIN must be exactly 6 digits." };
  }
  if (/^(\d)\1{5}$/.test(pin)) {
    return { valid: false, reason: "PIN cannot be the same digit repeated." };
  }
  const digits = pin.split("").map(Number);
  const ascending = digits.every((d, i) => i === 0 || d === digits[i - 1] + 1);
  const descending = digits.every((d, i) => i === 0 || d === digits[i - 1] - 1);
  if (ascending || descending) {
    return { valid: false, reason: "PIN cannot be a sequential run of digits." };
  }
  if (PIN_DENYLIST.has(pin)) {
    return { valid: false, reason: "PIN is too common. Choose a less predictable one." };
  }
  return { valid: true };
}
