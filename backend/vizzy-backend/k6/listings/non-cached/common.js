import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

// Test configuration for non-cached endpoints
export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 users over 10 seconds
    { duration: '40s', target: 20 }, // Stay at 20 users for 40 seconds
    { duration: '10s', target: 0 }, // Ramp down to 0 users over 10 seconds
  ],
  thresholds: {
    errors: ['rate<0.1'], // Error rate should be less than 10%
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
  },
  batch: 1, // Process one request at a time
  batchPerHost: 1, // One request per host at a time
  noConnectionReuse: true, // Don't reuse connections
  noVUConnectionReuse: true, // Don't reuse connections between VUs
};

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/v1';

// Sample test data
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// Headers for non-cached requests
export const HEADERS = {
  Accept: 'application/json',
  'Cache-Control':
    'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '-1',
  'If-None-Match': '*',
  'If-Modified-Since': '0',
  'X-Cache-Control': 'no-cache',
  'X-No-Cache': '1',
  Connection: 'close',
  'x-Skip-Cache': 'true',
  'x-Force-Fresh': 'true',
  'x-Performance-Test': 'non-cached',
};

// Helper function to add cache buster to URLs
export function addCacheBuster(url) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_=${timestamp}-${random}`;
}
