import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Try parsing with { body, query, params } wrapper first (for schemas like plan.schema.ts)
    const wrappedResult = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (wrappedResult.success) {
      req.body = (wrappedResult.data as any).body ?? wrappedResult.data;
      return next();
    }

    // Fallback: try parsing req.body directly (for flat schemas like auth.schema.ts)
    const flatResult = schema.safeParse(req.body);
    if (flatResult.success) {
      req.body = flatResult.data;
      return next();
    }

    // Both failed — return the flat error (more relevant for most cases)
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: flatResult.error.flatten().fieldErrors,
    });
  };
};
