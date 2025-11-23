import { apiClient } from './api';

export const flowService = {
  // GET /flow/status - Get gate status with ML predictions
  getGateStatus: async (stadiumId) => {
    const response = await apiClient.get(`/flow/status`, {
      params: { stadiumId }
    });
    return response.data;
  },

  // POST /flow/ingest - Send gate telemetry data
  ingestGateData: async (gateData) => {
    const response = await apiClient.post('/flow/ingest', gateData);
    return response.data;
  },

  // GET /flow/ai-insights - Get AI agent insights (NEW)
  getAIInsights: async (stadiumId, limit = 5) => {
    const response = await apiClient.get('/flow/ai-insights', {
      params: { stadium_id: stadiumId, limit }
    });
    return response.data;
  },

  // GET /flow/investigation/{id} - Get RCA investigation details (NEW)
  getInvestigation: async (investigationId) => {
    const response = await apiClient.get(`/flow/investigation/${investigationId}`);
    return response.data;
  },

  // WebSocket simulation for real-time updates
  subscribeToGateUpdates: (stadiumId, callback) => {
    // Poll every 3 seconds for updates
    const interval = setInterval(async () => {
      try {
        const data = await flowService.getGateStatus(stadiumId);
        callback(data);
      } catch (error) {
        console.error('Flow update error:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }
};