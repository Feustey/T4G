-- Migration 003: Add authentication and login tracking fields to users table

-- Add email verification field
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add last login tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add index for email_verified (useful for filtering verified users)
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified) WHERE email_verified = true;

-- Add index for username (useful for lookups)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add index for lightning_address (useful for lookups)
CREATE INDEX IF NOT EXISTS idx_users_lightning_address ON users(lightning_address);

