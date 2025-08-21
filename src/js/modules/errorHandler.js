/**
 * Error Handling System
 * Comprehensive error management and user feedback
 */

import { notifications } from './notifications.js';

class ErrorHandler {
  constructor() {
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handle(event.reason, 'unhandled promise');
      event.preventDefault();
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handle(event.error, 'global error');
    });
  }

  handle(error, context = '') {
    console.error(`Error ${context}:`, error);
    
    const userMessage = this.categorizeError(error);
    notifications.error(userMessage);
    
    return userMessage;
  }

  categorizeError(error) {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Network connection failed. Please check your internet connection.';
    }

    // API errors
    if (error.message.includes('API error (401)')) {
      return 'Invalid API key. Please check your API key in Settings.';
    }
    
    if (error.message.includes('API error (403)')) {
      return 'Access forbidden. Please verify your API key permissions.';
    }
    
    if (error.message.includes('API error (429)')) {
      return 'Rate limit exceeded. Please wait a moment before trying again.';
    }
    
    if (error.message.includes('API error (500)')) {
      return 'Server error. The AI service is temporarily unavailable.';
    }
    
    if (error.message.includes('API error')) {
      return `API Error: ${error.message}`;
    }

    // JSON parsing errors
    if (error.message.includes('JSON')) {
      return 'Invalid response from server. Please try again.';
    }

    // File errors
    if (error.message.includes('file')) {
      return `File error: ${error.message}`;
    }

    // Default error message
    return error.message || 'An unexpected error occurred';
  }

  // Validation helpers
  validateApiKey(apiKey) {
    if (!apiKey) {
      notifications.warning('Please enter an API key before sending messages.');
      return false;
    }
    if (apiKey.length < 10) {
      notifications.warning('API key seems too short. Please check your key.');
      return false;
    }
    return true;
  }

  validateModel(model) {
    if (!model) {
      notifications.warning('Please enter a model name in Settings.');
      return false;
    }
    return true;
  }

  validateFile(file, maxSize, allowedTypes) {
    if (file.size > maxSize) {
      notifications.warning(`File "${file.name}" is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
      return false;
    }

    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      notifications.warning(`File "${file.name}" is not supported. Only images are allowed.`);
      return false;
    }

    return true;
  }
}

export const errorHandler = new ErrorHandler();
