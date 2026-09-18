import { User } from "../../models/User/user.model.js";
import { KycProfile } from "../../models/User/kycProfile.model.js";
import { logEvent } from "../../services/aadhaar/audit.service.js";
import { clientIp, deviceFingerprint } from "../../utils/aadhaar/requestContext.util.js";
import { processProfileImage, decodeBase64Image } from "../../utils/aadhaar/imageProcessing.util.js";
import { decryptField, decryptFieldToBuffer } from "../../utils/aadhaar/fieldEncryption.util.js";
import { uploadProfilePictureBuffer, deleteFile } from "../../services/s3.service.js";

/**
 * ============================================================================
 * APP PROFILE PICTURE — user-owned, mutable, independent of the Aadhaar KYC copy
 * ============================================================================
 *
 * These endpoints let a signed-in user change or remove their profile picture
 * at any time after registration. They operate EXCLUSIVELY on users.photoURL
 * (the app's existing profile-picture field; the "profilePictureUrl" of the
 * spec) and the associated S3 object.
 *
 * HARD RULE — the two photo copies are never cross-referenced:
 *   The Aadhaar-sourced KYC copy (kyc_profile.encrypted_photo) is permanent and
 *   immutable. Nothing here reads it, writes it, re-derives from it, or deletes
 *   it. Changing or removing the profile picture has ZERO effect on the KYC
 *   copy, and vice versa. The only place the KYC photo is ever used to seed a
 *   profile picture is at registration, and only with explicit consent.
 */

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * PUT /api/user/profile/picture  (authenticated)
 * Accepts a new image upload, runs it through the shared resize/compress/
 * strip-EXIF pipeline, uploads to S3, replaces users.photoURL, and deletes the
 * previous S3 object.
 */
export const updateProfilePicture = async (req, res) => {
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  try {
    const userId = req.user.id;

    if (!req.file || !req.file.buffer || !req.file.mimetype || !req.file.size) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }
    if (!ALLOWED_MIME.includes(req.file.mimetype)) {
      return res.status(415).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG or WebP images are allowed.",
      });
    }
    if (req.file.size > MAX_UPLOAD_BYTES) {
      return res.status(413).json({ success: false, message: "Image too large. Maximum size is 5MB." });
    }

    const UserModel = User();
    const existing = await UserModel.findById(userId).select("photoS3Key");
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Same pipeline the consented Aadhaar photo goes through at registration.
    const processed = await processProfileImage(req.file.buffer, { format: "webp" });
    const { fileUrl, s3Key, expiresAt } = await uploadProfilePictureBuffer(processed.buffer, {
      userId: String(userId),
      contentType: processed.contentType,
      extension: processed.extension,
    });

    const oldS3Key = existing.photoS3Key;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          photoURL: fileUrl,
          photoS3Key: s3Key,
          photoIsPermanent: true,
          photoURLExpiresAt: expiresAt,
        },
      },
      { new: true }
    ).select("-password -pin_hash -pin_salt");

    // Best-effort cleanup of the previous object. Never fail the request if the
    // old delete fails (the new picture is already live). We only ever delete
    // the profile-picture object — never anything under the KYC store.
    if (oldS3Key && oldS3Key !== s3Key) {
      try {
        await deleteFile(oldS3Key);
      } catch (delErr) {
        console.error("[updateProfilePicture] old object delete failed:", delErr.message);
      }
    }

    await logEvent("profile_photo_updated", {
      userId,
      ip,
      deviceFingerprint: fp,
      reason: "changed",
    });

    return res.status(200).json({
      success: true,
      message: "Profile picture updated.",
      user,
    });
  } catch (error) {
    console.error("[updateProfilePicture] error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to update profile picture." });
  }
};

/**
 * POST /api/user/profile/picture/from-aadhaar  (authenticated)
 *
 * Sets the signed-in user's profile picture FROM THEIR OWN stored Aadhaar KYC
 * photo. This is the "fetch from Aadhaar" action on the Profile screen — the
 * post-registration equivalent of the consent branch in registerSetPin.
 *
 * SEPARATION NOTE: this READS the user's own encrypted KYC photo (a read of
 * their own PII, by them) purely to derive the app profile picture. It NEVER
 * mutates or deletes the KYC copy — that copy stays immutable. It only writes
 * users.photoURL, exactly like the upload path. The two copies remain
 * independent; we are just seeding one from the other on explicit user action.
 */
