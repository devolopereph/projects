import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'menu.db');

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    db = new Database(dbPath);
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function runQuery(query: string, params: unknown[] = []): Promise<{ id: number; changes: number }> {
  return new Promise((resolve, reject) => {
    try {
      const db = getDb();
      // Debug log for import errors
      if (process.env.NODE_ENV !== 'production') {
        console.log('SQL RUN:', query, params);
      }
      const stmt = db.prepare(query);
      const result = stmt.run(params);
      resolve({ 
        id: result.lastInsertRowid as number, 
        changes: result.changes 
      });
    } catch (err) {
      console.error('SQLITE ERROR:', query, params, err);
      reject(err);
    }
  });
}

export function getQuery(query: string, params: unknown[] = []): Promise<unknown> {
  return new Promise((resolve, reject) => {
    try {
      const db = getDb();
      const stmt = db.prepare(query);
      const result = stmt.get(params);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}

export function allQuery(query: string, params: unknown[] = []): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    try {
      const db = getDb();
      const stmt = db.prepare(query);
      const result = stmt.all(params);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}