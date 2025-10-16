/**
 * Input Sanitization Utilities
 * Protects against XSS and injection attacks
 */

/**
 * Sanitize HTML content to prevent XSS
 */
export const sanitizeHTML = (html: string): string => {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

/**
 * Sanitize user input for safe display
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export const sanitizeURL = (url: string): string => {
  // Allow only http, https, and ipfs protocols
  const urlLower = url.toLowerCase().trim();
  
  if (
    urlLower.startsWith('http://') ||
    urlLower.startsWith('https://') ||
    urlLower.startsWith('ipfs://')
  ) {
    return url;
  }
  
  // Default to empty string for unsafe URLs
  return '';
};

/**
 * Sanitize NFT metadata for safe display
 */
export const sanitizeNFTMetadata = (metadata: {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  [key: string]: any;
}): {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  [key: string]: any;
} => {
  return {
    ...metadata,
    name: metadata.name ? sanitizeInput(metadata.name) : undefined,
    description: metadata.description
      ? sanitizeInput(metadata.description)
      : undefined,
    image: metadata.image ? sanitizeURL(metadata.image) : undefined,
    external_url: metadata.external_url
      ? sanitizeURL(metadata.external_url)
      : undefined,
  };
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate token ID
 */
export const isValidTokenId = (tokenId: string): boolean => {
  // Allow numeric and hex token IDs
  return /^[0-9]+$/.test(tokenId) || /^0x[a-fA-F0-9]+$/.test(tokenId);
};

/**
 * Sanitize and validate session key input
 */
export const validateSessionKeyInput = (input: {
  label: string;
  duration: string;
  permissions: string[];
}): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate label
  if (!input.label || input.label.trim().length === 0) {
    errors.push('Label is required');
  } else if (input.label.length > 100) {
    errors.push('Label must be less than 100 characters');
  }

  // Validate duration
  const duration = parseInt(input.duration, 10);
  if (isNaN(duration) || duration <= 0) {
    errors.push('Duration must be a positive number');
  } else if (duration > 8760) {
    // Max 1 year
    errors.push('Duration cannot exceed 1 year (8760 hours)');
  }

  // Validate permissions
  if (!input.permissions || input.permissions.length === 0) {
    errors.push('At least one permission is required');
  }

  const validPermissions = [
    'eth_sendTransaction',
    'eth_signTypedData',
    'personal_sign',
    'eth_sign',
  ];

  for (const perm of input.permissions) {
    if (!validPermissions.includes(perm)) {
      errors.push(`Invalid permission: ${perm}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Rate limiter for preventing abuse
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Filter out old requests
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    // Cleanup old entries periodically
    if (this.requests.size > 1000) {
      this.cleanup();
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const recent = requests.filter(
        (timestamp) => now - timestamp < this.windowMs
      );
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
