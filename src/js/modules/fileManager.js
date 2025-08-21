/**
 * File Manager
 * Handles file upload, processing, and thumbnail management
 */

import { CONFIG } from './config.js';
import { DOM } from './dom.js';
import { notifications } from './notifications.js';
import { errorHandler } from './errorHandler.js';

class FileManager {
  constructor() {
    this.selectedFiles = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    DOM.fileInput.addEventListener('change', (event) => {
      this.handleFileSelection(event);
    });
  }

  async handleFileSelection(event) {
    try {
      const files = Array.from(event.target.files);
      
      if (files.length === 0) return;

      // Validate file count
      if (files.length > CONFIG.FILE_LIMITS.MAX_COUNT) {
        notifications.warning(`Maximum ${CONFIG.FILE_LIMITS.MAX_COUNT} files allowed at once.`);
        this.resetInput();
        return;
      }

      const processedFiles = [];

      for (const file of files) {
        if (this.validateFile(file)) {
          try {
            const dataUrl = await this.readFileAsDataURL(file);
            const fileObj = {
              name: file.name,
              dataUrl,
              id: Date.now() + Math.random(),
              size: file.size,
              type: file.type
            };
            
            processedFiles.push(fileObj);
            this.selectedFiles.push(fileObj);
            this.createThumbnail(fileObj);
          } catch (error) {
            errorHandler.handle(error, `processing file "${file.name}"`);
          }
        }
      }

      if (processedFiles.length > 0) {
        notifications.info(`${processedFiles.length} image(s) ready to send.`);
      }

    } catch (error) {
      errorHandler.handle(error, 'handling file selection');
    } finally {
      this.resetInput();
    }
  }

  validateFile(file) {
    return errorHandler.validateFile(
      file, 
      CONFIG.FILE_LIMITS.MAX_SIZE, 
      CONFIG.FILE_LIMITS.ALLOWED_TYPES
    );
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${reader.error?.message || 'Unknown error'}`));
      };

      reader.onabort = () => {
        reject(new Error('File reading was aborted'));
      };

      try {
        reader.readAsDataURL(file);
      } catch (error) {
        reject(new Error(`Failed to start reading file: ${error.message}`));
      }
    });
  }

  createThumbnail(fileObj) {
    const thumbnailDiv = document.createElement('div');
    thumbnailDiv.className = 'thumbnail';
    thumbnailDiv.dataset.fileId = fileObj.id;

    const img = document.createElement('img');
    img.src = fileObj.dataUrl;
    img.alt = fileObj.name;
    img.title = fileObj.name;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => this.removeThumbnail(fileObj.id);

    thumbnailDiv.appendChild(img);
    thumbnailDiv.appendChild(removeBtn);
    DOM.thumbnailsContainer.appendChild(thumbnailDiv);
  }

  removeThumbnail(fileId) {
    // Remove from selectedFiles array
    const index = this.selectedFiles.findIndex(f => f.id === fileId);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    }

    // Remove thumbnail from DOM
    const thumbnail = DOM.thumbnailsContainer.querySelector(`[data-file-id="${fileId}"]`);
    if (thumbnail) {
      thumbnail.remove();
    }
  }

  clearThumbnails() {
    this.selectedFiles.length = 0;
    DOM.thumbnailsContainer.innerHTML = '';
  }

  resetInput() {
    DOM.fileInput.value = '';
  }

  getSelectedFiles() {
    return [...this.selectedFiles];
  }

  hasFiles() {
    return this.selectedFiles.length > 0;
  }
}

export const fileManager = new FileManager();
