/**
 * Security Utilities Module
 * Provides encryption, validation, and authentication functions
 */

const crypto = require("crypto");

// Configuration
const ENCRYPTION_ALGO = "aes-256-gcm";
const HASH_ALGO = "sha256";
const SALT_ROUNDS = 10;

/**
 * Encrypt sensitive data
 * @param {string} text - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {string} - Encrypted data with IV and auth tag
 */
function encrypt(text, key) {
  try {
    const keyHash = crypto.createHash(HASH_ALGO).update(key).digest().slice(0, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGO, keyHash, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Decrypt encrypted data
 * @param {string} encryptedData - Data to decrypt (format: iv:authTag:encrypted)
 * @param {string} key - Decryption key
 * @returns {string} - Decrypted data
 */
function decrypt(encryptedData, key) {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
    const keyHash = crypto.createHash(HASH_ALGO).update(key).digest().slice(0, 32);
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGO, keyHash, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Decryption failed");
  }
}

/**
 * Generate HMAC for data integrity verification
 * @param {string} data - Data to hash
 * @param {string} secret - Secret key
 * @returns {string} - HMAC digest
 */
function generateHmac(data, secret) {
  return crypto.createHmac(HASH_ALGO, secret).update(data).digest("hex");
}

/**
 * Verify HMAC for data integrity
 * @param {string} data - Original data
 * @param {string} hmac - HMAC to verify
 * @param {string} secret - Secret key
 * @returns {boolean} - True if valid
 */
function verifyHmac(data, hmac, secret) {
  const computed = generateHmac(data, secret);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hmac));
}

/**
 * Hash password using crypto
 * @param {string} password - Password to hash
 * @returns {string} - Hashed password with salt
 */
function hashPassword(password) {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, HASH_ALGO).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify password against hash
 * @param {string} password - Password to verify
 * @param {string} hash - Password hash (salt:hash)
 * @returns {boolean} - True if matches
 */
function verifyPassword(password, hash) {
  try {
    const [salt, storedHash] = hash.split(":");
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, HASH_ALGO).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
  } catch (error) {
    return false;
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone to validate
 * @returns {boolean} - True if valid
 */
function validatePhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize string to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Validate and sanitize loan record
 * @param {object} record - Record to validate
 * @returns {object} - Validated and sanitized record
 */
function validateLoanRecord(record) {
  const errors = [];
  
  if (!record.firstName || typeof record.firstName !== "string" || record.firstName.trim().length === 0) {
    errors.push("First name is required");
  }
  
  if (!record.lastName || typeof record.lastName !== "string" || record.lastName.trim().length === 0) {
    errors.push("Last name is required");
  }
  
  if (record.amount && (isNaN(record.amount) || Number(record.amount) <= 0)) {
    errors.push("Amount must be a positive number");
  }
  
  if (record.interestRate && (isNaN(record.interestRate) || Number(record.interestRate) < 0)) {
    errors.push("Interest rate cannot be negative");
  }
  
  if (record.contactNumber && !validatePhone(record.contactNumber)) {
    errors.push("Invalid phone number format");
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }
  
  // Sanitize string fields
  return {
    ...record,
    firstName: sanitizeString(record.firstName),
    lastName: sanitizeString(record.lastName),
    address: sanitizeString(record.address || ""),
    contactNumber: sanitizeString(record.contactNumber || ""),
    coMaker: sanitizeString(record.coMaker || ""),
  };
}

/**
 * Generate authentication token
 * @param {string} userId - User identifier
 * @param {string} secret - Secret for signing
 * @returns {string} - JWT-like token
 */
function generateToken(userId, secret) {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = generateHmac(`${header}.${body}`, secret);
  
  return `${header}.${body}.${signature}`;
}

/**
 * Verify authentication token
 * @param {string} token - Token to verify
 * @param {string} secret - Secret for verification
 * @returns {object|null} - Decoded payload or null if invalid
 */
function verifyToken(token, secret) {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;
    
    const expectedSig = generateHmac(`${header}.${body}`, secret);
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(body, "base64").toString());
    if (payload.exp < Date.now()) return null;
    
    return payload;
  } catch (error) {
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt,
  generateHmac,
  verifyHmac,
  hashPassword,
  verifyPassword,
  validateEmail,
  validatePhone,
  sanitizeString,
  validateLoanRecord,
  generateToken,
  verifyToken,
};
