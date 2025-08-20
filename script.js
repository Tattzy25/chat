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
  apiKey = apiKeyInput.value.trim();
  if (apiKey) {
    localStorage.setItem('chat_api_key', apiKey);
    alert('API key saved!');
  } else {
    alert('Please enter a valid key.');
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
  msgDiv.innerHTML = `<p>${escapeHTML(content)}</p>`;
  if (files.length) {
    files.forEach(file => {
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

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================================
   File handling
   ============================================================
*/
const selectedFiles = []; // Holds File objects

fileInput.addEventListener('change', async () => {
  const files = Array.from(fileInput.files);
  for (const file of files) {
    const dataUrl = await readFileAsDataURL(file);
    selectedFiles.push({name: file.name, dataUrl});
  }
  fileInput.value = ''; // reset for next upload
});

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   Send request to provider
   ============================================================
*/
async function sendMessage() {
  const text = msgInput.value.trim();
  if (!text && !selectedFiles.length) {
    alert('Send something first!');
    return;
  }

  // Show user's message immediately
  appendMessage({role: 'user', content: text});
  msgInput.value = '';
  msgInput.disabled = true;
  sendBtn.disabled = true;

  try {
    const payload = {
      model: modelInput.value.trim() || defaultModel(),
      messages: [
        {role: 'user', content: text || undefined},
      ],
    };

    // Attach files if any
    if (selectedFiles.length) {
      payload.files = selectedFiles.map(f => ({
        name: f.name,
        data: f.dataUrl.split(',')[1], // strip data:*;base64,
      }));
    }

    // Build request
    const url = API_ENDPOINTS[providerSel.value];
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`API error (${res.status}): ${error}`);
    }

    const data = await res.json();
    const botMsg = data.choices?.[0]?.message?.content ?? '🤖 …';
    appendMessage({role: 'bot', content: botMsg});

  } catch (err) {
    console.error(err);
    appendMessage({role: 'bot', content: `⚠️ ${err.message}`});
  } finally {
    selectedFiles.length = 0; // clear file buffer
    msgInput.disabled = false;
    sendBtn.disabled = false;
  }
}

/* ============================================================
   Default model per provider
   ============================================================
*/
function defaultModel() {
  return providerSel.value === 'groq' ? 'llama3-70b-8192' : 'gpt-4o-mini';
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
  // Clear chat when provider changes to avoid confusion
  chatEl.innerHTML = '';
});

/* ============================================================
   Initial focus
   ============================================================
*/
msgInput.focus();