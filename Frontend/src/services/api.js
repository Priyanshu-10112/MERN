import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for AI operations
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// API methods
export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const analyzeCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Save to localStorage for demo (since no MongoDB)
  if (response.data && response.data.success && response.data.data) {
    localStorage.setItem('lastAnalysis', JSON.stringify(response.data.data));
    localStorage.setItem('lastAnalysisTime', new Date().toISOString());
  }

  return response.data;
};

export const chatWithAI = async (question, includeContext = true) => {
  const response = await api.post('/api/chat', {
    question,
    includeContext,
  });

  return response.data;
};

export const getAnalysisHistory = async (teamName = null) => {
  const params = teamName ? { teamName } : {};
  const response = await api.get('/api/analyze/history', { params });

  // If no data from server, try localStorage
  if (!response.data || response.data.count === 0) {
    const lastAnalysis = localStorage.getItem('lastAnalysis');
    if (lastAnalysis) {
      const data = JSON.parse(lastAnalysis);
      return {
        success: true,
        data,
        count: Object.keys(data).length,
        fromCache: true
      };
    }
  }

  return response.data;
};

export default api;
