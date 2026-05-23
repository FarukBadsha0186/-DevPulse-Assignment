import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication token required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: number; name: string; email: string; role: string;
    };

    req.user = { id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role };
     return next();

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export const requireMaintainer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (req.user.role !== 'maintainer') {
    return res.status(403).json({ success: false, message: ' maintainer role is required' });
  }
   return next();
};