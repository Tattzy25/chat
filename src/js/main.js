/* ============================================================
 Utility helpers
 ============================================================
*/
const chatEl = document.getElementById('chat');
const sendBtn = document.getElementById('send-btn');
const msgInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const providerSel = document.getElementById('provider');
const modelInput = document.getElementById('model');
const apiKeyInput = document.getElementById('api-key');
const saveKeyBtn = document.getElementById('save-key');

const API_ENDPOINTS = {
 groq: 'https://api.groq.com/openai/v1/chat/completions',
 openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

/* ============================================================
 Error Handling & Notifications
 ============================================================
*/
function showNotification(message, type = 'info', duration = 5000) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after duration
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, duration);
  
  return notification;
}

function getNotificationIcon(type) {
  switch (type) {
    case 'error': return '⚠️';
    case 'success': return '✅';
    case 'warning': return '⚡';
    case 'info': 
    default: return 'ℹ️';
  }
}

function handleError(error, context = '') {
  console.error(`Error ${context}:`, error);
  
  let userMessage = 'An unexpected error occurred';
  let notificationType = 'error';
  
  // Enhanced error categorization
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    userMessage = 'Network connection failed. Please check your internet connection.';
  } else if (error.message.includes('API error (401)')) {
    userMessage = 'Invalid API key. Please check your API key in Settings.';
  } else if (error.message.includes('API error (403)')) {
    userMessage = 'Access forbidden. Please verify your API key permissions.';
  } else if (error.message.includes('API error (429)')) {
    userMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
  } else if (error.message.includes('API error (500)')) {
    userMessage = 'Server error. The AI service is temporarily unavailable.';
  } else if (error.message.includes('API error')) {
    userMessage = `API Error: ${error.message}`;
  } else if (error.message.includes('JSON')) {
    userMessage = 'Invalid response from server. Please try again.';
  } else if (error.message) {
    userMessage = error.message;
  }
  
  showNotification(userMessage, notificationType);
  return userMessage;
}

function validateApiKey() {
  const key = apiKeyInput.value.trim();
  if (!key) {
    showNotification('Please enter an API key before sending messages.', 'warning');
    return false;
  }
  if (key.length < 10) {
    showNotification('API key seems too short. Please check your key.', 'warning');
    return false;
  }
  return true;
}

function validateModel() {
  const model = modelInput.value.trim();
  if (!model) {
    showNotification('Please enter a model name in Settings.', 'warning');
    return false;
  }
  return true;
}

/* ============================================================
 State
 ============================================================
*/
let apiKey = localStorage.getItem('chat_api_key') || '';
apiKeyInput.value = apiKey;
modelInput.value = localStorage.getItem('chat_model') || '';

/* ============================================================
 Persist user preferences
 ============================================================
*/
saveKeyBtn.addEventListener('click', () => {
 try {
   const key = apiKeyInput.value.trim();
   if (!key) {
     showNotification('Please enter an API key.', 'warning');
     return;
   }
   if (key.length < 10) {
     showNotification('API key seems too short. Please verify it\'s correct.', 'warning');
     return;
   }
   
   localStorage.setItem('chat_api_key', key);
   apiKey = key;
   showNotification('API key saved successfully!', 'success');
 } catch (error) {
   handleError(error, 'saving API key');
 }
});

modelInput.addEventListener('change', () => {
 localStorage.setItem('chat_model', modelInput.value.trim());
});

