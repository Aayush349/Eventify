import { axiosPrivate as api } from './axiosInstance';

const paymentAPI = {
  // Process simulated transaction in demo sandbox
  processPayment: async (paymentData) => {
    const response = await api.post('/payments/process', paymentData);
    return response.data;
  },
  
  // Get customer's transaction logs
  getMyPayments: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  }
};

export default paymentAPI;
