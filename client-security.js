/**
 * Client-Side Security Module
 * Provides input validation, data protection, and security features
 */

// ==================
// INPUT VALIDATION
// ==================

const ValidationRules = {
  // Name validation
  name: (str) => {
    return typeof str === "string" && str.trim().length > 0 && str.trim().length <= 100;
  },

  // Email validation
  email: (str) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  },

  // Phone validation
  phone: (str) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
    return phoneRegex.test(str);
  },

  // Amount validation (positive number)
  amount: (num) => {
    return !isNaN(num) && Number(num) > 0 && Number(num) <= 999999999;
  },

  // Interest rate validation (0-100)
  interestRate: (num) => {
    return !isNaN(num) && Number(num) >= 0 && Number(num) <= 100;
  },

  // Date validation
  date: (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  },

  // Address validation
  address: (str) => {
    return typeof str === "string" && str.trim().length > 0 && str.trim().length <= 500;
  },

  // Password validation (minimum 6 chars)
  password: (str) => {
    return typeof str === "string" && str.length >= 6 && str.length <= 100;
  },

  // Username validation
  username: (str) => {
    return typeof str === "string" && /^[a-zA-Z0-9_]{3,20}$/.test(str);
  },
};

/**
 * Validate loan record
 */
function validateLoanRecord(record) {
  const errors = [];

  if (!ValidationRules.name(record.firstName)) {
    errors.push("First name is required (1-100 characters)");
  }

  if (!ValidationRules.name(record.lastName)) {
    errors.push("Last name is required (1-100 characters)");
  }

  if (record.contactNumber && !ValidationRules.phone(record.contactNumber)) {
    errors.push("Invalid phone number format");
  }

  if (record.amount && !ValidationRules.amount(record.amount)) {
    errors.push("Amount must be between 0 and 999,999,999");
  }

  if (record.interestRate && !ValidationRules.interestRate(record.interestRate)) {
    errors.push("Interest rate must be between 0 and 100");
  }

  if (record.dateGranted && !ValidationRules.date(record.dateGranted)) {
    errors.push("Invalid date format");
  }

  if (record.address && !ValidationRules.address(record.address)) {
    errors.push("Address must be between 1 and 500 characters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ==================
// XSS PREVENTION
// ==================

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str) {
  if (typeof str !== "string") return "";

  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Create safe HTML element
 */
function createSafeElement(tag, text = "", classList = []) {
  const element = document.createElement(tag);
  element.textContent = text; // textContent prevents XSS
  classList.forEach((cls) => element.classList.add(cls));
  return element;
}

// ==================
// DATA ENCRYPTION (Client-side)
// ==================

/**
 * Simple client-side encryption using Web Crypto API
 */
async function encryptData(data, password) {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));

    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      dataBuffer
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combinedArray = new Uint8Array(iv.length + encryptedArray.length);
    combinedArray.set(iv);
    combinedArray.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...combinedArray));
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Data encryption failed");
  }
}

/**
 * Decrypt data
 */
async function decryptData(encryptedData, password) {
  try {
    const encoder = new TextEncoder();
    const combinedArray = Uint8Array.from(atob(encryptedData), (c) =>
      c.charCodeAt(0)
    );

    const iv = combinedArray.slice(0, 12);
    const encryptedBuffer = combinedArray.slice(12);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encryptedBuffer
    );

    const decoded = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Data decryption failed");
  }
}

// ==================
// SESSION SECURITY
// ==================

/**
 * Secure session manager
 */
class SecureSession {
  constructor(timeout = 30 * 60 * 1000) {
    // 30 minutes default
    this.timeout = timeout;
    this.lastActivity = Date.now();
    this.startActivityMonitoring();
  }

  startActivityMonitoring() {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, () => this.updateActivity());
    });
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  isSessionValid() {
    return Date.now() - this.lastActivity < this.timeout;
  }

  getTimeRemaining() {
    const remaining = this.timeout - (Date.now() - this.lastActivity);
    return Math.max(0, remaining);
  }

  checkSession() {
    if (!this.isSessionValid()) {
      this.logout();
      return false;
    }
    return true;
  }

  logout() {
    sessionStorage.clear();
    localStorage.removeItem("mgi_logged_in");
    window.location.href = "index.html";
    throw new Error("Session expired. Please log in again.");
  }
}

// ==================
// PASSWORD SECURITY
// ==================

/**
 * Validate password strength
 */
function getPasswordStrength(password) {
  let strength = 0;
  const feedback = [];

  if (!password) {
    return { strength: 0, feedback: ["Password is required"] };
  }

  if (password.length >= 8) strength++;
  else feedback.push("Use at least 8 characters");

  if (password.match(/[a-z]/)) strength++;
  else feedback.push("Add lowercase letters");

  if (password.match(/[A-Z]/)) strength++;
  else feedback.push("Add uppercase letters");

  if (password.match(/[0-9]/)) strength++;
  else feedback.push("Add numbers");

  if (password.match(/[^a-zA-Z0-9]/)) strength++;
  else feedback.push("Add special characters");

  const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return {
    strength,
    level: levels[strength] || "Strong",
    feedback,
  };
}

// ==================
// DATA INTEGRITY
// ==================

/**
 * Generate checksum for data integrity
 */
function generateChecksum(data) {
  const crypto = window.crypto || window.msCrypto;
  const str = JSON.stringify(data);
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash.toString(16);
}

/**
 * Verify data integrity
 */
function verifyDataIntegrity(data, checksum) {
  return generateChecksum(data) === checksum;
}

// ==================
// SECURE STORAGE
// ==================

/**
 * Secure storage wrapper for localStorage
 */
const SecureStorage = {
  setItem(key, value, useEncryption = false) {
    try {
      const sanitizedKey = sanitizeString(key);
      const data = {
        value,
        timestamp: Date.now(),
        checksum: generateChecksum(value),
      };
      localStorage.setItem(sanitizedKey, JSON.stringify(data));
    } catch (error) {
      console.error("Storage error:", error);
    }
  },

  getItem(key) {
    try {
      const sanitizedKey = sanitizeString(key);
      const item = localStorage.getItem(sanitizedKey);
      if (!item) return null;

      const data = JSON.parse(item);
      
      // Verify integrity
      if (!verifyDataIntegrity(data.value, data.checksum)) {
        console.warn("Data integrity check failed for key:", key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error("Storage retrieval error:", error);
      return null;
    }
  },

  removeItem(key) {
    try {
      const sanitizedKey = sanitizeString(key);
      localStorage.removeItem(sanitizedKey);
    } catch (error) {
      console.error("Storage removal error:", error);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Storage clear error:", error);
    }
  },
};

// ==================
// API SECURITY
// ==================

/**
 * Secure API request wrapper
 */
async function secureApiRequest(url, options = {}) {
  const defaultOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    credentials: "same-origin",
  };

  const requestOptions = { ...defaultOptions, ...options };

  if (requestOptions.body && typeof requestOptions.body === "object") {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

// ==================
// EXPORT FUNCTIONS
// ==================

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    ValidationRules,
    validateLoanRecord,
    sanitizeString,
    createSafeElement,
    encryptData,
    decryptData,
    SecureSession,
    getPasswordStrength,
    generateChecksum,
    verifyDataIntegrity,
    SecureStorage,
    secureApiRequest,
  };
}
