import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  connectionString: process.env.DATABASE_URL,
  // SSL is required for production databases on most cloud platforms
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

export default pool;
