/**
 * API Client
 * Handles communication with Groq API
 */

import { CONFIG } from './config.js';
import { DOM } from './dom.js';
import { notifications } from './notifications.js';
import { errorHandler } from './errorHandler.js';
import { storage } from './storage.js';

class ApiClient {
  constructor() {
    this.controller = null;
  }

  async sendMessage(message, files = []) {
    // Cancel any ongoing request
    this.cancelRequest();
    
    // Create new AbortController for this request
    this.controller = new AbortController();

    try {
      const apiKey = storage.get('groqApiKey');
      if (!apiKey) {
        throw new Error('API key not found. Please set your Groq API key in settings.');
      }

      const formData = new FormData();
      
      // Add text message
      if (message && message.trim()) {
        formData.append('message', message.trim());
      }

      // Add files
      files.forEach((file, index) => {
        if (file.dataUrl) {
          // Convert data URL to blob
          const blob = this.dataURLToBlob(file.dataUrl);
          formData.append(`file_${index}`, blob, file.name);
        }
      });

      // Add system prompt if set
      const systemPrompt = storage.get('systemPrompt');
      if (systemPrompt && systemPrompt.trim()) {
        formData.append('system_prompt', systemPrompt.trim());
      }

      const response = await fetch(CONFIG.API.GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData,
        signal: this.controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      return data.choices[0].message.content;

    } catch (error) {
      if (error.name === 'AbortError') {
        notifications.info('Request cancelled');
        return null;
      }
      
      errorHandler.handle(error, 'sending message to API');
      throw error;
    } finally {
      this.controller = null;
    }
  }

  dataURLToBlob(dataURL) {
    try {
      const [header, data] = dataURL.split(',');
      const mimeType = header.match(/:(.*?);/)[1];
      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);
      
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      return new Blob([bytes], { type: mimeType });
    } catch (error) {
      throw new Error(`Failed to convert image data: ${error.message}`);
    }
  }

  cancelRequest() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  isRequestInProgress() {
    return this.controller !== null;
  }

  async testConnection() {
    try {
      const apiKey = storage.get('groqApiKey');
      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Simple test request
      const formData = new FormData();
      formData.append('message', 'Hello');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(CONFIG.API.GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        notifications.success('API connection successful!');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        notifications.error('Connection test timed out');
      } else {
        notifications.error(`Connection test failed: ${error.message}`);
      }
      return false;
    }
  }
}

export const apiClient = new ApiClient();
