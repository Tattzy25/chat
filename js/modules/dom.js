/**
 * DOM Elements Manager
 * Handles all DOM element references and queries
 */

class DOMElements {
  constructor() {
    this.init();
  }

  init() {
    // Chat elements
    this.chatEl = document.getElementById('chat');
    this.sendBtn = document.getElementById('send-btn');
    this.msgInput = document.getElementById('message-input');
    
    // File handling elements
    this.fileInput = document.getElementById('file-input');
    this.thumbnailsContainer = document.getElementById('image-thumbnails');
    
    // Settings elements
    this.providerSel = document.getElementById('provider');
    this.modelInput = document.getElementById('model');
    this.apiKeyInput = document.getElementById('api-key');
    this.saveKeyBtn = document.getElementById('save-key');
    
    // Sidebar elements
    this.sidebar = document.getElementById('sidebar');
    this.newChatBtn = document.getElementById('new-chat-btn');
    this.recentChats = document.getElementById('recent-chats');
    
    this.validateElements();
  }

  validateElements() {
    const requiredElements = [
      'chatEl', 'sendBtn', 'msgInput', 'fileInput', 
      'thumbnailsContainer', 'providerSel', 'modelInput', 
      'apiKeyInput', 'saveKeyBtn'
    ];

    const missing = requiredElements.filter(el => !this[el]);
    
    if (missing.length > 0) {
      console.error('Missing DOM elements:', missing);
      throw new Error(`Required DOM elements not found: ${missing.join(', ')}`);
    }
  }

  // Utility methods for common operations
  clearChat() {
    this.chatEl.innerHTML = '';
  }

  focusInput() {
    this.msgInput.focus();
  }

  disableInput(disabled = true) {
    this.msgInput.disabled = disabled;
    this.sendBtn.disabled = disabled;
  }
}

export const DOM = new DOMElements();
