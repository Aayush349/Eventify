import { axiosPublic, axiosPrivate } from './axiosInstance';

// ─── Public ───────────────────────────────────────────────────────────────────
export const fetchEventsAPI = (params) =>
  axiosPublic.get('/events', { params });

export const fetchFeaturedEventsAPI = (limit = 6) =>
  axiosPublic.get('/events/featured', { params: { limit } });

export const searchEventsAPI = (q, page = 1, limit = 12) =>
  axiosPublic.get('/events/search', { params: { q, page, limit } });

export const fetchEventByIdAPI = (id) =>
  axiosPublic.get(`/events/${id}`);

// ─── Organizer (Protected) ────────────────────────────────────────────────────
export const fetchOrganizerEventsAPI = (params) =>
  axiosPrivate.get('/organizer/events/organizer/my-events', { params });

export const createEventAPI = (data) =>
  axiosPrivate.post('/events', data);

export const updateEventAPI = (id, data) =>
  axiosPrivate.patch(`/events/${id}`, data);

export const deleteEventAPI = (id) =>
  axiosPrivate.delete(`/events/${id}`);

export const publishEventAPI = (id) =>
  axiosPrivate.patch(`/events/${id}/publish`);

export const uploadEventBannerAPI = (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return axiosPrivate.post(`/events/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
