
import { ScanRecord, AuditLog, StaffDetails } from "../types";

const DB_NAME = "FraudGuardDB";
const DB_VERSION = 1;

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("scans")) {
          db.createObjectStore("scans", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("auditLogs")) {
          db.createObjectStore("auditLogs", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event: any) => {
        reject("IndexedDB init error");
      };
    });
  }

  private async getStore(name: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(name, mode);
    return transaction.objectStore(name);
  }

  // Scans
  async saveScan(scan: ScanRecord): Promise<void> {
    const store = await this.getStore("scans", "readwrite");
    return new Promise((resolve) => {
      const request = store.put(scan);
      request.onsuccess = () => resolve();
    });
  }

  async getAllScans(): Promise<ScanRecord[]> {
    const store = await this.getStore("scans", "readonly");
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  // Audit Logs
  async saveAuditLog(log: AuditLog): Promise<void> {
    const store = await this.getStore("auditLogs", "readwrite");
    return new Promise((resolve) => {
      const request = store.put(log);
      request.onsuccess = () => resolve();
    });
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    const store = await this.getStore("auditLogs", "readonly");
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clearAuditLogs(): Promise<void> {
    const store = await this.getStore("auditLogs", "readwrite");
    return new Promise((resolve) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
    });
  }

  // Settings
  async saveSettings(settings: StaffDetails): Promise<void> {
    const store = await this.getStore("settings", "readwrite");
    return new Promise((resolve) => {
      const request = store.put(settings, "staff");
      request.onsuccess = () => resolve();
    });
  }

  async getSettings(): Promise<StaffDetails | null> {
    const store = await this.getStore("settings", "readonly");
    return new Promise((resolve) => {
      const request = store.get("staff");
      request.onsuccess = () => resolve(request.result || null);
    });
  }
}

export const db = new DatabaseService();
