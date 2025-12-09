import axios from 'axios';

// M1 Flow Management API (Azure Functions)
// Note: Azure Functions deployed with authentication require function keys
// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://func-m1-fanops-comehdi.azurewebsites.net/api';
const M1_BASE_URL = `${API_URL}/flow`;

// Function key - get this from Azure Portal → Function App → App keys
// If your functions are set to "anonymous" (no auth), leave empty
const FUNCTION_KEY = ''; // Add your key here if needed

const getUrl = (endpoint, params = {}) => {
  const url = new URL(`${M1_BASE_URL}${endpoint}`);

  // Add function key if configured
  if (FUNCTION_KEY) {
    url.searchParams.append('code', FUNCTION_KEY);
  }

  // Add other parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
};

export const flowService = {
  // GET /flow/status - Returns real-time gate status with ML predictions
  getGateStatus: async (stadiumId = 'AGADIR') => {
    try {
      console.log('Fetching gate status for:', stadiumId);
      const url = getUrl('/status', { stadiumId });
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });
      return response.data;
    } catch (error) {
      console.error('M1 Flow Status Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // GET /flow/ai-insights - Query AI agent decisions and reasoning
  getAIInsights: async (stadiumId = 'AGADIR', limit = 5) => {
    try {
      console.log('Fetching AI insights for:', stadiumId);
      const url = getUrl('/ai-insights', { stadium_id: stadiumId, limit });
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('M1 AI Insights Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // GET /flow/investigation/{id} - Query RCA investigation results
  getInvestigation: async (investigationId) => {
    try {
      console.log('Fetching investigation:', investigationId);
      const url = getUrl(`/investigation/${investigationId}`);
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('M1 Investigation Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // POST /flow/ingest - Ingest gate data (for testing/simulation)
  ingestGateData: async (gateData) => {
    try {
      console.log('Sending test gate data:', gateData);
      const url = getUrl('/ingest');
      const response = await axios.post(url, gateData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('M1 Ingest Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });

      // Provide helpful error message
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - M1 service may be slow or unavailable');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed - Function key may be required');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint not found - Check M1 deployment');
      } else if (!error.response) {
        throw new Error(`Network error - Cannot reach M1 service: ${error.message}`);
      }

      throw error;
    }
  },

  // Subscribe to gate updates (polling)
  subscribeToGateUpdates: (stadiumId, callback) => {
    const intervalId = setInterval(async () => {
      try {
        const data = await flowService.getGateStatus(stadiumId);
        callback(data);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    // Initial fetch
    flowService.getGateStatus(stadiumId).then(callback).catch(console.error);

    return () => clearInterval(intervalId);
  },

  // Test connection to M1 service
  testConnection: async () => {
    try {
      console.log('Testing M1 connection...');
      const url = getUrl('/status', { stadiumId: 'AGADIR' });
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      });
      return { success: true, status: response.status, message: 'Connection successful!' };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 0,
        message: error.message,
        details: error.response?.data
      };
    }
  }
};