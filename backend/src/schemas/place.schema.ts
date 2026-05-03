import { z } from 'zod';

export const createPlaceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  category: z.enum(['waterfall', 'heritage', 'forest', 'wildlife', 'tribal', 'religious', 'adventure', 'lake', 'hill']),
  district: z.string().min(2),
  description: z.string().min(10),
  short_description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  entry_fee: z.any().optional(),
  best_time_to_visit: z.string().optional(),
  how_to_reach: z.any().optional(),
  facilities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export const updatePlaceSchema = createPlaceSchema.partial();

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;
