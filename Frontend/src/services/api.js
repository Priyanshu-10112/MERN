import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds for AI operations
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

// Upload & Parse File
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Analyze File with Options
export const analyzeFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.columnMapping) {
    formData.append('columnMapping', JSON.stringify(options.columnMapping));
  }
  
  if (options.analysisType) {
    formData.append('analysisType', options.analysisType);
  }

  const response = await api.post('/api/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Chat with AI (Context-aware)
export const chatWithAI = async (question, uploadId = null) => {
  const response = await api.post('/api/chat', {
    question,
    uploadId,
  });

  return response.data;
};

// Get Upload History
export const getUploadHistory = async (limit = 20, page = 1) => {
  const response = await api.get('/api/history/uploads', {
    params: { limit, page }
  });

  return response.data;
};

// Get Analysis History
export const getAnalysisHistory = async () => {
  const response = await api.get('/api/analyze/history');
  return response.data;
};

// Get Specific Analysis
export const getAnalysisById = async (id) => {
  const response = await api.get(`/api/history/analysis/${id}`);
  return response.data;
};

// Get Chat History
export const getChatHistory = async (uploadId) => {
  const response = await api.get(`/api/history/chat/${uploadId}`);
  return response.data;
};

// Get File Structure (for preview)
export const getFileStructure = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/flexible/structure', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Flexible Analysis
export const flexibleAnalyze = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (options.columnMapping) {
    formData.append('columnMapping', JSON.stringify(options.columnMapping));
  }
  
  if (options.analyzeType) {
    formData.append('analyzeType', options.analyzeType);
  }
  
  if (options.rowRange) {
    formData.append('rowRange', JSON.stringify(options.rowRange));
  }

  const response = await api.post('/api/flexible/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export default api;
