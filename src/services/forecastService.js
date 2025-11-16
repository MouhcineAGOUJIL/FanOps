import { apiClient } from './api';

export const forecastService = {
  // GET /forecast
  getAttendanceForecast: async (matchId) => {
    const response = await apiClient.get('/forecast', {
      params: { matchId }
    });
    return response.data;
  }
};