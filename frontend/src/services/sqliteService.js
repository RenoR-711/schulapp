// src/services/sqliteService.js
// @ts-nocheck
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite } from "@capacitor-community/sqlite";

export const sqliteService = {
  db: null,
  isOpen: false,
  dbName: "app_db",

  // ------------------------------------------------------------
  // DB initialisieren
  // ------------------------------------------------------------
  async init(dbName = "app_db") {
    this.dbName = dbName;

    if (!Capacitor.isNativePlatform()) {
      console.warn("SQLite: Native Plattform erforderlich!");
      return false;
    }

    if (this.isOpen && this.db) return true;

    try {
      this.db = await CapacitorSQLite.createConnection({
        database: dbName,
        version: 1,
      });
      await this.db.open();
      this.isOpen = true;

      // Auth-Tabelle
      await this.db.execute(`
        CREATE TABLE IF NOT EXISTS auth (
          id INTEGER PRIMARY KEY NOT NULL,
          key TEXT,
          user TEXT,
          created_at TEXT
        )
      `);

      return true;
    } catch (e) {
      console.error("SQLite init error:", e);
      this.isOpen = false;
      return false;
    }
  },

  // ------------------------------------------------------------
  // Demo-Daten einfügen
  // ------------------------------------------------------------
  async fillDemoData() {
    const ok = await this.init();
    if (!ok) return false;

    const res = await this.db.query(`SELECT COUNT(*) as c FROM auth`);
    if (res.values?.[0]?.c > 0) return false; // bereits Daten vorhanden

    const demoUser = {
      username: "test",
      password: "1234",
      name: "Max Mustermann",
      klasse: "10A",
    };

    const demoKey = "DEMO-SESSION-001";

    await this.setAuth({ key: demoKey, user: demoUser });
    console.log("SQLite-Datenbank mit Demo-User gefüllt!");
    return true;
  },

  // ------------------------------------------------------------
  // Benutzer + Key speichern
  // ------------------------------------------------------------
  async setAuth({ key, user }) {
    if (!this.isOpen) await this.init();

    await this.db.execute(`DELETE FROM auth`);
    await this.db.execute(
      `INSERT INTO auth (key, user, created_at) VALUES (?, ?, ?)`,
      [key, JSON.stringify(user), new Date().toISOString()]
    );

    return true;
  },

  // ------------------------------------------------------------
  // Auth auslesen
  // ------------------------------------------------------------
  async getAuth() {
    const ok = await this.init();
    if (!ok) return null;

    const res = await this.db.query(`SELECT key, user FROM auth LIMIT 1`);
    if (!res.values?.[0]) return null;
    return {
      key: res.values[0].key,
      user: JSON.parse(res.values[0].user),
    };
  },

  async getKey() {
    if (!this.isOpen) await this.init();
    const res = await this.db.query(`SELECT key FROM auth LIMIT 1`);
    return res.values?.[0]?.key || null;
  },

  // ------------------------------------------------------------
  // Auth löschen
  // ------------------------------------------------------------
  async removeAuth() {
    const ok = await this.init();
    if (!ok) return false;

    await this.db.execute(`DELETE FROM auth`);
    return true;
  },

  // ------------------------------------------------------------
  // DB schließen
  // ------------------------------------------------------------
  async close() {
    if (!this.isOpen || !this.db) return false;

    try {
      await this.db.close();
      await CapacitorSQLite.closeConnection({ database: this.dbName });

      this.isOpen = false;
      this.db = null;
      return true;
    } catch (e) {
      console.error("SQLite close error:", e);
      return false;
    }
  },
};
