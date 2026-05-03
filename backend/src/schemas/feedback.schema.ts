import { z } from 'zod';

export const createFeedbackSchema = z.object({
  target_type: z.enum(['place', 'hotel']),
  target_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
