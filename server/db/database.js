import initSqlJs from 'sql.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

let db = null;
const SQL = await initSqlJs();

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'ecommerce.db');

// --- Encryption helpers (AES-256-GCM) ---
let _encryptionKey = null;

function getEncryptionKey() {
  if (!_encryptionKey) {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required but not set');
    }
    _encryptionKey = Buffer.from(key, 'hex');
  }
  return _encryptionKey;
}

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText) {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// --- Database file operations ---
function ensureDataDirectory() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function saveDatabaseToFile() {
  try {
    ensureDataDirectory();
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (error) {
    console.error('[Database] Error saving to file:', error);
  }
}

function loadDatabaseFromFile() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH);
      return new SQL.Database(data);
    }
    return new SQL.Database();
  } catch (error) {
    console.error('[Database] Error loading from file:', error);
    return new SQL.Database();
  }
}

// Auto-save every 30 seconds
let saveInterval;
function startAutoSave() {
  if (saveInterval) clearInterval(saveInterval);
  saveInterval = setInterval(() => {
    if (db) saveDatabaseToFile();
  }, 30000);
}

// Save on process exit
process.on('exit', () => {
  if (db) saveDatabaseToFile();
});

process.on('SIGINT', () => {
  if (db) saveDatabaseToFile();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (db) saveDatabaseToFile();
  process.exit(0);
});

// --- Database initialization ---
export async function initDB() {
  db = loadDatabaseFromFile();

  // Users table — stores dashboard user accounts
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      hashed_password TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login_at TIMESTAMP
    );
  `);

  // Reset tokens table — stores password reset tokens
  db.run(`
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // OAuth states table — stores OAuth state and PKCE verifiers
  db.run(`
    CREATE TABLE IF NOT EXISTS oauth_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      state TEXT NOT NULL,
      verifier TEXT,
      shop_domain TEXT DEFAULT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(platform, state)
    );
  `);

  // Shops table — stores each installed Shopify store
  db.run(`
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_domain TEXT NOT NULL UNIQUE,
      access_token_encrypted TEXT NOT NULL,
      scope TEXT,
      shop_name TEXT,
      shop_email TEXT,
      plan_name TEXT,
      installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      uninstalled_at TIMESTAMP,
      is_active BOOLEAN DEFAULT 1,
      nonce TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Sessions table — Shopify OAuth sessions
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      shop_domain TEXT NOT NULL,
      state TEXT,
      is_online BOOLEAN DEFAULT 0,
      access_token_encrypted TEXT,
      scope TEXT,
      expires_at TIMESTAMP,
      online_access_info TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Platform connections — stores OAuth tokens for Meta, Google, Klaviyo, GA4 per shop
  // Supports multiple accounts per platform via account_id
  db.run(`
    CREATE TABLE IF NOT EXISTS platform_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_domain TEXT NOT NULL,
      platform TEXT NOT NULL,
      account_id TEXT DEFAULT 'default',
      credentials_encrypted TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      last_sync_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(shop_domain, platform, account_id)
    );
  `);

  // Metric snapshots — now per-shop
  db.run(`
    CREATE TABLE IF NOT EXISTS metric_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_domain TEXT NOT NULL,
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
      shop_domain TEXT NOT NULL,
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
      shop_domain TEXT NOT NULL,
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
      shop_domain TEXT NOT NULL,
      label TEXT NOT NULL,
      monthly_amount REAL NOT NULL,
      category TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Webhook log — for audit trail
  db.run(`
    CREATE TABLE IF NOT EXISTS webhook_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      shop_domain TEXT NOT NULL,
      topic TEXT NOT NULL,
      payload_hash TEXT,
      processed BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Chat conversations — for AI chat assistant
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id TEXT PRIMARY KEY,
      visitor_email TEXT,
      messages TEXT NOT NULL,
      needs_human INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: add account_id column to platform_connections if missing
  try {
    const cols = db.exec(`PRAGMA table_info(platform_connections)`);
    const colNames = cols.length > 0 ? cols[0].values.map(r => r[1]) : [];
    if (!colNames.includes('account_id')) {
      db.run(`ALTER TABLE platform_connections ADD COLUMN account_id TEXT DEFAULT 'default'`);
      // Recreate unique index to include account_id
      db.run(`DROP INDEX IF EXISTS idx_platform_conn`);
    }
  } catch (e) {
    // Ignore migration errors on fresh DB
  }

  // Migration: add shop_domain column to users table
  try {
    const cols = db.exec(`PRAGMA table_info(users)`);
    const colNames = cols.length > 0 ? cols[0].values.map(r => r[1]) : [];
    if (!colNames.includes('shop_domain')) {
      db.run(`ALTER TABLE users ADD COLUMN shop_domain TEXT`);
    }
  } catch (e) {
    // Ignore migration errors on fresh DB
  }

  // Migration: make oauth_states.shop_domain nullable
  try {
    db.run(`DROP TABLE IF EXISTS oauth_states`);
    db.run(`CREATE TABLE IF NOT EXISTS oauth_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      state TEXT NOT NULL,
      verifier TEXT,
      shop_domain TEXT DEFAULT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(platform, state)
    )`);
  } catch (e) { /* ignore */ }

  // Indexes for performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON reset_tokens(token);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON reset_tokens(user_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(platform, state);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_shops_domain ON shops(shop_domain);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_shop ON sessions(shop_domain);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_metric_shop_date ON metric_snapshots(shop_domain, date, source);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sync_log_shop ON sync_log(shop_domain, source);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_platform_conn ON platform_connections(shop_domain, platform);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_costs_shop ON fixed_costs(shop_domain);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_chat_conversations_created ON chat_conversations(created_at);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_chat_conversations_human ON chat_conversations(needs_human);`);

  // Save initial schema to file and start auto-save
  saveDatabaseToFile();
  startAutoSave();

  return db;
}

