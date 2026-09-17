import { describe, it, expect } from "vitest";
import { isValidAadhaarNumber, verhoeffValidate, formatAadhaarGroups, maskAadhaarForDisplay } from "../verhoeff";
import { validatePinStrength } from "../pin";

// Compute a Verhoeff-valid 12-digit number from 11 digits (self-contained; no
// real Aadhaar used).
function withCheckDigit(eleven) {
  const d = [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
    [9,8,7,6,5,4,3,2,1,0],
  ];
  const p = [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8],
  ];
  const inv = [0,4,3,2,1,5,6,7,8,9];
  let c = 0;
  const rev = eleven.split("").reverse();
  for (let i = 0; i < rev.length; i++) c = d[c][p[(i + 1) % 8][parseInt(rev[i], 10)]];
  return eleven + inv[c];
}

const VALID = withCheckDigit("23456789012");

describe("Aadhaar validators (client-side gate)", () => {
  it("accepts a Verhoeff-valid 12-digit number", () => {
    expect(verhoeffValidate(VALID)).toBe(true);
    expect(isValidAadhaarNumber(VALID)).toBe(true);
  });
  it("rejects malformed / wrong-checksum numbers", () => {
    expect(isValidAadhaarNumber("1234")).toBe(false);
    expect(isValidAadhaarNumber("0" + VALID.slice(1))).toBe(false); // first digit 0
    const bad = VALID.slice(0, 11) + ((parseInt(VALID[11], 10) + 1) % 10);
    expect(isValidAadhaarNumber(bad)).toBe(false);
  });
  it("formats and masks for display", () => {
    expect(formatAadhaarGroups("123456789012")).toBe("1234 5678 9012");
    expect(maskAadhaarForDisplay("123456789012")).toBe("XXXX XXXX 9012");
    // partial entry stays grouped, not masked
    expect(maskAadhaarForDisplay("12345")).toBe("1234 5");
  });
});

describe("PIN strength (mirrors backend denylist)", () => {
  it("rejects weak PINs", () => {
    expect(validatePinStrength("123456").valid).toBe(false);
    expect(validatePinStrength("654321").valid).toBe(false);
    expect(validatePinStrength("111111").valid).toBe(false);
    expect(validatePinStrength("000000").valid).toBe(false);
    expect(validatePinStrength("123123").valid).toBe(false);
    expect(validatePinStrength("12345").valid).toBe(false);
  });
  it("accepts a non-trivial PIN", () => {
    expect(validatePinStrength("428173").valid).toBe(true);
  });
});
