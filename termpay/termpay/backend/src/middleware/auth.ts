import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'termpay-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    schoolId: string;
    role: string;
    type: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded.schoolId) {
      return res.status(403).json({ error: 'Invalid token: school_id missing' });
    }

    req.user = {
      id: decoded.id,
      schoolId: decoded.schoolId,
      role: decoded.role,
      type: decoded.type
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
