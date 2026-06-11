import { openDB, type IDBPDatabase } from "idb";

interface QueuedMutation {
  id: string;
  hook: string;
  variables: unknown;
  timestamp: number;
}

const DB_NAME = "showroom-offline";
const STORE_NAME = "mutations";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export const OfflineQueue = {
  async enqueue(hook: string, variables: unknown): Promise<void> {
    const db = await getDB();
    const item: QueuedMutation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      hook,
      variables,
      timestamp: Date.now(),
    };
    await db.put(STORE_NAME, item);
  },

  async getAll(): Promise<QueuedMutation[]> {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  async remove(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  async getPendingCount(): Promise<number> {
    const db = await getDB();
    return db.count(STORE_NAME);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
  },
};