/* ============================================================
 Message rendering
 ============================================================
*/
function appendMessage({role, content, files = []}) {
 const msgDiv = document.createElement('div');
 msgDiv.className = `message ${role}`;
 
 // Format content based on role
 if (role === 'bot') {
   msgDiv.innerHTML = formatBotMessage(content);
 } else {
   msgDiv.innerHTML = `<p>${escapeHTML(content)}</p>`;
 }
 
 if (files.length) {
 const imageFiles = files.filter(file => file.dataUrl.startsWith('data:image/'));
 const otherFiles = files.filter(file => !file.dataUrl.startsWith('data:image/'));
 
 // Display images
 if (imageFiles.length) {
 const imagesDiv = document.createElement('div');
 imagesDiv.className = 'images';
 imageFiles.forEach(file => {
 const img = document.createElement('img');
 img.src = file.dataUrl;
 img.alt = file.name;
 img.title = file.name;
 img.onclick = () => {
 // Create fullscreen overlay
 const overlay = document.createElement('div');
 overlay.style.cssText = `
 position: fixed; top: 0; left: 0; width: 100%; height: 100%;
 background: rgba(0,0,0,0.9); display: flex; align-items: center;
 justify-content: center; z-index: 1000; cursor: pointer;
 `;
 const fullImg = document.createElement('img');
 fullImg.src = file.dataUrl;
 fullImg.style.cssText = 'max-width: 90%; max-height: 90%; object-fit: contain;';
 overlay.appendChild(fullImg);
 overlay.onclick = () => overlay.remove();
 document.body.appendChild(overlay);
 };
 imagesDiv.appendChild(img);
 });
 msgDiv.appendChild(imagesDiv);
 }
 
 // Display other files as download links
 otherFiles.forEach(file => {
 const fileLink = document.createElement('a');
 fileLink.href = file.dataUrl;
 fileLink.download = file.name;
 fileLink.textContent = `📎 ${file.name}`;
 fileLink.className = 'file';
 msgDiv.appendChild(fileLink);
 });
 }
 
 chatEl.appendChild(msgDiv);
 chatEl.scrollTop = chatEl.scrollHeight;
}

function formatBotMessage(content) {
  // Enhanced formatting for bot messages
  let formatted = escapeHTML(content);
  
  // Format numbered lists with better pattern matching
  formatted = formatted.replace(/(\d+\.\s+)(\*\*[^*]+\*\*[^:\n]*:?\*?\*?)\s*([^\n]*(?:\n(?!\d+\.)[^\n]*)*)/g, 
    '<div class="numbered-item"><span class="number">$1</span><div class="item-content">$2 $3</div></div>');
  
  // Format bullet points with sub-items
  formatted = formatted.replace(/^\s*[\*\-]\s+(.+)$/gm, '<div class="bullet-item">$1</div>');
  
  // Format bold text (**text**)
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Format code blocks (`code` or <code>text</code>)
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  formatted = formatted.replace(/&lt;code&gt;([^&]+)&lt;\/code&gt;/g, '<code>$1</code>');
  
  // Format headers (## text or **Section:** pattern)
  formatted = formatted.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
  
  // Format section headers that end with colon
  formatted = formatted.replace(/^\*\*([^*]+):\*\*\s*$/gm, '<h3>$1</h3>');
  
  // Clean up spacing around structured elements
  formatted = formatted.replace(/\n\s*\n/g, '\n');
  
  // Format paragraphs - split by double line breaks first
  const sections = formatted.split(/\n\s*\n/);
  formatted = sections.map(section => {
    // Don't wrap if already has HTML structure
    if (section.includes('<div') || section.includes('<h3')) {
      return section;
    }
    // Split by single line breaks and wrap each as paragraph
    return section.split('\n').filter(line => line.trim())
      .map(line => `<p>${line.trim()}</p>`).join('');
  }).join('');
  
  // Clean up any remaining line breaks
  formatted = formatted.replace(/\n+/g, ' ');
  
  return formatted;
}

function escapeHTML(str) {
 const div = document.createElement('div');
 div.textContent = str;
 return div.innerHTML;
}

/* ============================================================
 File handling
 ============================================================
*/
const selectedFiles = []; 
const thumbnailsContainer = document.getElementById('image-thumbnails');

fileInput.addEventListener('change', async () => {
	try {
		const files = Array.from(fileInput.files);
		
		if (files.length === 0) return;
		
		// Check file count limit
		if (files.length > 10) {
			showNotification('Maximum 10 files allowed at once.', 'warning');
			fileInput.value = '';
			return;
		}
		
		for (const file of files) {
			// Check file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				showNotification(`File "${file.name}" is too large. Maximum size is 10MB.`, 'warning');
				continue;
			}
			
			// Only process image files
			if (file.type.startsWith('image/')) {
				try {
					const dataUrl = await readFileAsDataURL(file);
					const fileObj = {name: file.name, dataUrl, id: Date.now() + Math.random()};
					selectedFiles.push(fileObj);
					createThumbnail(fileObj);
				} catch (error) {
					handleError(error, `processing file "${file.name}"`);
				}
			} else {
				showNotification(`File "${file.name}" is not an image. Only image files are supported.`, 'warning');
			}
		}
		
		if (selectedFiles.length > 0) {
			showNotification(`${selectedFiles.length} image(s) ready to send.`, 'info', 3000);
		}
		
	} catch (error) {
		handleError(error, 'handling file selection');
	} finally {
		fileInput.value = ''; // reset for next upload
	}
});

