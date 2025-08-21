/**
 * Message Handler
 * Manages message display, formatting, and interaction
 */

import { CONFIG } from './config.js';
import { DOM } from './dom.js';
import { notifications } from './notifications.js';
import { storage } from './storage.js';

class MessageHandler {
  constructor() {
    this.messageId = 0;
  }

  addMessage(sender, content, images = []) {
    this.messageId++;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.setAttribute('data-message-id', this.messageId);

    // Create header with sender info
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const senderSpan = document.createElement('span');
    senderSpan.className = 'sender';
    senderSpan.textContent = sender === 'user' ? 'You' : 'Assistant';
    
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = new Date().toLocaleTimeString();
    
    headerDiv.appendChild(senderSpan);
    headerDiv.appendChild(timestampSpan);

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Add images if present
    if (images && images.length > 0) {
      const imagesDiv = document.createElement('div');
      imagesDiv.className = 'message-images';
      
      images.forEach(imageData => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'message-image-container';
        
        const img = document.createElement('img');
        img.src = imageData;
        img.alt = 'Uploaded image';
        img.className = 'message-image';
        img.onclick = () => this.openImageModal(imageData);
        
        imgContainer.appendChild(img);
        imagesDiv.appendChild(imgContainer);
      });
      
      contentDiv.appendChild(imagesDiv);
    }

    // Add text content
    if (content && content.trim()) {
      const textDiv = document.createElement('div');
      textDiv.className = 'message-text';
      
      if (sender === 'assistant') {
        textDiv.innerHTML = this.formatMarkdown(content);
      } else {
        textDiv.textContent = content;
      }
      
      contentDiv.appendChild(textDiv);
    }

    // Add copy button for assistant messages
    if (sender === 'assistant') {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = '📋';
      copyBtn.title = 'Copy message';
      copyBtn.onclick = () => this.copyMessage(content);
      headerDiv.appendChild(copyBtn);
    }

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    DOM.chatMessages.appendChild(messageDiv);

    // Auto-scroll to latest message
    this.scrollToBottom();

    // Save to conversation history
    this.saveMessage(sender, content, images);

    return messageDiv;
  }

  formatMarkdown(text) {
    if (!text) return '';

    return text
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }

  copyMessage(content) {
    if (!content) return;

    navigator.clipboard.writeText(content)
      .then(() => {
        notifications.success('Message copied to clipboard!');
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        notifications.success('Message copied to clipboard!');
      });
  }

  openImageModal(imageSrc) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.onclick = () => modal.remove();

    const img = document.createElement('img');
    img.src = imageSrc;
    img.className = 'modal-image';
    img.onclick = (e) => e.stopPropagation();

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => modal.remove();

    modal.appendChild(img);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
  }

  scrollToBottom() {
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
  }

  saveMessage(sender, content, images = []) {
    const message = {
      id: this.messageId,
      sender,
      content,
      images,
      timestamp: Date.now()
    };

    storage.addMessage(message);
  }

  loadConversationHistory() {
    const messages = storage.getMessages();
    
    messages.forEach(message => {
      const messageDiv = this.addMessageFromHistory(
        message.sender, 
        message.content, 
        message.images || []
      );
      messageDiv.setAttribute('data-message-id', message.id);
    });

    // Update message counter
    if (messages.length > 0) {
      this.messageId = Math.max(...messages.map(m => m.id));
    }
  }

  addMessageFromHistory(sender, content, images = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const senderSpan = document.createElement('span');
    senderSpan.className = 'sender';
    senderSpan.textContent = sender === 'user' ? 'You' : 'Assistant';
    
    headerDiv.appendChild(senderSpan);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (images && images.length > 0) {
      const imagesDiv = document.createElement('div');
      imagesDiv.className = 'message-images';
      
      images.forEach(imageData => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'message-image-container';
        
        const img = document.createElement('img');
        img.src = imageData;
        img.alt = 'Uploaded image';
        img.className = 'message-image';
        img.onclick = () => this.openImageModal(imageData);
        
        imgContainer.appendChild(img);
        imagesDiv.appendChild(imgContainer);
      });
      
      contentDiv.appendChild(imagesDiv);
    }

    if (content && content.trim()) {
      const textDiv = document.createElement('div');
      textDiv.className = 'message-text';
      
      if (sender === 'assistant') {
        textDiv.innerHTML = this.formatMarkdown(content);
      } else {
        textDiv.textContent = content;
      }
      
      contentDiv.appendChild(textDiv);
    }

    if (sender === 'assistant') {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = '📋';
      copyBtn.title = 'Copy message';
      copyBtn.onclick = () => this.copyMessage(content);
      headerDiv.appendChild(copyBtn);
    }

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);
    DOM.chatMessages.appendChild(messageDiv);

    return messageDiv;
  }

  clearMessages() {
    DOM.chatMessages.innerHTML = '';
    this.messageId = 0;
    storage.clearMessages();
    notifications.info('Conversation cleared');
  }
}

export const messageHandler = new MessageHandler();
