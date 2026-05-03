import { z } from 'zod';

export const createHotelSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  place_id: z.string().uuid().optional().nullable(),
  district: z.string().min(2),
  address: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  star_rating: z.number().min(1).max(5).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  price_per_night: z.number().positive(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  is_published: z.boolean().optional(),
});

export const updateHotelSchema = createHotelSchema.partial();

export const createRoomSchema = z.object({
  room_type: z.enum(['single', 'double', 'deluxe', 'suite', 'dormitory']),
  name: z.string().min(2),
  description: z.string().optional(),
  price_per_night: z.number().positive(),
  max_occupancy: z.number().int().positive(),
  total_rooms: z.number().int().positive(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  is_available: z.boolean().optional(),
});

export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
