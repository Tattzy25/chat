/**
 * Main Application Controller
 * Coordinates all modules and handles primary application logic
 */

import { CONFIG } from './modules/config.js';
import { DOM } from './modules/dom.js';
import { notifications } from './modules/notifications.js';
import { errorHandler } from './modules/errorHandler.js';
import { storage } from './modules/storage.js';
import { fileManager } from './modules/fileManager.js';
import { messageHandler } from './modules/messageHandler.js';
import { apiClient } from './modules/apiClient.js';
import { uiController } from './modules/ui.js';

class ChatApplication {
  constructor() {
    this.init();
  }

  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize application
      this.setupEventListeners();
      this.loadConversationHistory();
      
      // Welcome message
      notifications.info('Chat application ready!');
      uiController.focusMessageInput();

    } catch (error) {
      errorHandler.handle(error, 'initializing application');
    }
  }

  setupEventListeners() {
    // Send message events
    DOM.sendButton.addEventListener('click', () => {
      this.handleSendMessage();
    });

    document.addEventListener('sendMessage', () => {
      this.handleSendMessage();
    });

    // Clear conversation
    document.addEventListener('clearConversation', () => {
      this.handleClearConversation();
    });

    // Test connection
    document.addEventListener('testConnection', () => {
      this.handleTestConnection();
    });

    // Cancel request
    document.addEventListener('cancelRequest', () => {
      this.handleCancelRequest();
    });

    // File selection button
    if (DOM.fileButton) {
      DOM.fileButton.addEventListener('click', () => {
        DOM.fileInput.click();
      });
    }
  }

  async handleSendMessage() {
    try {
      const messageText = DOM.messageInput.value.trim();
      const selectedFiles = fileManager.getSelectedFiles();

      // Validation
      if (!messageText && selectedFiles.length === 0) {
        notifications.warning('Please enter a message or select files to send.');
        return;
      }

      if (!storage.get('groqApiKey')) {
        notifications.error('Please set your Groq API key in the settings first.');
        return;
      }

      // Prepare for sending
      uiController.setLoading(true);
      const typingIndicator = uiController.showTypingIndicator();

      // Add user message
      const images = selectedFiles.map(f => f.dataUrl);
      messageHandler.addMessage('user', messageText, images);

      // Clear input and files
      DOM.messageInput.value = '';
      fileManager.clearThumbnails();
      uiController.autoResizeTextarea();

      try {
        // Send to API
        const response = await apiClient.sendMessage(messageText, selectedFiles);
        
        if (response) {
          // Add assistant response
          messageHandler.addMessage('assistant', response);
        }

      } catch (error) {
        // Add error message to chat
        messageHandler.addMessage('assistant', `Sorry, I encountered an error: ${error.message}`);
      }

    } catch (error) {
      errorHandler.handle(error, 'sending message');
    } finally {
      uiController.hideTypingIndicator();
      uiController.setLoading(false);
      uiController.focusMessageInput();
    }
  }

  handleClearConversation() {
    try {
      messageHandler.clearMessages();
      fileManager.clearThumbnails();
      DOM.messageInput.value = '';
      uiController.autoResizeTextarea();
      uiController.focusMessageInput();
    } catch (error) {
      errorHandler.handle(error, 'clearing conversation');
    }
  }

  async handleTestConnection() {
    try {
      uiController.setLoading(true);
      await apiClient.testConnection();
    } catch (error) {
      errorHandler.handle(error, 'testing connection');
    } finally {
      uiController.setLoading(false);
    }
  }

  handleCancelRequest() {
    try {
      apiClient.cancelRequest();
      uiController.hideTypingIndicator();
      uiController.setLoading(false);
    } catch (error) {
      errorHandler.handle(error, 'cancelling request');
    }
  }

  loadConversationHistory() {
    try {
      messageHandler.loadConversationHistory();
    } catch (error) {
      errorHandler.handle(error, 'loading conversation history');
    }
  }
}

// Initialize application when script loads
const app = new ChatApplication();

// Global error handling
window.addEventListener('error', (event) => {
  errorHandler.handle(event.error, 'global error handler');
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handle(event.reason, 'unhandled promise rejection');
});

// Export for debugging
window.ChatApp = {
  app,
  modules: {
    CONFIG,
    DOM,
    notifications,
    errorHandler,
    storage,
    fileManager,
    messageHandler,
    apiClient,
    uiController
  }
};
