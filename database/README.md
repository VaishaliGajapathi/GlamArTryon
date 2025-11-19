# GlamAR Database Setup Guide

## Overview

GlamAR uses a multi-environment database strategy:
- **Development**: Replit built-in PostgreSQL
- **SIT/Staging**: External Neon PostgreSQL
- **Production**: External Neon PostgreSQL

## Environment Configuration

### Environment Variables

#### Development (Replit Postgres)
```bash
NODE_ENV=development
DATABASE_URL=<automatically_provided_by_replit>
```

#### SIT/Staging (Neon Postgres)
```bash
NODE_ENV=staging  # or 'sit'
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/database?sslmode=require
```

#### Production (Neon Postgres)
```bash
NODE_ENV=production
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/database?sslmode=require
```

## Neon Postgres Setup

### Option 1: Using Neon Console (Recommended for DBAs)

1. **Create Neon Project**
   - Go to [Neon Console](https://console.neon.tech)
   - Create new project (SIT or Production)
   - Copy the connection string

2. **Execute DDL Script**
   - Open SQL Editor in Neon Console
   - Copy contents of `database/schema.sql`
   - Execute the script
   - Verify tables were created using verification queries at the end of the script

3. **Configure Application**
   - Add `NEON_DATABASE_URL` to your environment variables
   - Set `NODE_ENV` to `staging` or `production`
   - Restart application

### Option 2: Using psql Command Line

```bash
# Connect to Neon database
psql "postgresql://user:password@ep-xxx.region.neon.tech/database?sslmode=require"

# Execute DDL script
\i database/schema.sql

# Verify tables
\dt

# Check subscription plans
SELECT * FROM mstr_subscription;
```

### Option 3: Using Drizzle Migration (For Development)

```bash
# Generate migration from schema
npm run db:generate

# Push schema to database
npm run db:push

# Or apply migrations
npm run db:migrate
```

## Database Schema Overview

### Core Tables (Legacy Schema)
- `users` - Main user authentication and profile
- `refresh_tokens` - JWT refresh tokens
- `tryons` - Virtual try-on history
- `site_integrations` - E-commerce plugin tokens
- `admin_users` - Admin accounts
- `audit_logs` - System audit trail
- `otp_verifications` - Phone OTP authentication

### Enhanced Schema v2.0 (Subscription System)
- `user_prof` - Enhanced user profiles
- `vendor_prof` - Vendor accounts
- `mstr_subscription` - Subscription plan catalog
- `std_pricing` - Pricing information
- `user_subscription` - User subscription records
- `vendor_subscription` - Vendor subscription records
- `notifications` - User notifications
- `referrals` - Referral tracking and rewards

### Enums
- `subscription_plan`: free, basic, pro, enterprise
- `tryon_status`: queued, processing, done, failed
- `subscription_status`: active, expired, renewed
- `notification_type`: update, plan, expiry, renewal
- `reward_status`: pending, granted

## Default Subscription Plans

The schema includes three default subscription plans:

| Plan Code | Plan Name | Price | Duration |
|-----------|-----------|-------|----------|
| BASIC | Basic Plan | $9.99/month | 30 days |
| PRO | Pro Plan | $29.99/month | 30 days |
| VENDOR_PREMIUM | Vendor Premium | $89.99/month | 30 days |

## Automated Features

### Triggers
- `calculate_final_price` - Automatically calculates final price with discounts
- `update_updated_at_column` - Updates timestamp on record modification

### Indexes
All foreign keys and frequently queried fields have indexes for optimal performance.

## Migration Strategy

### From Development to SIT
1. Export development data (if needed):
   ```bash
   pg_dump $DATABASE_URL > dev_backup.sql
   ```

2. Set up SIT Neon database using `schema.sql`

3. Import data (optional):
   ```bash
   psql $NEON_DATABASE_URL < dev_backup.sql
   ```

### From SIT to Production
1. Verify SIT database is stable
2. Create production Neon project
3. Execute `schema.sql` on production
4. Set up production environment variables
5. Deploy application with `NODE_ENV=production`

## Connection Pooling

The application uses connection pooling with the following settings:
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 10 seconds
- SSL: Enabled for SIT/Production (Neon requires SSL)

## Verification

After setting up the database, verify the installation:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify subscription plans
SELECT * FROM mstr_subscription;

-- Check pricing
SELECT p.*, s.sub_code, s.sub_name 
FROM std_pricing p
JOIN mstr_subscription s ON p.sub_id = s.sub_id;

-- Test connection from application
-- The application logs will show:
-- "✅ Database connection successful"
```

## Troubleshooting

### Connection Issues
- Verify `NEON_DATABASE_URL` is correctly formatted
- Ensure SSL mode is set to `require` for Neon
- Check Neon project is not paused (free tier auto-pauses)
- Verify IP allowlist in Neon console (if configured)

### Schema Issues
- If tables already exist, you may need to drop them first (see `schema.sql` DROP section)
- Ensure enums are created before tables that reference them
- Check for conflicts with existing data

### Performance Issues
- Verify all indexes are created
- Monitor connection pool usage
- Consider upgrading Neon tier for higher limits
- Enable query logging to identify slow queries

## Security Best Practices

1. **Never commit credentials**
   - Use environment variables for all database URLs
   - Keep `.env` files out of version control

2. **Use SSL/TLS**
   - Always use `sslmode=require` for Neon connections
   - Neon enforces SSL by default

3. **Principle of least privilege**
   - Create separate database users for different environments
   - Grant only necessary permissions

4. **Regular backups**
   - Neon provides automated backups on paid tiers
   - Set up manual backups for critical data

5. **Monitoring**
   - Enable connection logging
   - Monitor query performance
   - Set up alerts for connection failures

## Support

For issues with:
- **Replit Postgres**: Check Replit documentation or support
- **Neon Postgres**: Visit [Neon Docs](https://neon.tech/docs) or contact Neon support
- **Application Database**: Check application logs or contact development team

---

**Last Updated**: 2025-11-15
**Schema Version**: 2.0
**Maintained By**: GlamAR Development Team
