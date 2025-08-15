import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware'; 
import sendEmail from '../utils/sendEmail';

// --- OTP GENERATOR ---
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

export const register = async (req: Request, res: Response) => {
  const {
    firstName, lastName, email, password, phone, dateOfBirth, gender, location, 
    education, profession, height, maritalStatus, religion, motherTongue, aboutMe,
  } = req.body;
  
  const client = await pool.connect();

  try {
    const userExists = await client.query('SELECT * FROM users WHERE email = $1 AND is_verified = TRUE', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'A verified user with this email already exists.' });
    }
    
    // If an unverified user exists, remove it before creating a new one
    await client.query('DELETE FROM users WHERE email = $1 AND is_verified = FALSE', [email]);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute from now

    await client.query('BEGIN');
    
    const newUserRes = await client.query(
      `INSERT INTO users (first_name, last_name, email, password, phone, date_of_birth, gender, location, education, profession, height, marital_status, religion, mother_tongue, about_me, is_premium, otp, otp_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING user_id`,
      [
        firstName, lastName, email, hashedPassword, phone, dateOfBirth, gender, location, education,
        profession, height, maritalStatus, religion, motherTongue, aboutMe, true , otp, otpExpiresAt,
      ]
    );

    // Send OTP email
    const message = `<h3>Welcome to Neelamma Pellipandhiri! Trusted matrimony service. Join thousands of families who found their happiness through our platform.</h3><p>Your One-Time Passcode (OTP) for registration is:</p><h2><b>${otp}</b></h2><p>This code is valid for 1 minute.</p>`;
    await sendEmail({ email, subject: 'Your Registration OTP Code', message });

    await client.query('COMMIT');
    
    res.status(200).json({ 
        message: 'OTP has been sent to your email address.',
        email: email 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Registration Error: ", error);
    res.status(500).json({ message: 'Server error during registration.' });
  } finally {
    client.release();
  }
};

export const verifyRegistration = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1 AND is_verified = FALSE', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'No pending registration found for this email.' });
        }

        const user = userResult.rows[0];
        const now = new Date();

        if (user.otp !== otp || user.otp_expires_at < now) {
            return res.status(400).json({ message: 'Invalid or expired OTP. Please try registering again.' });
        }

        const age = new Date().getFullYear() - new Date(user.date_of_birth).getFullYear();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Complete registration
            await client.query(
              `UPDATE users SET is_verified = TRUE, otp = NULL, otp_expires_at = NULL WHERE user_id = $1`, 
              [user.user_id]
            );
            // Also create the corresponding profile
            await client.query(
              `INSERT INTO profiles (user_id, name, age, location, education, profession, interests)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [user.user_id, `${user.first_name} ${user.last_name}`, age, user.location, user.education, user.profession, []]
            );
            await client.query('COMMIT');
            res.status(201).json({ message: 'Registration successful! You can now log in.' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error; // Propagate error to outer catch block
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1 AND is_verified = TRUE', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials or user not verified.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

    await pool.query('UPDATE users SET otp = $1, otp_expires_at = $2 WHERE user_id = $3', [otp, otpExpiresAt, user.user_id]);

    // Send OTP to email
    const emailMessage = `<h2>Welcome Back!</h2><h3>Real love stories from real couples who found their perfect match. Their journey to happiness started here, and yours can too.</h3><h3>Login Attempt</h3><p>Your One-Time Passcode (OTP) for logging in is:</p><h2><b>${otp}</b></h2><p>This code is valid for 1 minute.</p>`;
    await sendEmail({ email: user.email, subject: 'Your Login OTP Code', message: emailMessage });

    // Placeholder for sending OTP to phone via SMS (e.g., using Twilio)
    // if (user.phone) {
    //   await sendSms(user.phone, `Your Neelamma Pellipandhiri OTP is ${otp}`);
    // }

    res.status(200).json({
      message: 'OTP has been sent to your registered email and phone.',
      email: user.email
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const verifyLogin = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1 AND is_verified = TRUE', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'User not found.' });
        }
        
        const user = userResult.rows[0];
        const now = new Date();

        if (user.otp !== otp || user.otp_expires_at < now) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // OTP is correct, clear it from DB
        await pool.query('UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE user_id = $1', [user.user_id]);

        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                is_premium: user.is_premium
            },
        });

    } catch (error) {
        console.error("Login Verification Error:", error);
        res.status(500).json({ message: 'Server error during login verification.' });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User not found in request' });
    }
    const user = await pool.query(
      'SELECT user_id, first_name, last_name, email, is_premium FROM users WHERE user_id = $1',
      [userId]
    );
    if (user.rows.length > 0) {
      res.json(user.rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};