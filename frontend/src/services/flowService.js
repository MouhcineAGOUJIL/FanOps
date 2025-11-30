import axios from 'axios';

// M1 Real-time Monitoring - Using Azure VM (IaaS)
// Note: May have HTTPS→HTTP blocking on Amplify
const M1_BASE_URL = 'http://4.211.206.250/api/realtime';

// Function key (leave empty if anonymous auth)
const FUNCTION_KEY = '';

const getUrl = (endpoint, params = {}) => {
  const url = new URL(`${M1_BASE_URL}${endpoint}`);

  if (FUNCTION_KEY) {
    url.searchParams.append('code', FUNCTION_KEY);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
};

export const flowService = {
  // GET /realtime/gates - Returns real-time gate status from VM
  getGateStatus: async (stadiumId = 'AGADIR') => {
    try {
      console.log('[VM] Fetching gate status for:', stadiumId);
      const url = getUrl('/gates', { stadiumId });
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('[VM] Gate Status Error:', {
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
        timeout: 15000
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
        timeout: 15000
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
        timeout: 15000
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

  // Test connection to M1 service
  testConnection: async () => {
    try {
      console.log('Testing M1 connection...');
      const url = getUrl('/status', { stadiumId: 'AGADIR' });
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
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