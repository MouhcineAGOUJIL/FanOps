import axios from 'axios';

// M1 Hybrid Architecture:
// - Azure VM (IaaS): Real-time monitoring, always-on, fast
// - Azure Functions (PaaS): AI features, less frequent use

// Azure VM (IaaS) - Real-time monitoring (24/7, no cold start)
const M1_VM_URL = 'http://4.211.206.250/api';

// Azure Functions (PaaS) - AI features (may have cold start)
const M1_FUNCTIONS_URL = 'https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow';

// Function key (if needed)
const FUNCTION_KEY = '';

const getVMUrl = (endpoint, params = {}) => {
  const url = new URL(`${M1_VM_URL}${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
};

const getFunctionsUrl = (endpoint, params = {}) => {
  const url = new URL(`${M1_FUNCTIONS_URL}${endpoint}`);

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
  // GET /realtime/gates - Returns real-time gate status from VM (IaaS)
  getGateStatus: async (stadiumId = 'AGADIR') => {
    try {
      console.log('[VM] Fetching gate status for:', stadiumId);
      const url = getVMUrl('/realtime/gates', { stadiumId });
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      // Transform VM response to match expected format
      return {
        stadiumId: response.data.stadiumId,
        gates: response.data.gates || [],
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('[VM] Gate Status Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });

      // Fallback to Functions if VM fails
      console.log('[FALLBACK] Trying Azure Functions...');
      try {
        const fallbackUrl = getFunctionsUrl('/status', { stadiumId });
        const response = await axios.get(fallbackUrl, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        });
        return response.data;
      } catch (fallbackError) {
        console.error('[FALLBACK] Functions also failed:', fallbackError.message);
        throw error; // Throw original error
      }
    }
  },

  // GET /flow/ai-insights - Query AI agent decisions and reasoning (Azure Functions)
  getAIInsights: async (stadiumId = 'AGADIR', limit = 5) => {
    try {
      console.log('[Functions] Fetching AI insights for:', stadiumId);
      const url = getFunctionsUrl('/ai-insights', { stadium_id: stadiumId, limit });
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000 // Longer timeout for cold start
      });
      return response.data;
    } catch (error) {
      console.error('[Functions] AI Insights Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // GET /flow/investigation/{id} - Query RCA investigation results (Azure Functions)
  getInvestigation: async (investigationId) => {
    try {
      console.log('[Functions] Fetching investigation:', investigationId);
      const url = getFunctionsUrl(`/investigation/${investigationId}`);
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error('[Functions] Investigation Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // POST /flow/ingest - Ingest gate data (Azure Functions)
  ingestGateData: async (gateData) => {
    try {
      console.log('[Functions] Sending test gate data:', gateData);
      const url = getFunctionsUrl('/ingest');
      const response = await axios.post(url, gateData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      console.error('[Functions] Ingest Error:', {
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

  // Test connection to M1 service (tries VM first, then Functions)
  testConnection: async () => {
    try {
      console.log('[Test] Testing VM connection...');
      const vmUrl = getVMUrl('/realtime/gates', { stadiumId: 'AGADIR' });
      const response = await axios.get(vmUrl, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      return {
        success: true,
        status: response.status,
        message: 'VM connection successful!',
        source: 'Azure VM (IaaS)'
      };
    } catch (error) {
      console.log('[Test] VM failed, trying Functions...');
      try {
        const funcUrl = getFunctionsUrl('/status', { stadiumId: 'AGADIR' });
        const response = await axios.get(funcUrl, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        return {
          success: true,
          status: response.status,
          message: 'Functions connection successful (VM unavailable)',
          source: 'Azure Functions (PaaS)'
        };
      } catch (funcError) {
        return {
          success: false,
          status: error.response?.status || 0,
          message: 'Both VM and Functions unavailable',
          details: error.message
        };
      }
    }
  }
};