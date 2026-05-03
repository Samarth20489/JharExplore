import { z } from 'zod';

export const generatePlanSchema = z.object({
  body: z.object({
    location: z.string().min(2, 'Origin city is required'),
    budget: z.coerce.number().int().min(1000, 'Budget must be at least ₹1000'),
    days: z.coerce.number().int().min(1).max(14, 'Trip duration: 1–14 days'),
    travelers: z.coerce.number().int().min(1).max(20, 'Travelers: 1–20'),
    travelStyle: z.enum(['budget', 'comfort', 'luxury']),
    interests: z.array(z.string()).min(1, 'Select at least one interest'),
    travelDates: z.string().optional(),
  }),
});

export const savePlanSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    prompt_used: z.string().optional(),
    duration_days: z.coerce.number().int().optional(),
    destinations: z.array(z.string()).optional(),
    itinerary: z.any(),
    raw_markdown: z.string().optional(),
  }),
});
