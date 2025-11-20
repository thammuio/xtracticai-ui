import axios from 'axios';

// Use the standard Vite variable `VITE_API_BASE_URL`. Vite only exposes variables
// prefixed with `VITE_` to the client build. Fallback to '/api' when unset.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden: You do not have permission');
          break;
        case 500:
          console.error('Server error: Please try again later');
          break;
      }
    }
    return Promise.reject(error);
  }
);

// File Upload API
export const uploadService = {
  // Upload file to Vercel Blob and submit to workflow API
  uploadFile: async (file: File): Promise<{ url: string; filename: string; size: number; uploadedAt: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Submit PDF URL to workflow API
  submitPdfUrl: async (pdfUrl: string) => {
    return apiClient.post('/workflows', { pdf_url: pdfUrl });
  },
};

// Workflow API
export const workflowService = {
  // Get all workflows
  getWorkflows: async () => {
    return apiClient.get('/workflows');
  },

  // Get workflow by ID
  getWorkflow: async (id: string) => {
    return apiClient.get(`/workflows/${id}`);
  },

  // Create new workflow
  createWorkflow: async (workflow: any) => {
    return apiClient.post('/workflows', workflow);
  },

  // Update workflow
  updateWorkflow: async (id: string, workflow: any) => {
    return apiClient.put(`/workflows/${id}`, workflow);
  },

  // Delete workflow
  deleteWorkflow: async (id: string) => {
    return apiClient.delete(`/workflows/${id}`);
  },

  // Start workflow execution
  startWorkflow: async (id: string) => {
    return apiClient.post(`/workflows/${id}/start`);
  },

  // Stop workflow execution
  stopWorkflow: async (id: string) => {
    return apiClient.post(`/workflows/${id}/stop`);
  },

  // Get workflow statistics
  getStats: async () => {
    try {
      return await apiClient.get('/workflows/stats');
    } catch (error) {
      // Return mock data for development
      return {
        total: 25,
        running: 3,
        completed: 20,
        failed: 2,
      };
    }
  },

  // Get recent workflows
  getRecentWorkflows: async () => {
    try {
      return await apiClient.get('/workflows/recent');
    } catch (error) {
      // Return mock data for development
      return [
        {
          key: '1',
          name: 'PDF Processing Workflow',
          status: 'completed',
          startTime: '2024-01-15 10:30:00',
          duration: '5m 23s',
          recordsProcessed: 1250,
        },
        {
          key: '2',
          name: 'Database Sync',
          status: 'running',
          startTime: '2024-01-15 11:00:00',
          duration: '2m 15s',
          recordsProcessed: 450,
        },
        {
          key: '3',
          name: 'API Data Collection',
          status: 'failed',
          startTime: '2024-01-15 09:45:00',
          duration: '1m 05s',
          recordsProcessed: 0,
        },
      ];
    }
  },
};

// Data Explorer API
export const dataService = {
  // Get datasets list
  getDatasets: async () => {
    return apiClient.get('/datasets');
  },

  // Get dataset by name
  getDataset: async (name: string, params?: any) => {
    return apiClient.get(`/datasets/${name}`, { params });
  },

  // Query dataset with natural language
  queryDataset: async (dataset: string, query: string) => {
    return apiClient.post(`/datasets/${dataset}/query`, { query });
  },

  // Export dataset
  exportDataset: async (name: string, format: string = 'csv') => {
    return apiClient.get(`/datasets/${name}/export`, {
      params: { format },
      responseType: 'blob',
    });
  },

  // Get dataset statistics
  getDatasetStats: async (name: string) => {
    return apiClient.get(`/datasets/${name}/stats`);
  },
};

// ETL Job API
export const etlService = {
  // Run ETL job
  runETL: async (config: any) => {
    return apiClient.post('/etl/run', config);
  },

  // Get ETL job status
  getJobStatus: async (jobId: string) => {
    return apiClient.get(`/etl/jobs/${jobId}`);
  },

  // Get ETL job logs
  getJobLogs: async (jobId: string) => {
    return apiClient.get(`/etl/jobs/${jobId}/logs`);
  },

  // Cancel ETL job
  cancelJob: async (jobId: string) => {
    return apiClient.post(`/etl/jobs/${jobId}/cancel`);
  },
};

// AI Assistant API
export const aiService = {
  // Chat with AI assistant
  chat: async (message: string, context?: any) => {
    return apiClient.post('/ai/chat', { message, context });
  },

  // Get data insights
  getInsights: async (dataset: string) => {
    return apiClient.post('/ai/insights', { dataset });
  },

  // Generate query from natural language
  generateQuery: async (naturalLanguageQuery: string) => {
    return apiClient.post('/ai/generate-query', { query: naturalLanguageQuery });
  },
};

export default apiClient;

// Health APIs
export const healthService = {
  // Get basic API health
  getHealth: async () => {
    try {
      return await apiClient.get('/health');
    } catch (error) {
      return { status: 'unhealthy', version: 'unknown' };
    }
  },

  // Get a consolidated system health summary
  getSystemHealth: async () => {
    try {
      return await apiClient.get('/health/summary');
    } catch (error) {
      // Provide a sensible mock so the UI can render during development
      return {
        api: { status: 'ok' },
        agents: [
          { id: 'agent-1', name: 'ingest-agent-1', status: 'running', lastSeen: '2025-11-19T09:22:00Z' },
          { id: 'agent-2', name: 'worker-agent-2', status: 'stopped', lastSeen: '2025-11-18T18:05:00Z' },
        ],
        integrations: [
          {
            id: 'kafka',
            name: 'Kafka',
            status: 'ok',
            details: { topics: 12, partitions: 48 },
            logs: { lastLog: '2025-11-19T09:20:00Z', errorCount: 1, logUrl: '/logs/kafka' },
          },
          {
            id: 'iceberg',
            name: 'Iceberg',
            status: 'degraded',
            details: { tables: 8 },
            logs: { lastLog: '2025-11-19T08:55:00Z', errorCount: 3, logUrl: '/logs/iceberg' },
          },
          {
            id: 'pdf',
            name: 'PDF Processor',
            status: 'ok',
            details: { queueDepth: 3 },
            logs: { lastLog: '2025-11-19T09:10:00Z', errorCount: 0, logUrl: '/logs/pdf' },
          },
        ],
      };
    }
  },

  // Get agent list / status
  getAgentHealth: async () => {
    try {
      return await apiClient.get('/health/agents');
    } catch (error) {
      return [
        { id: 'agent-1', name: 'ingest-agent-1', status: 'running', lastSeen: '2025-11-19T09:22:00Z' },
        { id: 'agent-2', name: 'worker-agent-2', status: 'stopped', lastSeen: '2025-11-18T18:05:00Z' },
      ];
    }
  },

  // Get integrations (Kafka, Iceberg, PDF processor, etc.)
  getIntegrationsStatus: async () => {
    try {
      return await apiClient.get('/health/integrations');
    } catch (error) {
      return [
        { id: 'kafka', name: 'Kafka', status: 'ok', details: { topics: 12 }, logs: { lastLog: '2025-11-19T09:20:00Z', errorCount: 1, logUrl: '/logs/kafka' } },
        { id: 'iceberg', name: 'Iceberg', status: 'degraded', details: { tables: 8 }, logs: { lastLog: '2025-11-19T08:55:00Z', errorCount: 3, logUrl: '/logs/iceberg' } },
        { id: 'pdf', name: 'PDF Processor', status: 'ok', details: { queueDepth: 3 }, logs: { lastLog: '2025-11-19T09:10:00Z', errorCount: 0, logUrl: '/logs/pdf' } },
      ];
    }
  },
};

