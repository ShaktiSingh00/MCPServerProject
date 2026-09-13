import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// node:sqlite is built into Node 22.5+ (stable enough here for a learning
// project). If you ever need a non-experimental driver, better-sqlite3 has
// the same synchronous prepare().get()/all()/run() API — swap the import.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "inventory.db");

export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON");

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
db.exec(schema);
