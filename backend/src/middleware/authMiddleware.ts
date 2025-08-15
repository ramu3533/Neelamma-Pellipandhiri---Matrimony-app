import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import pool from '../config/db';

// Extend the Express Request type to include the user property
export interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };

      // Get user from the token's ID and attach it to the request object
      const userResult = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [decoded.id]);
      
      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = { id: userResult.rows[0].user_id };

      next();
    } catch (error) {
       if (error instanceof TokenExpiredError) {
        return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};