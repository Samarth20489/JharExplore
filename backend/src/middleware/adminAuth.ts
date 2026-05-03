import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface AdminPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

export const adminAuth = (requiredRoles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Missing admin authorization' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminPayload;

      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ success: false, error: 'Insufficient admin privileges' });
      }

      req.admin = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Invalid or expired admin token' });
    }
  };
};
