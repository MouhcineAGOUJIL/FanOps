import m2Client from './m2Client';

export const securityService = {
  // Verify Ticket - M2 AWS
  verifyTicket: async (ticketData) => {
    try {
      const response = await m2Client.post('/security/verifyTicket', ticketData);
      return response.data;
    } catch (error) {
      console.error('Verify ticket error:', error);
      throw error;
    }
  },

  // Report Gate Status - M2 AWS
  reportGateStatus: async (gateReport) => {
    try {
      const response = await m2Client.post('/security/reportGate', gateReport);
      return response.data;
    } catch (error) {
      console.error('Report gate error:', error);
      throw error;
    }
  },

  // Get Security Metrics - M2 AWS
  getSecurityMetrics: async () => {
    try {
      const response = await m2Client.get('/security/metrics');
      return response.data;
    } catch (error) {
      console.error('Get metrics error:', error);
      throw error;
    }
  }
};