export const setProfilePictureFromAadhaar = async (req, res) => {
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  try {
    const userId = req.user.id;
    const UserModel = User();
    const KycModel = KycProfile();

    const existing = await UserModel.findById(userId).select("photoS3Key");
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const kyc = await KycModel.findOne({ userId }).select("encrypted_photo");
    if (!kyc || !kyc.encrypted_photo) {
      return res.status(404).json({
        success: false,
        message: "No Aadhaar photo is available on your account.",
      });
    }

    // The KYC photo is stored as the provider's base64 STRING, encrypted. So we
    // decrypt to the base64 text, then base64-decode it into real image bytes.
    // (Decrypting straight to a buffer would give us the base64 characters, not
    // the decoded JPEG — sharp would reject that as "unsupported image format".)
    let rawPhoto = null;
    try {
      const photoBase64 = decryptField(kyc.encrypted_photo);
      rawPhoto = decodeBase64Image(photoBase64);
    } catch {
      rawPhoto = null;
    }
    if (!rawPhoto || rawPhoto.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Aadhaar photo is available on your account.",
      });
    }

    const processed = await processProfileImage(rawPhoto, { format: "webp" });
    const { fileUrl, s3Key, expiresAt } = await uploadProfilePictureBuffer(processed.buffer, {
      userId: String(userId),
      contentType: processed.contentType,
      extension: processed.extension,
    });

    const oldS3Key = existing.photoS3Key;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          photoURL: fileUrl,
          photoS3Key: s3Key,
          photoIsPermanent: true,
          photoURLExpiresAt: expiresAt,
        },
      },
      { new: true }
    ).select("-password -pin_hash -pin_salt");

    if (oldS3Key && oldS3Key !== s3Key) {
      try {
        await deleteFile(oldS3Key);
      } catch (delErr) {
        console.error("[setProfilePictureFromAadhaar] old object delete failed:", delErr.message);
      }
    }

    // Audit both the profile-picture change AND the fact the user read their
    // own KYC photo to derive it.
    await logEvent("pii_access", {
      userId,
      ip,
      deviceFingerprint: fp,
      reason: "self_kyc_photo_read_for_profile",
      meta: { field: "encrypted_photo" },
    });
    await logEvent("profile_photo_updated", {
      userId,
      ip,
      deviceFingerprint: fp,
      reason: "set_from_aadhaar",
    });

    return res.status(200).json({
      success: true,
      message: "Profile picture set from your Aadhaar photo.",
      user,
    });
  } catch (error) {
    console.error("[setProfilePictureFromAadhaar] error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to set profile picture from Aadhaar.",
    });
  }
};

/**
 * DELETE /api/user/profile/picture  (authenticated)
 * Clears users.photoURL back to empty (frontend falls back to default avatar /
 * initials) and deletes the S3 object. Does NOT touch the KYC copy.
 */
export const removeProfilePicture = async (req, res) => {
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  try {
    const userId = req.user.id;
    const UserModel = User();

    const existing = await UserModel.findById(userId).select("photoS3Key");
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const oldS3Key = existing.photoS3Key;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          photoURL: "",
          photoS3Key: "",
          photoIsPermanent: false,
          photoURLExpiresAt: null,
        },
      },
      { new: true }
    ).select("-password -pin_hash -pin_salt");

    if (oldS3Key) {
      try {
        await deleteFile(oldS3Key);
      } catch (delErr) {
        console.error("[removeProfilePicture] object delete failed:", delErr.message);
      }
    }

    await logEvent("profile_photo_updated", {
      userId,
      ip,
      deviceFingerprint: fp,
      reason: "removed",
    });

    return res.status(200).json({
      success: true,
      message: "Profile picture removed.",
      user,
    });
  } catch (error) {
    console.error("[removeProfilePicture] error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to remove profile picture." });
  }
};

/**
 * ============================================================================
 * KYC PHOTO RETRIEVAL — COMPLIANCE / ADMIN ONLY. Never called by the app UI.
 * ============================================================================
 * GET /api/user/kyc/photo/:userId  (authenticated + authorized)
 *
 * Decrypts and returns the immutable Aadhaar KYC photo (kyc_profile.
 * encrypted_photo). This is the ONLY read path for that copy. Every call emits
 * a `pii_access` audit event, exactly like other PII reads. It is intentionally
 * gated to privileged roles and is never wired into the normal frontend.
 */
export const getKycPhoto = async (req, res) => {
  const ip = clientIp(req);
  const fp = deviceFingerprint(req);
  try {
    // Authorization: compliance/admin roles only. The token role is set at
    // login; patients must never reach the KYC copy.
    const role = req.user?.role;
    const PRIVILEGED = ["admin", "founder", "compliance"];
    if (!PRIVILEGED.includes(role)) {
      // Audit the denied attempt as a PII access event too.
      await logEvent("pii_access", {
        userId: req.user?.id || null,
        ip,
        deviceFingerprint: fp,
        reason: "kyc_photo_read_denied",
        meta: { targetUserId: req.params.userId || null, role: role || null },
      });
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    const targetUserId = req.params.userId;
    const KycModel = KycProfile();
    const kyc = await KycModel.findOne({ userId: targetUserId }).select("encrypted_photo");

    // Always audit the read attempt BEFORE returning any PII.
    await logEvent("pii_access", {
      userId: req.user.id,
      ip,
      deviceFingerprint: fp,
      reason: "kyc_photo_read",
      meta: { targetUserId, field: "encrypted_photo", found: !!(kyc && kyc.encrypted_photo) },
    });

    if (!kyc || !kyc.encrypted_photo) {
      return res.status(404).json({ success: false, message: "No KYC photo on file." });
    }

    const buffer = decryptFieldToBuffer(kyc.encrypted_photo);
    if (!buffer || buffer.length === 0) {
      return res.status(404).json({ success: false, message: "No KYC photo on file." });
    }

    // Return the raw bytes. Not cacheable; not a public URL.
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "no-store, private");
    return res.status(200).end(buffer);
  } catch (error) {
    console.error("[getKycPhoto] error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to retrieve KYC photo." });
  }
};
