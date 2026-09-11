# Rate Limiting Implementation - AI Analysis API

## Overview
Added rate limiting protection to the medical report analysis endpoint to prevent mass attacks and API abuse. This protects against:
- Brute force attacks on the API
- Excessive Gemini API calls that could cause service degradation
- Unintended DDoS-style behavior from buggy clients
- Cost explosion from unlimited API usage

## Implementation Details

### Rate Limiting Configuration

**File**: `/run/media/karan/Local Disk/Medicare/Backend/middleware/User/rateLimitAI.js`

#### Standard Rate Limit (Applied)
- **Requests**: 10 per user
- **Time Window**: 15 minutes
- **Status Code When Exceeded**: 429 (Too Many Requests)
- **Key Generator**: User ID (from JWT token), with IPv6-safe fallback

#### Strict Rate Limit (Available Alternative)
- **Requests**: 5 per user
- **Time Window**: 1 hour
- **Use Case**: For production with stricter abuse prevention

#### Global Rate Limit (Backup)
- **Requests**: 20 per IP
- **Time Window**: 15 minutes
- **Use Case**: Protection for unauthenticated requests (pre-login)

### How It Works

1. **Per-User Tracking**: Each user is identified by their JWT token's user ID
2. **Sliding Window**: Uses a 15-minute sliding window for the standard limit
3. **User-Specific**: Different users have independent limits (one user's requests don't affect another)
4. **Graceful Degradation**: Returns HTTP 429 with helpful retry information

### Request Flow

```
User Request
    ↓
JWT Token Verification (existing middleware)
    ↓
Rate Limit Check (NEW)
    ├─ Within limit? → Continue to analyzeReport
    └─ Over limit? → Return HTTP 429 with retry info
```

### API Integration

**File**: `/run/media/karan/Local Disk/Medicare/Backend/routes/User/reports.routes.js`

```javascript
router.post("/:reportId/analyze", analyzeReportRateLimit, analyzeReport);
```

The rate limiting middleware is applied **before** the actual analysis controller, so it prevents expensive API calls from being made in the first place.

## Response Examples

### Success Response (Within Limit)
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1647814500
Content-Type: application/json

{
  "success": true,
  "message": "Report analyzed successfully",
  "data": {
    "reportId": "69bafb23c903cef65e637d98",
    "analysis": { ... }
  }
}
```

### Rate Limited Response (Over Limit)
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1647814500
Content-Type: application/json

{
  "success": false,
  "message": "Too many analysis requests. Please try again in 12 minutes.",
  "retryAfter": 12
}
```

## Headers Included in Responses

- **X-RateLimit-Limit**: Total number of requests allowed (10)
- **X-RateLimit-Remaining**: Number of requests remaining in current window
- **X-RateLimit-Reset**: Unix timestamp when the limit resets

## Monitoring & Logging

Rate limit violations are logged with:
```
[Rate Limit] User 683357ac458b2622947ccbcb exceeded AI analysis limit. Retry after 12 minutes
```

This helps identify:
- Users with high request volumes
- Potential abuse patterns
- API usage trends

## Configuration Changes

### To Enable Strict Mode (5 requests/hour)

Edit [routes/User/reports.routes.js](routes/User/reports.routes.js):

```javascript
// Replace:
import { analyzeReportRateLimit } from "../../middleware/User/rateLimitAI.js";
// With:
import { analyzeReportRateLimitStrict } from "../../middleware/User/rateLimitAI.js";

// And update the route:
router.post("/:reportId/analyze", analyzeReportRateLimitStrict, analyzeReport);
```

### To Change Limits

Edit [middleware/User/rateLimitAI.js](middleware/User/rateLimitAI.js):

```javascript
export const analyzeReportRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // Change time window
  max: 10,                    // Change request count limit
  // ...
});
```

## Cost & Performance Benefits

1. **API Cost Protection**: 
   - Gemini API costs per request
   - Limiting to 10 requests/15min prevents accidental $100+ bills
   - Approximately $0.10 per analysis request at current pricing

2. **Server Resource Protection**:
   - Vision API and Gemini API calls consume resources
   - Rate limiting prevents resource exhaustion
   - Reduces unnecessary computation

3. **DoS Attack Prevention**:
   - Prevents malicious users from overwhelming the service
   - IP-level fallback protects unauthenticated endpoints

## Testing the Rate Limit

### Manual Test (Recommended)
```bash
# Make 10 successful requests
for i in {1..10}; do
  curl -X POST http://localhost:4000/api/reports/{reportId}/analyze \
    -H "Authorization: Bearer {token}" \
    -w "\nStatus: %{http_code}\n"
done

# Request 11 should return 429
curl -X POST http://localhost:4000/api/reports/{reportId}/analyze \
  -H "Authorization: Bearer {token}" \
  -w "\nStatus: %{http_code}\n"
```

### Automated Test
```bash
cd Backend
./test-rate-limit.sh  # Full test (12 requests)
./quick-test-rate-limit.sh  # Quick header check
```

## Best Practices for Users

1. **Batch Processing**: Process multiple reports in a single session within limits
2. **Error Handling**: Implement exponential backoff when receiving 429 responses
3. **Monitoring**: Track `X-RateLimit-Remaining` header to anticipate limits
4. **User Education**: Inform users that frequent analysis has limits

## Frontend Integration

### Handling Rate Limit Errors

```javascript
async function analyzeReport(reportId, token) {
  const response = await fetch(`/api/reports/${reportId}/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 429) {
    const data = await response.json();
    const retryMinutes = data.retryAfter;
    alert(`Rate limited. Please try again in ${retryMinutes} minutes.`);
    return null;
  }

  return await response.json();
}
```

### Checking Rate Limit Status

```javascript
// Check headers to see remaining requests
const remaining = response.headers.get('X-RateLimit-Remaining');
const limit = response.headers.get('X-RateLimit-Limit');
console.log(`Remaining: ${remaining}/${limit}`);
```

## Security Considerations

1. **Authenticated Tracking**: Users tracked by JWT ID, not IP (prevents proxy bypass)
2. **IPv6 Safe**: Uses express-rate-limit's ipKeyGenerator for proper IPv6 handling
3. **No Data Leakage**: Rate limit info doesn't expose system details
4. **Graceful**: Returns clear, actionable error messages

## Future Enhancements

1. **Dynamic Limits**: Adjust limits based on subscription tier
2. **Quota System**: Track total daily/monthly requests per user
3. **Priority Queue**: Allow premium users to skip queues
4. **Usage Analytics**: Dashboard showing request patterns
5. **ML Detection**: Identify suspicious patterns automatically

## Database & Storage

Rate limiting uses in-memory store by default. For distributed systems, consider:
- Redis for rate limit store (across multiple servers)
- MongoDB for persistent quota tracking
- Memcached for distributed caching

## Related Files

- **Middleware**: [middleware/User/rateLimitAI.js](middleware/User/rateLimitAI.js) - Rate limit configuration
- **Routes**: [routes/User/reports.routes.js](routes/User/reports.routes.js) - Endpoint configuration
- **Controller**: [controllers/User/reportAnalysis.controller.js](controllers/User/reportAnalysis.controller.js) - Analysis handler
- **AI Utility**: [utils/aiAnalysis.js](utils/aiAnalysis.js) - Gemini API integration

## Deployment Notes

- **Development**: Works with default in-memory store
- **Production**: Consider using Redis store for distributed deployments
- **Monitoring**: Add alerts for repeated 429 responses from same user
- **Logs**: Regularly review rate limit logs to detect abuse patterns

---

**Last Updated**: March 19, 2026
**Status**: ✅ Active and Tested
