#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import fs from 'fs';
import path from 'path';

console.log('🔍 Database Debug Information');
console.log('============================');

console.log('Current working directory:', process.cwd());

// Check database files
const dbPath1 = path.join(process.cwd(), 'data', 'ecommerce.db');
const dbPath2 = path.join(process.cwd(), '../data', 'ecommerce.db');

console.log('\nDatabase file paths:');
console.log('Path 1 (cwd/data):', dbPath1);
console.log('Path 1 exists:', fs.existsSync(dbPath1));
if (fs.existsSync(dbPath1)) {
  console.log('Path 1 size:', fs.statSync(dbPath1).size, 'bytes');
}

console.log('Path 2 (../data):', dbPath2);
console.log('Path 2 exists:', fs.existsSync(dbPath2));
if (fs.existsSync(dbPath2)) {
  console.log('Path 2 size:', fs.statSync(dbPath2).size, 'bytes');
}

// Test database loading directly
console.log('\nTesting database loading...');

import initSqlJs from 'sql.js';
const SQL = await initSqlJs();

try {
  if (fs.existsSync(dbPath1)) {
    console.log('Loading from path 1...');
    const data = fs.readFileSync(dbPath1);
    const db = new SQL.Database(data);
    
    // Check shops table
    const shops = db.exec('SELECT shop_domain, shop_name FROM shops');
    console.log('Shops in database:', shops.length > 0 ? shops[0].values.length : 0);
    if (shops.length > 0 && shops[0].values.length > 0) {
      shops[0].values.forEach(shop => console.log('  -', shop.join(', ')));
    }
    
    // Check metrics
    const metrics = db.exec('SELECT COUNT(*) FROM metric_snapshots');
    console.log('Total metrics:', metrics.length > 0 ? metrics[0].values[0][0] : 0);
    
    db.close();
  }
} catch (error) {
  console.error('Error loading database:', error.message);
}

// Test environment variables
console.log('\nEnvironment variables:');
console.log('ENCRYPTION_KEY:', process.env.ENCRYPTION_KEY ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');