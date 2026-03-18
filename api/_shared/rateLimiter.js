/**
 * ODIPA Rate Limiter — In-memory IP-based throttling
 *
 * Limits per IP per endpoint per time window.
 * Note: In-memory only — resets on cold starts. Sufficient for ODIPA's
 * traffic volume. For higher scale, swap store for Azure Cache for Redis.
 */

const store = new Map()

/**
 * Check if a request should be rate limited.
 * @param {string} ip       - Client IP address
 * @param {string} endpoint - Endpoint identifier (e.g. 'newsletter')
 * @param {object} opts     - { max: number, windowMs: number }
 * @returns {{ limited: boolean, remaining: number, resetMs: number }}
 */
function checkRateLimit(ip, endpoint, opts = {}) {
  const max      = opts.max      || 5     // max requests per window
  const windowMs = opts.windowMs || 60000 // 1 minute default

  const key = `${endpoint}:${ip}`
  const now = Date.now()

  // Clean up expired entries periodically
  if (store.size > 10000) {
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) store.delete(k)
    }
  }

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, remaining: max - 1, resetMs: now + windowMs }
  }

  entry.count++

  if (entry.count > max) {
    return { limited: true, remaining: 0, resetMs: entry.resetAt }
  }

  return { limited: false, remaining: max - entry.count, resetMs: entry.resetAt }
}

/**
 * Get client IP from Azure Functions request object.
 * Falls back through common proxy headers.
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.headers['client-ip'] ||
    req.originalUrl ||
    'unknown'
  )
}

module.exports = { checkRateLimit, getClientIp }
