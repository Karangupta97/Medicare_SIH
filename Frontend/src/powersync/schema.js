import { Schema, Table, column } from "@powersync/web";

/**
 * Local SQLite schema mirroring the PowerSync buckets (see
 * Backend/powersync/sync-rules.yaml). These tables are the LOCAL read model the
 * dashboard sidebar screens read from — populated by PowerSync from the user's
 * MongoDB documents and kept in sync.
 *
 * API NOTE (@powersync/web v2): `column.text` / `column.integer` are column
 * DESCRIPTORS (not functions). A Table is constructed as
 * `new Table({ colName: column.text, num: column.integer }, { indexes, localOnly })`,
 * and the Schema is a map of `{ tableName: Table }` — the object key is the
 * synced table name (matching the sync-rule bucket outputs).
 *
 * NOTES:
 *  - Mongo `_id` maps to the implicit `id` column (sync rules alias `_id AS id`).
 *  - Array/subdocument fields (tags, medications, members, reportIds, allergies)
 *    arrive as JSON text → declared TEXT and parsed in the read hooks.
 *  - NO file blobs. Reports keep s3Key/fileSize only. `available_offline` is a
 *    LOCAL-ONLY flag used to opt a report into full-file caching.
 */

export const AppSchema = new Schema({
  // users (self) — dashboard header, plan label, emergency-folder identity.
  users: new Table({
    umid: column.text,
    name: column.text,
    lastname: column.text,
    planType: column.text,
    bloodGroup: column.text,
    photoURL: column.text,
    role: column.text,
    addressLine1: column.text,
    addressLine2: column.text,
    district: column.text,
    state: column.text,
    postalCode: column.text,
  }),

  reports: new Table(
    {
      userId: column.text,
      filename: column.text,
      originalFilename: column.text,
      description: column.text,
      reportType: column.text,
      s3Key: column.text,
      fileSize: column.integer,
      contentType: column.text,
      category: column.text,
      tags: column.text, // JSON array as text
      isPrivate: column.integer,
      inEmergencyFolder: column.integer,
      createdAt: column.text,
      updatedAt: column.text,
    },
    { indexes: { by_user: ["userId"] } }
  ),

  notifications: new Table(
    {
      userId: column.text,
      title: column.text,
      message: column.text,
      type: column.text,
      read: column.integer,
      link: column.text,
      createdAt: column.text,
      updatedAt: column.text,
    },
    { indexes: { by_user: ["userId"] } }
  ),

  medicalinfos: new Table({
    userId: column.text,
    allergies: column.text, // JSON array as text
    emergencyContact: column.text,
    emergencyContactPhone: column.text,
  }),

  reportshares: new Table(
    {
      patientId: column.text,
      doctorName: column.text,
      doctorId: column.text,
      reportIds: column.text, // JSON array as text
      accessDuration: column.text,
      expiresAt: column.text,
      status: column.text,
      createdAt: column.text,
      updatedAt: column.text,
    },
    { indexes: { by_patient: ["patientId"] } }
  ),

  prescriptions: new Table(
    {
      patientId: column.text,
      patientName: column.text,
      patientUMID: column.text,
      doctor: column.text,
      doctorId: column.text,
      hospitalName: column.text,
      diagnosis: column.text,
      medications: column.text, // JSON array as text
      notes: column.text,
      createdAt: column.text,
    },
    { indexes: { by_patient: ["patientId"] } }
  ),

  familyvaults: new Table({
    headMember: column.text,
    name: column.text,
    members: column.text, // JSON array as text
    planType: column.text,
    maxMembers: column.integer,
    createdAt: column.text,
    updatedAt: column.text,
  }),

  familyvaultinvites: new Table({
    vaultId: column.text,
    invitedBy: column.text,
    inviteeUmid: column.text,
    inviteeUserId: column.text,
    relationship: column.text,
    status: column.text,
    createdAt: column.text,
    updatedAt: column.text,
  }),

  // ---- LOCAL-ONLY tables (never synced; client-only state) ----
  // Which reports the user opted to cache fully offline.
  report_local_flags: new Table(
    {
      reportId: column.text,
      available_offline: column.integer,
      cached_at: column.text,
    },
    { localOnly: true }
  ),

  // Prescription reminders are purely client-side today (no backend model).
  reminders: new Table(
    {
      prescriptionId: column.text,
      medicationName: column.text,
      time: column.text,
      frequency: column.text,
      enabled: column.integer,
      createdAt: column.text,
    },
    { localOnly: true }
  ),
});
