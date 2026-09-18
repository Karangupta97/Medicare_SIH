import axios from "axios";
import { TOKEN_ENDPOINT, WRITE_ENDPOINT } from "./config";
import { safeStorageAccess } from "../utils/errorHandling";

/**
 * PowerSync backend connector.
 *
 * Implements the two callbacks PowerSync needs:
 *  - fetchCredentials(): get a fresh per-user PowerSync JWT from our backend
 *    (GET /api/powersync/token). Returns null if the server says PowerSync is
 *    not configured (501) so the client stays offline-capable-but-not-syncing
 *    rather than erroring.
 *  - uploadData(): drain the local upload queue and POST each batch of offline
 *    mutations to /api/powersync/write. Only notification-read + report-metadata
 *    ops are accepted server-side; everything else is server-wins.
 */
export class MedicareBackendConnector {
  /**
   * @returns {Promise<{endpoint:string, token:string}|null>}
   */
  async fetchCredentials() {
    const appToken = safeStorageAccess.getItem("token");
    if (!appToken) return null; // not logged in → nothing to sync

    try {
      const res = await axios.get(TOKEN_ENDPOINT, {
        headers: { Authorization: `Bearer ${appToken}` },
        withCredentials: true,
      });
      const { token, powersync_url } = res.data || {};
      if (!token || !powersync_url) return null;
      return { endpoint: powersync_url, token };
    } catch (err) {
      // 501 = PowerSync not configured on the server → fall back silently.
      if (err.response?.status === 501) return null;
      // 401 = app session expired; let PowerSync retry after re-auth.
      console.warn("[powersync] fetchCredentials failed:", err.message);
      return null;
    }
  }

  /**
   * Drain and upload the local write queue.
   * @param {import('@powersync/web').AbstractPowerSyncDatabase} database
   */
  async uploadData(database) {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) return;

    // Translate PowerSync CRUD entries into our /write batch shape.
    const batch = transaction.crud.map((entry) => ({
      // entry.op is 'PUT' | 'PATCH' | 'DELETE'
      op: entry.op,
      table: entry.table,
      id: entry.id,
      data: entry.opData || {},
    }));

    const appToken = safeStorageAccess.getItem("token");
    try {
      await axios.post(
        WRITE_ENDPOINT,
        { batch },
        { headers: { Authorization: `Bearer ${appToken}` }, withCredentials: true }
      );
      // Mark the transaction complete so it's removed from the local queue.
      await transaction.complete();
    } catch (err) {
      // Non-recoverable client errors (4xx other than 401/429) should not block
      // the queue forever — complete them so we don't loop, but log loudly.
      const status = err.response?.status;
      if (status && status >= 400 && status < 500 && status !== 401 && status !== 429) {
        console.error(
          `[powersync] upload rejected (${status}); dropping op to avoid a stuck queue:`,
          err.response?.data
        );
        await transaction.complete();
        return;
      }
      // Otherwise rethrow so PowerSync retries with backoff when back online.
      throw err;
    }
  }
}

// Alias matching the name used in the PowerSync setup wizard / docs examples
// (`new Connector()`). This is the SAME connector as MedicareBackendConnector —
// it fetches a real per-user JWT from the backend token endpoint rather than a
// hardcoded development token, and fully implements uploadData.
export { MedicareBackendConnector as Connector };
