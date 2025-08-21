/**
 * Application Configuration
 * Contains all constants and configuration settings
 */

export const CONFIG = {
  API_ENDPOINTS: {
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  },
  
  FILE_LIMITS: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_COUNT: 10,
    ALLOWED_TYPES: ['image/']
  },
  
  NOTIFICATION: {
    DEFAULT_DURATION: 5000,
    SUCCESS_DURATION: 2000,
    INFO_DURATION: 3000
  },
  
  MESSAGE: {
    MAX_COMPLETION_TOKENS: 2000,
    TEMPERATURE: 0.7,
    STREAM: false
  },
  
  STORAGE_KEYS: {
    API_KEY: 'chat_api_key',
    MODEL: 'chat_model'
  }
};

export const DEFAULT_MODELS = {
  groq: 'meta-llama/llama-4-scout-17b-16e-instruct',
  openrouter: 'meta-llama/llama-4-maverick-17b-128e-instruct'
};
