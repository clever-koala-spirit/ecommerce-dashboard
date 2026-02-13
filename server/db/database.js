import initSqlJs from 'sql.js';

let db = null;

const SQL = await initSqlJs();

export async function initDB() {
  db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS metric_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      source TEXT NOT NULL,
      metric TEXT NOT NULL,
      value REAL NOT NULL,
      dimensions TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      status TEXT NOT NULL,
      records_synced INTEGER,
      error_message TEXT,
      synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS forecast_accuracy (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric TEXT NOT NULL,
      forecast_date TEXT NOT NULL,
      horizon_days INTEGER NOT NULL,
      predicted REAL NOT NULL,
      actual REAL,
      method TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS fixed_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      monthly_amount REAL NOT NULL,
      category TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS credentials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL UNIQUE,
      encrypted_data TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_metric_snapshots_date_source
    ON metric_snapshots(date, source);
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_sync_log_source
    ON sync_log(source);
  `);

  return db;
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

export function saveSnapshot(date, source, metric, value, dimensions = null) {
  const db = getDB();
  const dimensionsJson = dimensions ? JSON.stringify(dimensions) : null;

  db.run(
    `INSERT INTO metric_snapshots (date, source, metric, value, dimensions)
     VALUES (?, ?, ?, ?, ?)`,
    [date, source, metric, value, dimensionsJson]
  );
}

export function getHistory(metric, dateRange, granularity = 'daily') {
  const db = getDB();

  const query = `
    SELECT date, metric, value, source, dimensions
    FROM metric_snapshots
    WHERE metric = ?
      AND date >= ?
      AND date <= ?
    ORDER BY date ASC
  `;

  const results = db.exec(query, [metric, dateRange.start, dateRange.end]);

  if (results.length === 0) return [];

  return results[0].values.map((row) => ({
    date: row[0],
    metric: row[1],
    value: row[2],
    source: row[3],
    dimensions: row[4] ? JSON.parse(row[4]) : null,
  }));
}

export function getDataCoverage() {
  const db = getDB();

  const sources = ['shopify', 'meta', 'google', 'klaviyo', 'ga4'];
  const coverage = {};

  sources.forEach((source) => {
    const result = db.exec(
      `SELECT MIN(date) as earliest, MAX(date) as latest, COUNT(*) as records
       FROM metric_snapshots WHERE source = ?`,
      [source]
    );

    if (result.length > 0 && result[0].values.length > 0) {
      const [earliest, latest, records] = result[0].values[0];
      coverage[source] = {
        earliest,
        latest,
        records,
        daysOfData: earliest && latest ? calculateDaysDiff(earliest, latest) : 0,
      };
    } else {
      coverage[source] = { earliest: null, latest: null, records: 0, daysOfData: 0 };
    }
  });

  return coverage;
}

export function logSync(source, status, recordsSynced = 0, errorMessage = null) {
  const db = getDB();

  db.run(
    `INSERT INTO sync_log (source, status, records_synced, error_message)
     VALUES (?, ?, ?, ?)`,
    [source, status, recordsSynced, errorMessage]
  );
}

export function saveCost(label, monthlyAmount, category = null) {
  const db = getDB();

  db.run(
    `INSERT INTO fixed_costs (label, monthly_amount, category)
     VALUES (?, ?, ?)`,
    [label, monthlyAmount, category]
  );
}

export function getCosts() {
  const db = getDB();

  const results = db.exec(
    `SELECT id, label, monthly_amount, category, is_active, created_at
     FROM fixed_costs
     ORDER BY created_at DESC`
  );

  if (results.length === 0) return [];

  return results[0].values.map((row) => ({
    id: row[0],
    label: row[1],
    monthlyAmount: row[2],
    category: row[3],
    isActive: row[4] === 1,
    createdAt: row[5],
  }));
}

export function updateCost(id, label, monthlyAmount, category) {
  const db = getDB();

  db.run(
    `UPDATE fixed_costs
     SET label = ?, monthly_amount = ?, category = ?
     WHERE id = ?`,
    [label, monthlyAmount, category, id]
  );
}

export function deleteCost(id) {
  const db = getDB();

  db.run(`DELETE FROM fixed_costs WHERE id = ?`, [id]);
}

export function toggleCostActive(id, isActive) {
  const db = getDB();

  db.run(
    `UPDATE fixed_costs SET is_active = ? WHERE id = ?`,
    [isActive ? 1 : 0, id]
  );
}

export function getLastSyncLog(source) {
  const db = getDB();

  const results = db.exec(
    `SELECT status, records_synced, error_message, synced_at
     FROM sync_log
     WHERE source = ?
     ORDER BY synced_at DESC
     LIMIT 1`,
    [source]
  );

  if (results.length === 0) return null;

  const [status, recordsSynced, errorMessage, syncedAt] = results[0].values[0];
  return { status, recordsSynced, errorMessage, syncedAt };
}

function calculateDaysDiff(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
