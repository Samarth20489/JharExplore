import { z } from 'zod';

export const createBookingSchema = z.object({
  hotel_id: z.string().uuid(),
  room_id: z.string().uuid(),
  check_in: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid check-in date'),
  check_out: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid check-out date'),
  guests_count: z.number().int().positive(),
  guest_name: z.string().min(2),
  guest_email: z.string().email(),
  guest_phone: z.string().optional(),
  special_requests: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  payment_status: z.enum(['unpaid', 'paid', 'refunded']).optional(),
});

export const cancelBookingSchema = z.object({
  cancellation_reason: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