function createThumbnail(fileObj) {
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
	removeBtn.onclick = () => removeThumbnail(fileObj.id);
	
	thumbnailDiv.appendChild(img);
	thumbnailDiv.appendChild(removeBtn);
	thumbnailsContainer.appendChild(thumbnailDiv);
}

function removeThumbnail(fileId) {
	// Remove from selectedFiles array
	const index = selectedFiles.findIndex(f => f.id === fileId);
	if (index > -1) {
		selectedFiles.splice(index, 1);
	}
	
	// Remove thumbnail from DOM
	const thumbnail = thumbnailsContainer.querySelector(`[data-file-id="${fileId}"]`);
	if (thumbnail) {
		thumbnail.remove();
	}
}

function clearThumbnails() {
	selectedFiles.length = 0;
	thumbnailsContainer.innerHTML = '';
}

function readFileAsDataURL(file) {
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

/* ============================================================
   Send request to provider
   ============================================================
*/
async function sendMessage() {
	const text = msgInput.value.trim();
	
	// Enhanced validation
	if (!text && !selectedFiles.length) {
		showNotification('Please enter a message or select an image to send.', 'warning');
		return;
	}
	
	// Validate API key and model
	if (!validateApiKey() || !validateModel()) {
		return;
	}
	
	// Check if already sending
	if (sendBtn.disabled) {
		showNotification('Please wait for the current message to complete.', 'info');
		return;
	}

	appendMessage({ role: 'user', content: text || 'Image analysis request', files: selectedFiles.slice() });
	msgInput.value = '';
	msgInput.disabled = true;
	sendBtn.disabled = true;

	try {
		// Build the user message content array
		const userContent = [];
		
		// Add text if provided
		if (text) {
			userContent.push({
				type: "text",
				text: text
			});
		}
		
		// Add images if any files are selected
		if (selectedFiles.length) {
			selectedFiles.forEach(file => {
				// Check if file is an image
				if (file.dataUrl.startsWith('data:image/')) {
					userContent.push({
						type: "image_url",
						image_url: {
							url: file.dataUrl
						}
					});
				}
			});
		}
		
		// If no content at all, add a default message
		if (userContent.length === 0) {
			userContent.push({
				type: "text",
				text: "Please analyze the uploaded files."
			});
		}

		const messages = [
			{ 
				role: 'system', 
				content: `You are a helpful assistant. Respond clearly, logically, and in a well-structured manner. Use proper grammar and punctuation.` 
			},
			{ 
				role: 'user', 
				content: userContent 
			}
		];

		const payload = {
			model: defaultModel(),
			messages: messages,
			temperature: 0.7,
			max_completion_tokens: 2000,
			stream: false
		};

		const url = API_ENDPOINTS[providerSel.value];
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!res.ok) {
			const error = await res.text();
			throw new Error(`API error (${res.status}): ${error}`);
		}

		const data = await res.json();
		const botMsg = data.choices?.[0]?.message?.content ?? '';
		
		if (!botMsg) {
			throw new Error('Empty response from AI service');
		}
		
		appendMessage({ role: 'bot', content: botMsg });
		showNotification('Message sent successfully!', 'success', 2000);

	} catch (err) {
		const errorMessage = handleError(err, 'sending message');
		appendMessage({ role: 'bot', content: `⚠️ ${errorMessage}` });
	} finally {
		clearThumbnails(); 
		msgInput.disabled = false;
		sendBtn.disabled = false;
	}
}

/* ============================================================
   Default model per provider
   ============================================================
*/
function defaultModel() {
 return providerSel.value === 'groq' ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'meta-llama/llama-4-maverick-17b-128e-instruct';
}

/* ============================================================
 Event listeners
 ============================================================
*/
sendBtn.addEventListener('click', sendMessage);

msgInput.addEventListener('keydown', e => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 sendMessage();
 }
});

providerSel.addEventListener('change', () => {
 chatEl.innerHTML = '';
});

// Collapsible sidebar functionality
document.querySelectorAll('.collapsible').forEach(button => {
  button.addEventListener('click', () => {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const content = button.nextElementSibling;
    
    button.setAttribute('aria-expanded', !isExpanded);
    content.style.display = !isExpanded ? 'block' : 'none';
  });
});

msgInput.focus();