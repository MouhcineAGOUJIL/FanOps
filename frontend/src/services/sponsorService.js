import axios from 'axios';

const M4_API_URL = 'https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai';

export const sponsorService = {
  // Get AI-powered sponsor recommendation from M4 (GCP)
  getRecommendation: async (context) => {
    try {
      const response = await axios.post(M4_API_URL, {
        match_minute: context.matchMinute || 0,
        score_diff: context.scoreDiff || 0,
        temperature: context.temperature || 25,
        crowd_density: context.crowdDensity || 0.7,
        zone: context.zone || 'North',
        event: context.event || 'None'
      });

      return response.data;
    } catch (error) {
      console.error('M4 API Error:', error);
      throw error;
    }
  }
};