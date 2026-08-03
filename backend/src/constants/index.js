/**
 * App-wide constants and enums
 */

const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
});

const BOOKING_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
});

const EVENT_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

const DISCOUNT_TYPE = Object.freeze({
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
});

const TICKET_TYPE = Object.freeze({
  VIP: 'vip',
  REGULAR: 'regular',
  GENERAL: 'general',
});

const NOTIFICATION_TYPE = Object.freeze({
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  EVENT_REMINDER: 'event_reminder',
  EVENT_CANCELLED: 'event_cancelled',
  SYSTEM: 'system',
});

module.exports = {
  ROLES,
  BOOKING_STATUS,
  EVENT_STATUS,
  PAYMENT_STATUS,
  DISCOUNT_TYPE,
  TICKET_TYPE,
  NOTIFICATION_TYPE,
};
