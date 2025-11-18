import { apiClient } from './api';

export const flowService = {
  // GET /flow/status
  getGateStatus: async (stadiumId) => {
    const response = await apiClient.get(`/flow/status`, {
      params: { stadiumId }
    });
    return response.data;
  },

  // POST /flow/ingest
  ingestGateData: async (gateData) => {
    const response = await apiClient.post('/flow/ingest', gateData);
    return response.data;
  },

  // WebSocket pour temps réel (optionnel)
  subscribeToGateUpdates: (stadiumId, callback) => {
    // Simuler WebSocket avec polling
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