// src/services/syncService.js
import axios from "axios";
import { sqliteService } from "./sqliteService";
import { authService } from "./authService";

export const syncService = {
  async sync() {
    if (!authService.isLoggedIn) return;

    const unsynced = await sqliteService.getUnsynced();
    if (unsynced.length > 0) {
      const res = await axios.post(
        "https://your-server.com/api/selection",
        unsynced,
        {
          headers: { Authorization: `Bearer ${authService.token}` },
        }
      );
      const syncedIds = unsynced.map((u) => u.id);
      await sqliteService.markSynced(syncedIds);
    }

    // Updates vom Server holen (z.B. Menüänderungen)
    const serverData = await axios.get("https://your-server.com/api/updates", {
      headers: { Authorization: `Bearer ${authService.token}` },
    });
    // TODO: serverData in SQLite speichern
  },
};
