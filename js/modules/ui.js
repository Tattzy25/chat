/**
 * UI Controller
 * Manages UI state, interactions, and visual feedback
 */

import { CONFIG } from './config.js';
import { DOM } from './dom.js';
import { notifications } from './notifications.js';
import { storage } from './storage.js';

class UIController {
  constructor() {
    this.isLoading = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSettings();
    this.updateUI();
  }

  setupEventListeners() {
    // Sidebar toggle
    DOM.sidebarToggle.addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Collapsible sections
    document.querySelectorAll('.collapsible-header').forEach(header => {
      header.addEventListener('click', () => {
        this.toggleSection(header);
      });
    });

    // Settings form
    if (DOM.settingsForm) {
      DOM.settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    // Clear conversation
    const clearBtn = document.getElementById('clearConversation');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.confirmClearConversation();
      });
    }

    // Test connection
    const testBtn = document.getElementById('testConnection');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.testConnection();
      });
    }

    // Auto-resize textarea
    DOM.messageInput.addEventListener('input', () => {
      this.autoResizeTextarea();
    });

    // Handle Enter key
    DOM.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const sendEvent = new CustomEvent('sendMessage');
        document.dispatchEvent(sendEvent);
      }
    });

    // Escape key to cancel operations
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }
    });

    // Window resize handling
    window.addEventListener('resize', () => {
      this.handleWindowResize();
    });
  }

  toggleSidebar() {
    DOM.sidebar.classList.toggle('collapsed');
    const isCollapsed = DOM.sidebar.classList.contains('collapsed');
    storage.set('sidebarCollapsed', isCollapsed);
  }

  toggleSection(header) {
    const content = header.nextElementSibling;
    const isExpanded = content.style.display !== 'none';
    
    content.style.display = isExpanded ? 'none' : 'block';
    header.classList.toggle('expanded', !isExpanded);
    
    // Save section state
    const sectionId = header.closest('.sidebar-section').id;
    if (sectionId) {
      storage.set(`section_${sectionId}_expanded`, !isExpanded);
    }
  }

  loadSettings() {
    // Load API key
    const apiKey = storage.get('groqApiKey');
    if (apiKey && DOM.apiKeyInput) {
      DOM.apiKeyInput.value = apiKey;
    }

    // Load system prompt
    const systemPrompt = storage.get('systemPrompt');
    if (systemPrompt && DOM.systemPromptInput) {
      DOM.systemPromptInput.value = systemPrompt;
    }

    // Load sidebar state
    const sidebarCollapsed = storage.get('sidebarCollapsed');
    if (sidebarCollapsed) {
      DOM.sidebar.classList.add('collapsed');
    }

    // Load section states
    document.querySelectorAll('.sidebar-section').forEach(section => {
      const sectionId = section.id;
      if (sectionId) {
        const isExpanded = storage.get(`section_${sectionId}_expanded`, true);
        const header = section.querySelector('.collapsible-header');
        const content = section.querySelector('.collapsible-content');
        
        if (header && content) {
          content.style.display = isExpanded ? 'block' : 'none';
          header.classList.toggle('expanded', isExpanded);
        }
      }
    });
  }

  saveSettings() {
    try {
      // Save API key
      if (DOM.apiKeyInput) {
        const apiKey = DOM.apiKeyInput.value.trim();
        if (apiKey) {
          storage.set('groqApiKey', apiKey);
        } else {
          storage.remove('groqApiKey');
        }
      }

      // Save system prompt
      if (DOM.systemPromptInput) {
        const systemPrompt = DOM.systemPromptInput.value.trim();
        if (systemPrompt) {
          storage.set('systemPrompt', systemPrompt);
        } else {
          storage.remove('systemPrompt');
        }
      }

      notifications.success('Settings saved successfully!');
    } catch (error) {
      notifications.error('Failed to save settings');
      console.error('Settings save error:', error);
    }
  }

  updateUI() {
    // Update loading states
    this.updateLoadingState();
    
    // Update button states
    this.updateButtonStates();
  }

  updateLoadingState() {
    DOM.sendButton.disabled = this.isLoading;
    DOM.messageInput.disabled = this.isLoading;
    
    if (this.isLoading) {
      DOM.sendButton.innerHTML = '⏳';
      DOM.sendButton.title = 'Sending...';
    } else {
      DOM.sendButton.innerHTML = '➤';
      DOM.sendButton.title = 'Send message';
    }
  }

  updateButtonStates() {
    const hasApiKey = !!storage.get('groqApiKey');
    const hasMessage = DOM.messageInput.value.trim().length > 0;
    
    if (!this.isLoading) {
      DOM.sendButton.disabled = !(hasApiKey && hasMessage);
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.updateLoadingState();
  }

  autoResizeTextarea() {
    DOM.messageInput.style.height = 'auto';
    const newHeight = Math.min(DOM.messageInput.scrollHeight, 200);
    DOM.messageInput.style.height = `${newHeight}px`;
    
    // Update button state
    this.updateButtonStates();
  }

  confirmClearConversation() {
    if (confirm('Are you sure you want to clear the conversation? This action cannot be undone.')) {
      const clearEvent = new CustomEvent('clearConversation');
      document.dispatchEvent(clearEvent);
    }
  }

  async testConnection() {
    const testEvent = new CustomEvent('testConnection');
    document.dispatchEvent(testEvent);
  }

  handleEscapeKey() {
    // Close any open modals
    const modals = document.querySelectorAll('.image-modal');
    modals.forEach(modal => modal.remove());
    
    // Cancel any ongoing requests
    const cancelEvent = new CustomEvent('cancelRequest');
    document.dispatchEvent(cancelEvent);
  }

  handleWindowResize() {
    // Adjust layout if needed
    this.autoResizeTextarea();
  }

  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="message assistant">
        <div class="message-header">
          <span class="sender">Assistant</span>
        </div>
        <div class="message-content">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
    
    DOM.chatMessages.appendChild(indicator);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
    
    return indicator;
  }

  hideTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  focusMessageInput() {
    DOM.messageInput.focus();
  }
}

export const uiController = new UIController();
