import { axiosPrivate } from './axiosInstance';

// All booking endpoints require customer authentication via HTTP-only JWT cookie

export const createBookingAPI = (bookingData) =>
  axiosPrivate.post('/bookings', bookingData);

export const fetchMyBookingsAPI = (params) =>
  axiosPrivate.get('/bookings/my-bookings', { params });

export const fetchBookingByIdAPI = (id) =>
  axiosPrivate.get(`/bookings/${id}`);

export const cancelBookingAPI = (id) =>
  axiosPrivate.patch(`/bookings/${id}/cancel`);
