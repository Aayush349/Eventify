import { axiosPrivate as api } from './axiosInstance';

const adminAPI = {
  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  updateUserRole: async (id, role) => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },
  getEvents: async () => {
    const response = await api.get('/admin/events');
    return response.data;
  },
  updateEventStatus: async (id, status) => {
    const response = await api.patch(`/admin/events/${id}/status`, { status });
    return response.data;
  },
  verifyTicketGate: async (referenceCode) => {
    const response = await api.post('/bookings/verify-checkin', { referenceCode });
    return response.data;
  }
};

export default adminAPI;
