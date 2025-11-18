import { apiClient } from './api';

export const sponsorService = {
  // POST /sponsor/context
  submitContext: async (contextData) => {
    const response = await apiClient.post('/sponsor/context', contextData);
    return response.data;
  },

  // GET /sponsor/reco
  getRecommendations: async (zoneId, matchId) => {
    const response = await apiClient.get('/sponsor/reco', {
      params: { zoneId, matchId }
    });
    return response.data;
  },

  // POST /sponsor/feedback
  submitFeedback: async (feedbackData) => {
    const response = await apiClient.post('/sponsor/feedback', feedbackData);
    return response.data;
  }
};