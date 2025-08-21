/**
 * Storage Manager
 * Handles localStorage operations and data persistence
 */

import { CONFIG } from './config.js';
import { errorHandler } from './errorHandler.js';

class StorageManager {
  constructor() {
    this.cache = new Map();
  }

  get(key, defaultValue = null) {
    try {
      // Check cache first
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      const value = localStorage.getItem(key);
      const parsedValue = value ? JSON.parse(value) : defaultValue;
      
      // Cache the value
      this.cache.set(key, parsedValue);
      
      return parsedValue;
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      
      // Update cache
      this.cache.set(key, value);
      
      return true;
    } catch (error) {
      errorHandler.handle(error, `saving to storage (${key})`);
      return false;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key);
      this.cache.delete(key);
      return true;
    } catch (error) {
      console.error(`Error removing from storage (${key}):`, error);
      return false;
    }
  }

  clear() {
    try {
      localStorage.clear();
      this.cache.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Convenience methods for app-specific data
  getApiKey() {
    return this.get(CONFIG.STORAGE_KEYS.API_KEY, '');
  }

  setApiKey(apiKey) {
    return this.set(CONFIG.STORAGE_KEYS.API_KEY, apiKey);
  }

  getModel() {
    return this.get(CONFIG.STORAGE_KEYS.MODEL, '');
  }

  setModel(model) {
    return this.set(CONFIG.STORAGE_KEYS.MODEL, model);
  }

  getSettings() {
    return {
      apiKey: this.getApiKey(),
      model: this.getModel()
    };
  }

  saveSettings(settings) {
    const results = [];
    if (settings.apiKey !== undefined) {
      results.push(this.setApiKey(settings.apiKey));
    }
    if (settings.model !== undefined) {
      results.push(this.setModel(settings.model));
    }
    return results.every(Boolean);
  }
}

export const storage = new StorageManager();
