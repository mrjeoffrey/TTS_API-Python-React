
import axios from 'axios';

export const MAX_CHARACTERS = 14000; // Maximum characters for TTS request
const API_KEY = '234234230948029348lskdj'; // API key for authentication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = 45000; // 45 seconds timeout

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'api-key': API_KEY // Add API key to all requests
  },
  timeout: API_TIMEOUT // Set a timeout for all requests
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    const errorMessage = error.response?.data?.detail || error.message;
    console.error('API Response Error:', errorMessage);
    return Promise.reject(error);
  }
);

// Convert text to speech
export const convertTextToSpeech = async (data) => {
  try {
    console.log(`Sending TTS request with ${data.text.length} characters`);
    const response = await apiClient.post('/tts', data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    console.error('TTS conversion error:', message);
    throw new Error(`TTS conversion failed: ${message}`);
  }
};

// Fetch TTS audio for a job
export const fetchTtsAudio = async (jobId) => {
  try {
    const response = await apiClient.get(`/tts/audio/${jobId}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'audio/mpeg',
        'api-key': API_KEY
      }
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    throw new Error(`Failed to fetch audio: ${message}`);
  }
};

// Delete TTS audio for a job
export const deleteTtsAudio = async (jobId) => {
  try {
    const response = await apiClient.delete(`/tts/audio/${jobId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    throw new Error(`Failed to delete audio: ${message}`);
  }
};

// Fetch all TTS jobs
export const fetchTtsJobs = async () => {
  try {
    const response = await apiClient.get('/tts/jobs');
    console.log(`Fetched ${response.data.length} jobs`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || error.message;
    throw new Error(`Failed to fetch jobs: ${message}`);
  }
};