export function getDB() {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

// Helper to execute a write operation and save to file
function executeAndSave(query, params = []) {
  const db = getDB();
  const result = db.run(query, params);
  saveDatabaseToFile();
  return result;
}

// --- Shop management ---
export function saveShop(shopDomain, accessToken, scope, shopInfo = {}) {
  const db = getDB();
  const encrypted = encrypt(accessToken);

  db.run(
    `INSERT INTO shops (shop_domain, access_token_encrypted, scope, shop_name, shop_email, plan_name)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(shop_domain) DO UPDATE SET
       access_token_encrypted = excluded.access_token_encrypted,
       scope = excluded.scope,
       shop_name = excluded.shop_name,
       shop_email = excluded.shop_email,
       is_active = 1,
       uninstalled_at = NULL,
       updated_at = CURRENT_TIMESTAMP`,
    [shopDomain, encrypted, scope, shopInfo.name || null, shopInfo.email || null, shopInfo.plan || null]
  );
}

export function getShop(shopDomain) {
  const db = getDB();
  const results = db.exec(
    `SELECT id, shop_domain, access_token_encrypted, scope, shop_name, shop_email, plan_name, is_active, installed_at
     FROM shops WHERE shop_domain = ? AND is_active = 1`,
    [shopDomain]
  );

  if (results.length === 0 || results[0].values.length === 0) return null;

  const row = results[0].values[0];
  return {
    id: row[0],
    shopDomain: row[1],
    accessToken: decrypt(row[2]),
    scope: row[3],
    shopName: row[4],
    shopEmail: row[5],
    planName: row[6],
    isActive: row[7] === 1,
    installedAt: row[8],
  };
}

export function getAllActiveShops() {
  const db = getDB();
  const results = db.exec(
    `SELECT id, shop_domain, access_token_encrypted, scope, shop_name, shop_email, plan_name, is_active, installed_at
     FROM shops WHERE is_active = 1`,
    []
  );

  if (results.length === 0 || results[0].values.length === 0) return [];

  return results[0].values.map(row => ({
    id: row[0],
    shopDomain: row[1],
    accessToken: decrypt(row[2]),
    scope: row[3],
    shopName: row[4],
    shopEmail: row[5],
    planName: row[6],
    isActive: row[7] === 1,
    installedAt: row[8],
  }));
}

export function markShopUninstalled(shopDomain) {
  const db = getDB();
  db.run(
    `UPDATE shops SET is_active = 0, uninstalled_at = CURRENT_TIMESTAMP WHERE shop_domain = ?`,
    [shopDomain]
  );
}

export function setShopNonce(shopDomain, nonce) {
  const db = getDB();
  db.run(
    `INSERT INTO shops (shop_domain, access_token_encrypted, nonce) VALUES (?, '', ?)
     ON CONFLICT(shop_domain) DO UPDATE SET nonce = ?`,
    [shopDomain, nonce, nonce]
  );
}

export function getShopNonce(shopDomain) {
  const db = getDB();
  const results = db.exec(`SELECT nonce FROM shops WHERE shop_domain = ?`, [shopDomain]);
  if (results.length === 0 || results[0].values.length === 0) return null;
  return results[0].values[0][0];
}

// --- User management ---
export function createUser(id, name, email, hashedPassword, salt) {
  const db = getDB();
  const createdAt = new Date().toISOString();
  
  db.run(
    `INSERT INTO users (id, name, email, hashed_password, salt, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, email.toLowerCase().trim(), hashedPassword, salt, createdAt]
  );
}

export function getUserByEmail(email) {
  const db = getDB();
  const results = db.exec(
    `SELECT id, name, email, hashed_password, salt, created_at, last_login_at, shop_domain
     FROM users WHERE email = ?`,
    [email.toLowerCase().trim()]
  );

  if (results.length === 0 || results[0].values.length === 0) return null;

  const row = results[0].values[0];
  return {
    id: row[0],
    name: row[1],
    email: row[2],
    hashedPassword: row[3],
    salt: row[4],
    createdAt: row[5],
    lastLoginAt: row[6],
    shopDomain: row[7] || null,
  };
}

export function getUserById(id) {
  const db = getDB();
  const results = db.exec(
    `SELECT id, name, email, hashed_password, salt, created_at, last_login_at, shop_domain
     FROM users WHERE id = ?`,
    [id]
  );

  if (results.length === 0 || results[0].values.length === 0) return null;

  const row = results[0].values[0];
  return {
    id: row[0],
    name: row[1],
    email: row[2],
    hashedPassword: row[3],
    salt: row[4],
    createdAt: row[5],
    lastLoginAt: row[6],
    shopDomain: row[7] || null,
  };
}

export function linkUserToShop(userId, shopDomain) {
  const db = getDB();
  db.run(`UPDATE users SET shop_domain = ? WHERE id = ?`, [shopDomain, userId]);
  saveDatabaseToFile();
}

export function getUserShopDomain(userId) {
  const db = getDB();
  const results = db.exec(`SELECT shop_domain FROM users WHERE id = ?`, [userId]);
  if (results.length === 0 || results[0].values.length === 0) return null;
  return results[0].values[0][0] || null;
}

export function updateUserLastLogin(id) {
  const db = getDB();
  const lastLoginAt = new Date().toISOString();
  
  db.run(
    `UPDATE users SET last_login_at = ? WHERE id = ?`,
    [lastLoginAt, id]
  );
}

export function updateUserPassword(id, hashedPassword, salt) {
  const db = getDB();
  
  db.run(
    `UPDATE users SET hashed_password = ?, salt = ? WHERE id = ?`,
    [hashedPassword, salt, id]
  );
}

// --- Reset token management ---
export function createResetToken(userId, token, expiresAt) {
  const db = getDB();
  
  db.run(
    `INSERT INTO reset_tokens (user_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, token, expiresAt]
  );
}

export function getResetToken(token) {
  const db = getDB();
  const results = db.exec(
    `SELECT rt.id, rt.user_id, rt.token, rt.expires_at, rt.used, rt.created_at,
            u.id as user_id, u.name, u.email
     FROM reset_tokens rt
     JOIN users u ON rt.user_id = u.id
     WHERE rt.token = ? AND rt.used = 0 AND rt.expires_at > datetime('now')`,
    [token]
  );

  if (results.length === 0 || results[0].values.length === 0) return null;

  const row = results[0].values[0];
  return {
    id: row[0],
    userId: row[1],
    token: row[2],
    expiresAt: row[3],
    used: row[4] === 1,
    createdAt: row[5],
    user: {
      id: row[6],
      name: row[7],
      email: row[8]
    }
  };
}

export function markResetTokenUsed(tokenId) {
  const db = getDB();
  
  db.run(
    `UPDATE reset_tokens SET used = 1 WHERE id = ?`,
    [tokenId]
  );
}

export function deleteExpiredResetTokens() {
  const db = getDB();
  
  db.run(
    `DELETE FROM reset_tokens WHERE expires_at < datetime('now') OR used = 1`
  );
}

// --- OAuth state management ---
export function saveOAuthState(platform, state, verifier, shopDomain, userId = null) {
  const db = getDB();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
  
  // Add user_id column if it doesn't exist
  try {
    db.run(`ALTER TABLE oauth_states ADD COLUMN user_id TEXT`);
  } catch (e) { /* column already exists */ }
  
  db.run(
    `INSERT INTO oauth_states (platform, state, verifier, shop_domain, expires_at, user_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [platform, state, verifier, shopDomain, expiresAt, userId]
  );
}

export function getOAuthState(platform, state) {
  const db = getDB();
  const results = db.exec(
    `SELECT verifier, shop_domain, user_id FROM oauth_states 
     WHERE platform = ? AND state = ? AND expires_at > datetime('now')`,
    [platform, state]
  );
  
  if (results.length === 0 || results[0].values.length === 0) return null;
  
  const [verifier, shopDomain, userId] = results[0].values[0];
  return { verifier, shopDomain, userId };
}

export function deleteOAuthState(platform, state) {
  const db = getDB();
  
  db.run(
    `DELETE FROM oauth_states WHERE platform = ? AND state = ?`,
    [platform, state]
  );
}

export function cleanupExpiredOAuthStates() {
  const db = getDB();
  
  db.run(
    `DELETE FROM oauth_states WHERE expires_at < datetime('now')`
  );
}

// --- Platform connections ---
export function savePlatformConnection(shopDomain, platform, credentials, accountId = 'default') {
  const db = getDB();
  const encrypted = encrypt(JSON.stringify(credentials));

  db.run(
    `INSERT INTO platform_connections (shop_domain, platform, account_id, credentials_encrypted)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(shop_domain, platform) DO UPDATE SET
       credentials_encrypted = excluded.credentials_encrypted,
       status = 'active',
       updated_at = CURRENT_TIMESTAMP`,
    [shopDomain, platform, accountId, encrypted]
  );
}

export function getPlatformConnection(shopDomain, platform) {
  const db = getDB();
  const results = db.exec(
    `SELECT credentials_encrypted, status, last_sync_at FROM platform_connections
     WHERE shop_domain = ? AND platform = ? AND status = 'active'`,
    [shopDomain, platform]
  );

  if (results.length === 0 || results[0].values.length === 0) return null;

  const row = results[0].values[0];
  try {
    return {
      credentials: JSON.parse(decrypt(row[0])),
      status: row[1],
      lastSyncAt: row[2],
    };
  } catch (error) {
    console.error(`[Database] Failed to decrypt credentials for ${platform} at ${shopDomain}:`, error);
    return null;
  }
}

export function getAllPlatformConnections(shopDomain) {
  const db = getDB();
  const results = db.exec(
    `SELECT platform, status, last_sync_at, updated_at FROM platform_connections WHERE shop_domain = ?`,
    [shopDomain]
  );

  if (results.length === 0) return [];
  return results[0].values.map(row => ({
    platform: row[0],
    status: row[1],
    lastSyncAt: row[2],
    updatedAt: row[3],
  }));
}

// --- Session management ---
export function saveSession(session) {
  const db = getDB();
  const tokenEncrypted = session.accessToken ? encrypt(session.accessToken) : null;

  db.run(
    `INSERT INTO sessions (id, shop_domain, state, is_online, access_token_encrypted, scope, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       access_token_encrypted = excluded.access_token_encrypted,
       scope = excluded.scope,
       expires_at = excluded.expires_at`,
    [session.id, session.shop, session.state || null, session.isOnline ? 1 : 0,
     tokenEncrypted, session.scope || null, session.expires?.toISOString() || null]
  );
}

export function loadSession(id) {
  const db = getDB();
  const results = db.exec(
    `SELECT id, shop_domain, state, is_online, access_token_encrypted, scope, expires_at FROM sessions WHERE id = ?`,
    [id]
  );

  if (results.length === 0 || results[0].values.length === 0) return null;

  const row = results[0].values[0];
  return {
    id: row[0],
    shop: row[1],
    state: row[2],
    isOnline: row[3] === 1,
    accessToken: row[4] ? decrypt(row[4]) : null,
    scope: row[5],
    expires: row[6] ? new Date(row[6]) : null,
  };
}

export function deleteSession(id) {
  const db = getDB();
  db.run(`DELETE FROM sessions WHERE id = ?`, [id]);
}

// --- Metric snapshots (now per-shop) ---
export function saveSnapshot(shopDomain, date, source, metric, value, dimensions = null) {
  const db = getDB();
  const dimensionsJson = dimensions ? JSON.stringify(dimensions) : null;
  db.run(
    `INSERT INTO metric_snapshots (shop_domain, date, source, metric, value, dimensions)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [shopDomain, date, source, metric, value, dimensionsJson]
  );
}

export function getHistory(shopDomain, metric, dateRange, granularity = 'daily') {
  const db = getDB();
  const results = db.exec(
    `SELECT date, metric, value, source, dimensions FROM metric_snapshots
     WHERE shop_domain = ? AND metric = ? AND date >= ? AND date <= ?
     ORDER BY date ASC`,
    [shopDomain, metric, dateRange.start, dateRange.end]
  );

  if (results.length === 0) return [];
  return results[0].values.map(row => ({
    date: row[0], metric: row[1], value: row[2], source: row[3],
    dimensions: row[4] ? JSON.parse(row[4]) : null,
  }));
}

export function getDataCoverage(shopDomain) {
  const db = getDB();
  const sources = ['shopify', 'meta', 'google', 'klaviyo', 'ga4'];
  const coverage = {};

  sources.forEach(source => {
    const result = db.exec(
      `SELECT MIN(date), MAX(date), COUNT(*) FROM metric_snapshots WHERE shop_domain = ? AND source = ?`,
      [shopDomain, source]
    );
    if (result.length > 0 && result[0].values.length > 0) {
      const [earliest, latest, records] = result[0].values[0];
      coverage[source] = { earliest, latest, records, daysOfData: earliest && latest ? calculateDaysDiff(earliest, latest) : 0 };
    } else {
      coverage[source] = { earliest: null, latest: null, records: 0, daysOfData: 0 };
    }
  });
  return coverage;
}

// --- Sync log (per-shop) ---
export function logSync(shopDomain, source, status, recordsSynced = 0, errorMessage = null) {
  const db = getDB();
  db.run(
    `INSERT INTO sync_log (shop_domain, source, status, records_synced, error_message) VALUES (?, ?, ?, ?, ?)`,
    [shopDomain, source, status, recordsSynced, errorMessage]
  );
}

export function getLastSyncLog(shopDomain, source) {
  const db = getDB();
  const results = db.exec(
    `SELECT status, records_synced, error_message, synced_at FROM sync_log
     WHERE shop_domain = ? AND source = ? ORDER BY synced_at DESC LIMIT 1`,
    [shopDomain, source]
  );
  if (results.length === 0 || results[0].values.length === 0) return null;
  const [status, recordsSynced, errorMessage, syncedAt] = results[0].values[0];
  return { status, recordsSynced, errorMessage, syncedAt };
}

// --- Fixed costs (per-shop) ---
export function saveCost(shopDomain, label, monthlyAmount, category = null) {
  const db = getDB();
  db.run(
    `INSERT INTO fixed_costs (shop_domain, label, monthly_amount, category) VALUES (?, ?, ?, ?)`,
    [shopDomain, label, monthlyAmount, category]
  );
}

export function getCosts(shopDomain) {
  const db = getDB();
  const results = db.exec(
    `SELECT id, label, monthly_amount, category, is_active, created_at FROM fixed_costs
     WHERE shop_domain = ? ORDER BY created_at DESC`,
    [shopDomain]
  );
  if (results.length === 0) return [];
  return results[0].values.map(row => ({
    id: row[0], label: row[1], monthlyAmount: row[2], category: row[3],
    isActive: row[4] === 1, createdAt: row[5],
  }));
}

export function updateCost(id, label, monthlyAmount, category) {
  const db = getDB();
  db.run(`UPDATE fixed_costs SET label = ?, monthly_amount = ?, category = ? WHERE id = ?`,
    [label, monthlyAmount, category, id]);
}

export function deleteCost(id) {
  const db = getDB();
  db.run(`DELETE FROM fixed_costs WHERE id = ?`, [id]);
}

export function toggleCostActive(id, isActive) {
  const db = getDB();
  db.run(`UPDATE fixed_costs SET is_active = ? WHERE id = ?`, [isActive ? 1 : 0, id]);
}

// --- Webhook log ---
export function logWebhook(shopDomain, topic, payloadHash) {
  const db = getDB();
  db.run(
    `INSERT INTO webhook_log (shop_domain, topic, payload_hash) VALUES (?, ?, ?)`,
    [shopDomain, topic, payloadHash]
  );
}

export function isWebhookProcessed(payloadHash) {
  const db = getDB();
  const results = db.exec(
    `SELECT id FROM webhook_log WHERE payload_hash = ? AND processed = 1`,
    [payloadHash]
  );
  return results.length > 0 && results[0].values.length > 0;
}

export function markWebhookProcessed(payloadHash) {
  const db = getDB();
  db.run(`UPDATE webhook_log SET processed = 1 WHERE payload_hash = ?`, [payloadHash]);
}

// --- Auth code exchange (short-lived codes to avoid JWT in URLs) ---
const authCodes = new Map();

export function setAuthCode(code, token, ttlSeconds) {
  authCodes.set(code, { token, expires: Date.now() + ttlSeconds * 1000 });
  // Cleanup expired codes
  for (const [k, v] of authCodes) {
    if (v.expires < Date.now()) authCodes.delete(k);
  }
}

export function getAuthCode(code) {
  const entry = authCodes.get(code);
  if (!entry) return null;
  authCodes.delete(code); // One-time use
  if (entry.expires < Date.now()) return null;
  return entry.token;
}

function calculateDaysDiff(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
}

// --- Delete all data for a shop (GDPR compliance) ---
export function deleteShopData(shopDomain) {
  const db = getDB();

  // Delete all data associated with the shop
  db.run(`DELETE FROM platform_connections WHERE shop_domain = ?`, [shopDomain]);
  db.run(`DELETE FROM metric_snapshots WHERE shop_domain = ?`, [shopDomain]);
  db.run(`DELETE FROM sync_log WHERE shop_domain = ?`, [shopDomain]);
  db.run(`DELETE FROM forecast_accuracy WHERE shop_domain = ?`, [shopDomain]);
  db.run(`DELETE FROM fixed_costs WHERE shop_domain = ?`, [shopDomain]);
  db.run(`DELETE FROM webhook_log WHERE shop_domain = ?`, [shopDomain]);
  db.run(`DELETE FROM sessions WHERE shop_domain = ?`, [shopDomain]);

  // Mark shop as uninstalled (soft delete for audit trail)
  markShopUninstalled(shopDomain);
}
