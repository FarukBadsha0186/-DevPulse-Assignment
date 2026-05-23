import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 9000,
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Validate required environment variables
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is required');
}