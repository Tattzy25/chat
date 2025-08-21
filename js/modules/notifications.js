/**
 * Notification System
 * Handles all user notifications and feedback
 */

import { CONFIG } from './config.js';

class NotificationManager {
  constructor() {
    this.notifications = new Set();
  }

  show(message, type = 'info', duration = CONFIG.NOTIFICATION.DEFAULT_DURATION) {
    const notification = this.create(message, type, duration);
    this.notifications.add(notification);
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
      this.remove(notification);
    }, duration);
    
    return notification;
  }

  create(message, type, duration) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getIcon(type)}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    return notification;
  }

  getIcon(type) {
    const icons = {
      error: '⚠️',
      success: '✅',
      warning: '⚡',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  remove(notification) {
    if (notification && notification.parentElement) {
      this.notifications.delete(notification);
      notification.remove();
    }
  }

  clearAll() {
    this.notifications.forEach(notification => {
      this.remove(notification);
    });
  }

  // Convenience methods
  success(message, duration = CONFIG.NOTIFICATION.SUCCESS_DURATION) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = CONFIG.NOTIFICATION.DEFAULT_DURATION) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = CONFIG.NOTIFICATION.DEFAULT_DURATION) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = CONFIG.NOTIFICATION.INFO_DURATION) {
    return this.show(message, 'info', duration);
  }
}

export const notifications = new NotificationManager();
