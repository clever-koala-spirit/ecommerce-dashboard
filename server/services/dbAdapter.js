/**
 * Database Adapter for sql.js
 * 
 * Provides a convenient interface that mimics node-sqlite3 API
 * for our existing customer segmentation service
 */

import { getDB } from '../db/database.js';

export class DatabaseAdapter {
  constructor() {
    this.db = null;
  }
  
  getDB() {
    if (!this.db) {
      this.db = getDB();
    }
    return this.db;
  }

  /**
   * Execute query and return all rows
   * @param {string} query - SQL query
   * @param {Array} params - Parameters
   * @returns {Array} Array of objects
   */
  all(query, params = []) {
    try {
      const results = this.getDB().exec(query, params);
      
      if (results.length === 0) {
        return [];
      }

      const result = results[0];
      if (!result || !result.columns || !result.values) {
        return [];
      }

      // Convert to array of objects
      return result.values.map(row => {
        const obj = {};
        result.columns.forEach((column, index) => {
          obj[column] = row[index];
        });
        return obj;
      });

    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Execute query and return first row
   * @param {string} query - SQL query  
   * @param {Array} params - Parameters
   * @returns {Object|null} First row as object or null
   */
  get(query, params = []) {
    try {
      const results = this.all(query, params);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Database get query error:', error);
      throw error;
    }
  }

  /**
   * Execute query without returning results (INSERT, UPDATE, DELETE)
   * @param {string} query - SQL query
   * @param {Array} params - Parameters
   * @returns {Object} Query result info
   */
  run(query, params = []) {
    try {
      this.getDB().run(query, params);
      return {
        changes: this.getDB().getRowsModified(),
        lastID: null // sql.js doesn't provide lastInsertRowid easily
      };
    } catch (error) {
      console.error('Database run query error:', error);
      throw error;
    }
  }

  /**
   * Execute raw query for complex operations
   * @param {string} query - SQL query
   * @param {Array} params - Parameters
   * @returns {Array} Raw sql.js results
   */
  exec(query, params = []) {
    return this.getDB().exec(query, params);
  }
}

export default new DatabaseAdapter();