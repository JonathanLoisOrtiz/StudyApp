import * as SQLite from 'expo-sqlite';

export interface QueryResult<T = any> { rows: T[] }

// Use new Expo SDK 51+ synchronous API
const db = SQLite.openDatabaseSync('anki.db');

export async function runMigrations(): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS decks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );`);
    await db.execAsync(`CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deck_id INTEGER NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      queue INTEGER NOT NULL,
      type INTEGER NOT NULL,
      due INTEGER NOT NULL,
      interval INTEGER NOT NULL,
      ease INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      lapses INTEGER NOT NULL,
      left INTEGER NOT NULL,
      original_due INTEGER,
      FOREIGN KEY(deck_id) REFERENCES decks(id) ON DELETE CASCADE
    );`);
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_cards_deck_due ON cards(deck_id, due);');
    await db.execAsync(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);`);
  });
}

export async function getMeta(key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key=?', [key]);
  return row?.value ?? null;
}

export async function setMeta(key: string, value: string): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO meta(key,value) VALUES(?,?)', [key, value]);
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
  const rows = await db.getAllAsync<any>(sql, params);
  return { rows };
}

export async function execute(sql: string, params: any[] = []): Promise<number> {
  const res: any = await db.runAsync(sql, params);
  return res.lastInsertRowId ?? 0;
}

// Debug helper: fetch all cards
export async function allCards(): Promise<any[]> {
  const rows = await db.getAllAsync<any>('SELECT * FROM cards ORDER BY id DESC');
  return rows;
}
