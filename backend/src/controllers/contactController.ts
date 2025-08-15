import { Request, Response } from 'express';
import pool from '../config/db';

export const submitContactForm = async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  try {
    await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5)',
      [name, email, phone, subject, message]
    );
    res.status(201).json({ message: 'Message submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};