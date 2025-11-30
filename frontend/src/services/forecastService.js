import axios from 'axios';

const M3_API_URL = import.meta.env.VITE_M3_API_URL || 'https://sfg82p344i.execute-api.us-east-1.amazonaws.com/dev';

export const forecastService = {
  // POST /predict
  predictAttendance: async (data) => {
    try {
      const response = await axios.post(`${M3_API_URL}/predict`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Forecast Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  }
};