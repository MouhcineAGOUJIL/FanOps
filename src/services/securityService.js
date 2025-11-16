import { apiClient } from './api';

export const securityService = {
  // POST /security/verifyTicket
  verifyTicket: async (ticketData) => {
    const response = await apiClient.post('/security/verifyTicket', ticketData);
    return response.data;
  },

  // POST /security/reportGate
  reportGateStatus: async (gateReport) => {
    const response = await apiClient.post('/security/reportGate', gateReport);
    return response.data;
  }
};