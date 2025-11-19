-- =========================================================
-- GlamAR Database Schema - DDL for Neon Postgres
-- =========================================================
-- Version: 2.0
-- Environment: SIT/Production (Neon Postgres)
-- Generated: 2025-11-15
-- =========================================================

-- Drop existing tables and types (use with caution!)
-- Uncomment the following block only if you want to reset the database
/*
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS vendor_subscription CASCADE;
DROP TABLE IF EXISTS user_subscription CASCADE;
DROP TABLE IF EXISTS std_pricing CASCADE;
DROP TABLE IF EXISTS mstr_subscription CASCADE;
DROP TABLE IF EXISTS vendor_prof CASCADE;
DROP TABLE IF EXISTS user_prof CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS site_integrations CASCADE;
DROP TABLE IF EXISTS tryons CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS reward_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS tryon_status CASCADE;
DROP TYPE IF EXISTS subscription_plan CASCADE;
*/

-- =========================================================
-- ENUMS
-- =========================================================

CREATE TYPE subscription_plan AS ENUM ('free', 'basic', 'pro', 'enterprise');

CREATE TYPE tryon_status AS ENUM ('queued', 'processing', 'done', 'failed');

CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'renewed');

CREATE TYPE notification_type AS ENUM ('update', 'plan', 'expiry', 'renewal');

CREATE TYPE reward_status AS ENUM ('pending', 'granted');

-- =========================================================
-- CORE TABLES (Legacy/Original Schema)
-- =========================================================

-- Users table (main authentication and user data)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  google_id VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20) UNIQUE,
  full_name VARCHAR(150),
  profile_image_url TEXT,
  referral_code VARCHAR(50) UNIQUE,
  referred_by VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  subscription_plan subscription_plan NOT NULL DEFAULT 'free',
  credits INTEGER NOT NULL DEFAULT 10
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_phone_number ON users(phone_number);

-- Refresh tokens for JWT authentication
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Try-ons table (virtual try-on history)
CREATE TABLE tryons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_id UUID,
  product_id VARCHAR(255),
  garment_url TEXT NOT NULL,
  human_image_key VARCHAR(500) NOT NULL,
  output_image_key VARCHAR(500),
  status tryon_status NOT NULL DEFAULT 'queued',
  replicate_response JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_tryons_user_id ON tryons(user_id);
CREATE INDEX idx_tryons_status ON tryons(status);
CREATE INDEX idx_tryons_expires_at ON tryons(expires_at);

-- Site integrations (e-commerce plugin tokens)
CREATE TABLE site_integrations (
  site_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_token VARCHAR(255) NOT NULL UNIQUE,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  allowed_domains TEXT[] NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_integrations_owner ON site_integrations(owner_user_id);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  detail JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- OTP verifications (phone authentication)
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number);
CREATE INDEX idx_otp_expires_at ON otp_verifications(expires_at);

-- =========================================================
-- ENHANCED SCHEMA V2.0 (Subscription, Notifications, Referrals)
-- =========================================================

