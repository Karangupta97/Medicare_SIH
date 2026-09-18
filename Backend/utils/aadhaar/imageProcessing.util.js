import sharp from "sharp";

/**
 * Shared image-processing pipeline for APP PROFILE PICTURES.
 *
 * Used by BOTH:
 *   1) Aadhaar registration (only when the user consents to reuse their Aadhaar
 *      photo as their profile picture), and
 *   2) the authenticated "change profile picture" endpoint (PUT /profile/picture).
 *
 * Keeping this in ONE place guarantees every profile picture — whether sourced
 * from Aadhaar at registration or uploaded later by the user — is normalized the
 * same way: bounded dimensions, EXIF stripped, re-encoded to a web-friendly
 * format. That consistency matters for privacy (EXIF can carry GPS/device data)
 * and for predictable storage/rendering.
 *
 * IMPORTANT (separation of the two photo copies):
 *   This pipeline ONLY ever produces the *app profile picture* artifact. It is
 *   never used to derive, mutate, or re-encode the immutable Aadhaar KYC copy
 *   (kyc_profile.encrypted_photo). The KYC copy is the raw decoded buffer,
 *   encrypted at rest, and is stored/retrieved through a completely separate
 *   path. See registerSetPin() and the KYC photo retrieval route for the "why".
 */

const MAX_DIMENSION = 512; // max width/height in px (requirement: 512x512)

/**
 * Resize/compress an image buffer for use as a profile picture.
 *  - Bounds the largest side to MAX_DIMENSION (never upscales small images).
 *  - `.rotate()` (with no args) applies the EXIF orientation, then all metadata
 *    is dropped on encode — this strips EXIF (incl. any GPS) from the output.
 *  - Re-encodes to WebP by default (JPEG fallback via `format: "jpeg"`).
 *
 * @param {Buffer} inputBuffer raw decoded image bytes
 * @param {object} [opts]
 * @param {"webp"|"jpeg"} [opts.format="webp"] output format
 * @param {number} [opts.quality=82] encoder quality (1-100)
 * @returns {Promise<{ buffer: Buffer, contentType: string, extension: string }>}
 */
export async function processProfileImage(inputBuffer, opts = {}) {
  if (!Buffer.isBuffer(inputBuffer) || inputBuffer.length === 0) {
    throw new Error("processProfileImage: a non-empty image Buffer is required");
  }

  const format = opts.format === "jpeg" ? "jpeg" : "webp";
  const quality = Number.isFinite(opts.quality) ? opts.quality : 82;

  // Fail fast (and safely) on non-image / corrupt input before we try to encode.
  const pipeline = sharp(inputBuffer, { failOn: "error" })
    .rotate() // bake in EXIF orientation...
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside", // preserve aspect ratio, fit within the box
      withoutEnlargement: true, // never upscale a smaller source
    });

  // Encoding without calling .withMetadata() means EXIF/ICC/etc. are NOT copied
  // to the output — the profile picture leaves with no embedded metadata.
  const buffer =
    format === "jpeg"
      ? await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
      : await pipeline.webp({ quality }).toBuffer();

  return format === "jpeg"
    ? { buffer, contentType: "image/jpeg", extension: "jpg" }
    : { buffer, contentType: "image/webp", extension: "webp" };
}

/**
 * Decode a `data:image/...;base64,...` data URL (or a bare base64 string) into a
 * raw Buffer. Used to turn the Aadhaar KYC `photo` field into bytes server-side.
 *
 * SECURITY: the caller must never log or return the returned buffer / the input
 * base64 to the client or to application logs — it is raw Aadhaar PII.
 *
 * @param {string} dataUrlOrBase64
 * @returns {Buffer|null} decoded bytes, or null if input is empty
 */
export function decodeBase64Image(dataUrlOrBase64) {
  if (!dataUrlOrBase64) return null;
  const str = String(dataUrlOrBase64).trim();
  // Strip an optional data-URL prefix: data:image/jpeg;base64,<payload>
  const commaIdx = str.indexOf(",");
  const base64 = str.startsWith("data:") && commaIdx !== -1 ? str.slice(commaIdx + 1) : str;
  const buf = Buffer.from(base64, "base64");
  return buf.length > 0 ? buf : null;
}
