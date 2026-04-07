# MGi CS System - Security Hardening Guide

## Overview
This document outlines the security enhancements implemented to protect the Morris Gilbert Inso Credit Services system from breaches, data loss, and attacks.

## Security Layers Implemented

### 1. Server-Side Security (server-secure.js)

#### A. Security Headers
- **X-Frame-Options**: SAMEORIGIN - Prevents clickjacking attacks
- **X-Content-Type-Options**: nosniff - Prevents MIME sniffing
- **X-XSS-Protection**: 1; mode=block - XSS attack protection
- **Referrer-Policy**: strict-origin-when-cross-origin - Controls referrer information
- **Permissions-Policy**: Restricts browser features (geolocation, microphone, camera)
- **Content-Security-Policy**: Controls resource loading to prevent injection attacks

#### B. CORS Protection
- Only whitelisted origins allowed
- Configure ALLOWED_ORIGINS environment variable
- Credentials required for cross-origin requests
- Only necessary HTTP methods allowed

#### C. Rate Limiting
- 100 requests per minute per IP per endpoint
- Prevents DoS and brute-force attacks
- Returns 429 status when limit exceeded

#### D. Input Validation
- Request body size limit: 100KB
- ID parameter format validation
- Array payload validation
- Strict JSON parsing

#### E. Audit Logging
- Tracks all data modifications
- Records IP addresses
- Logs backup imports/exports
- Logs errors and security events

#### F. Data Integrity
- HMAC checksums on all data
- Backup hash verification
- Detects data tampering
- Version tracking

#### G. Database PostgreSQL Features
- Parameterized queries (prevents SQL injection)
- Connection pooling with timeouts
- Transaction support for consistency
- SSL/TLS for database connections

### 2. Client-Side Security (client-security.js)

#### A. Input Validation
- Comprehensive validation rules
- Real-time form validation
- Type checking
- Length constraints

#### B. XSS Prevention
- HTML sanitization
- textContent instead of innerHTML
- Safe element creation
- Input encoding

#### C. Client-Side Encryption
- Web Crypto API for encryption
- AES-256-GCM encryption
- PBKDF2 key derivation
- Secure random IVs and salts

#### D. Session Security
- Inactivity timeout (30 minutes default)
- Activity monitoring
- Auto-logout
- Session validation

#### E. Password Security
- Strength validation
- Minimum 6 characters enforced
- Real-time feedback
- No plaintext storage

#### F. Data Integrity
- Checksum generation
- Integrity verification
- Tampering detection

#### G. Secure Storage
- Verified localStorage access
- Automatic checksumming
- Sanitized keys
- Error resilience

### 3. Database Security

#### A. Schema Enhancements
- `app_state` table with checksum tracking
- `audit_logs` table for all activities
- `data_backup` table for backup records
- Indexes for query performance

#### B. Field-Level Protection
- PII encryption flag
- Version tracking
- Timestamp tracking
- User attribution

#### C. Backup Security
- Backup hash verification
- Encrypted backup support
- Backup records with meta info
- Restore integrity checks

### 4. General Security Features

#### A. Error Handling
- Generic error messages to users
- Detailed logs for developers
- No sensitive data in responses
- Graceful degradation

#### B. Request Tracking
- Unique request IDs
- IP address logging
- Timestamp tracking
- Activity correlation

#### C. Secrets Management
- Environment variable based
- SECRET_KEY for HMAC operations
- NO hardcoded credentials
- Sensitive data protected

## Implementation Steps

### Step 1: Replace server.js with server-secure.js
```bash
# Backup original
cp server.js server-backup.js

# Use new secure version
cp server-secure.js server.js
```

### Step 2: Update package.json Dependencies
Ensure these packages are installed:
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.11.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.0"
  }
}
```

### Step 3: Configure Environment Variables
Create or update `.env`:
```env
# Database
SUPABASE_DB_URL=postgresql://...
# Or
DATABASE_URL=postgresql://...

# Security
SECRET_KEY=your-very-secure-random-string-here
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Server
PORT=10000
```

### Step 4: Include Client-Side Security
Add to HTML files (before other scripts):
```html
<script src="client-security.js"></script>
```

### Step 5: Use Secure Functions in Client Code
In your forms and data operations:
```javascript
// Validate input
const validation = validateLoanRecord(formData);
if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
  return;
}

// Sanitize output
const safeText = sanitizeString(userInput);

// Encrypt sensitive data before backup
const encryptedBackup = await encryptData(data, password);

// Use secure API calls
const response = await secureApiRequest("/api/state/loans", {
  method: "PUT",
  body: { payload: validatedData }
});
```

### Step 6: Update Database Connection
The secure server automatically:
- Creates audit tables
- Sets up indexes
- Enables SSL/TLS
- Configures connection pooling

## Security Checklist

### Pre-Deployment
- [ ] Update environment variables
- [ ] Test CORS configuration
- [ ] Verify rate limiting
- [ ] Test audit logging
- [ ] Verify checksum validation
- [ ] Test error handling
- [ ] Load test rate limits
- [ ] Review database backup strategy

### Post-Deployment
- [ ] Monitor audit logs regularly
- [ ] Review security headers with online tools
- [ ] Test with security scanners (OWASP ZAP)
- [ ] Monitor error logs
- [ ] Verify rate limiting works
- [ ] Test data integrity validation
- [ ] Schedule regular backups
- [ ] Plan security updates

## Monitoring & Maintenance

### Daily
- Check error logs
- Review audit trails for suspicious activity
- Monitor database connection pool

### Weekly
- Review rate limit statistics
- Check backup integrity
- Verify all security headers present

### Monthly
- Security audit
- Dependency updates
- Password rotation
- Access review

### Quarterly
- Penetration testing
- Full security review
- Disaster recovery test
- Backup restoration test

## Additional Hardening Measures

### 1. Enable HTTPS/TLS
- Use SSL certificates
- Redirect HTTP to HTTPS
- Set HSTS header

### 2. Setup Web Application Firewall
- Use cloud WAF (AWS WAF, Cloudflare)
- Block malicious patterns
- Rate limit per country if needed

### 3. Implement DDoS Protection
- Use CDN with DDoS protection
- Configure rate limiting per IP
- Monitor for attack patterns

### 4. Database Backups
- Automated daily backups
- Encrypted backup storage
- Test restore procedures
- Long-term archival

### 5. Access Control
- Implement role-based access (RBAC)
- Principle of least privilege
- API key management
- IP whitelisting for admin

## Compliance

This implementation helps meet requirements for:
- OWASP Top 10
- PCI DSS (for credit card info if applicable)
- GDPR (data protection)
- General security best practices

## Troubleshooting

### Rate Limit Too Strict
```javascript
// In server-secure.js, adjust:
const RATE_LIMIT = 200; // increase
const WINDOW_SIZE = 60000; // increase window
```

### CORS Issues
```bash
# Update .env
ALLOWED_ORIGINS=http://localhost:5500,https://yourdomain.com
```

### Audit Logs Errors
Audit logs are non-blocking. If audit_logs table doesn't exist:
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Support

For security issues, DO NOT disclose publicly:
1. Document the issue
2. Contact development team privately
3. Allow reasonable time for fix
4. Follow responsible disclosure

## Updates & Patches

- Subscribe to security updates from Node.js
- Keep dependencies updated
- Monitor npm audit warnings
- Apply patches promptly

---

**Security is an ongoing process. Review and update these measures regularly.**
