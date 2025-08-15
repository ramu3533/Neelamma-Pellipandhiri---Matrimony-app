import { Request, Response } from 'express';
import pool from '../config/db';

export const getSuccessStories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM success_stories');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};