-- User Profile table (enhanced user data for subscription system)
CREATE TABLE user_prof (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone_number VARCHAR(20),
  google_id VARCHAR(255),
  referral_code VARCHAR(50) UNIQUE,
  referred_by VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_prof_email ON user_prof(email);
CREATE INDEX idx_user_prof_referral_code ON user_prof(referral_code);

-- Vendor Profile table
CREATE TABLE vendor_prof (
  vendor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  contact_number VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendor_prof_email ON vendor_prof(email);

-- Master Subscription Plans
CREATE TABLE mstr_subscription (
  sub_id SERIAL PRIMARY KEY,
  sub_code VARCHAR(50) NOT NULL UNIQUE,
  sub_name VARCHAR(150) NOT NULL,
  sub_desc TEXT,
  duration_days INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mstr_subscription_code ON mstr_subscription(sub_code);

-- Standard Pricing
CREATE TABLE std_pricing (
  pricing_id SERIAL PRIMARY KEY,
  sub_id INTEGER NOT NULL REFERENCES mstr_subscription(sub_id) ON DELETE CASCADE,
  base_price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0.00,
  final_price DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_std_pricing_sub_id ON std_pricing(sub_id);

-- User Subscriptions
CREATE TABLE user_subscription (
  user_sub_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_prof(user_id) ON DELETE CASCADE,
  sub_id INTEGER NOT NULL REFERENCES mstr_subscription(sub_id) ON DELETE CASCADE,
  pricing_id INTEGER REFERENCES std_pricing(pricing_id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  renewal_token VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_subscription_user_id ON user_subscription(user_id);
CREATE INDEX idx_user_subscription_status ON user_subscription(status);
CREATE INDEX idx_user_subscription_end_date ON user_subscription(end_date);

-- Vendor Subscriptions
CREATE TABLE vendor_subscription (
  vendor_sub_id SERIAL PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES vendor_prof(vendor_id) ON DELETE CASCADE,
  sub_id INTEGER NOT NULL REFERENCES mstr_subscription(sub_id) ON DELETE CASCADE,
  pricing_id INTEGER REFERENCES std_pricing(pricing_id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendor_subscription_vendor_id ON vendor_subscription(vendor_id);
CREATE INDEX idx_vendor_subscription_status ON vendor_subscription(status);

-- Notifications
CREATE TABLE notifications (
  notif_id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_prof(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type notification_type,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Referrals
CREATE TABLE referrals (
  referral_id SERIAL PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES user_prof(user_id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES user_prof(user_id) ON DELETE CASCADE,
  reward_status reward_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);

-- =========================================================
-- SEED DATA (Default Subscription Plans)
-- =========================================================

-- Insert default subscription plans
INSERT INTO mstr_subscription (sub_code, sub_name, sub_desc, duration_days) VALUES
('BASIC', 'Basic Plan', 'Basic virtual try-on features with limited credits', 30),
('PRO', 'Pro Plan', 'Professional plan with advanced features and higher limits', 30),
('VENDOR_PREMIUM', 'Vendor Premium', 'Enterprise plan for vendors with unlimited try-ons', 30)
ON CONFLICT (sub_code) DO NOTHING;

-- Insert default pricing
INSERT INTO std_pricing (sub_id, base_price, discount_percent, final_price, currency) VALUES
((SELECT sub_id FROM mstr_subscription WHERE sub_code = 'BASIC'), 9.99, 0.00, 9.99, 'USD'),
((SELECT sub_id FROM mstr_subscription WHERE sub_code = 'PRO'), 29.99, 0.00, 29.99, 'USD'),
((SELECT sub_id FROM mstr_subscription WHERE sub_code = 'VENDOR_PREMIUM'), 89.99, 0.00, 89.99, 'USD')
ON CONFLICT DO NOTHING;

-- =========================================================
-- FUNCTIONS & TRIGGERS (Optional)
-- =========================================================

-- Function to update final_price automatically
CREATE OR REPLACE FUNCTION calculate_final_price()
RETURNS TRIGGER AS $$
BEGIN
  NEW.final_price := NEW.base_price * (1 - (NEW.discount_percent / 100));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_final_price
BEFORE INSERT OR UPDATE ON std_pricing
FOR EACH ROW
EXECUTE FUNCTION calculate_final_price();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_prof_updated_at
BEFORE UPDATE ON user_prof
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_vendor_prof_updated_at
BEFORE UPDATE ON vendor_prof
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- COMMENTS (Documentation)
-- =========================================================

COMMENT ON TABLE users IS 'Main user authentication and profile data';
COMMENT ON TABLE user_prof IS 'Enhanced user profile for subscription system';
COMMENT ON TABLE mstr_subscription IS 'Master subscription plans catalog';
COMMENT ON TABLE std_pricing IS 'Pricing information for subscription plans';
COMMENT ON TABLE user_subscription IS 'User subscription records and history';
COMMENT ON TABLE notifications IS 'User notifications for plan updates, expiry warnings, etc.';
COMMENT ON TABLE referrals IS 'User referral tracking and rewards';

-- =========================================================
-- VERIFICATION QUERIES
-- =========================================================

-- Run these queries to verify the schema was created successfully

-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all enums
SELECT t.typname as enum_name, 
       array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('subscription_plan', 'tryon_status', 'subscription_status', 'notification_type', 'reward_status')
GROUP BY t.typname;

-- Verify subscription plans
SELECT * FROM mstr_subscription;

-- Verify pricing
SELECT p.*, s.sub_code, s.sub_name 
FROM std_pricing p
JOIN mstr_subscription s ON p.sub_id = s.sub_id;
