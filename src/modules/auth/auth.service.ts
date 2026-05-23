import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../db/index.js';
import { config } from '../../config/index.js';
import { RegisterDTO, LoginDTO } from './auth.interface.js';
import { AppError } from '../../middleware/errorHandler.js';

const register = async (payload: RegisterDTO) => {
  const { name, email, password, role = 'contributor' } = payload;

  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existing.rows.length > 0) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashedPassword, role]
  );

  return result.rows[0];
};

const login = async (payload: LoginDTO) => {
  const { email, password } = payload;

  const result = await pool.query(
    'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid credentials', 401);
  }

  const user = result.rows[0];

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
};

export const authService = { register, login };