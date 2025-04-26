import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

// Test configuration for cached endpoints
export const options = {
  stages: [
    { duration: '10s', target: 100 }, // Ramp up to 100 users over 10 seconds
    { duration: '40s', target: 100 }, // Stay at 100 users for 40 seconds
    { duration: '10s', target: 0 }, // Ramp down to 0 users over 10 seconds
  ],
  thresholds: {
    errors: ['rate<0.1'], // Error rate should be less than 10%
    http_req_duration: ['p(95)<50'], // 95% of requests should be below 50ms (cached)
  },
};

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/v1';

// Sample test data
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
export const TEST_LISTING_ID = 1;

// Headers for cached requests
export const HEADERS = {
  Accept: 'application/json',
  'Cache-Control': 'max-age=3600', // Allow caching for 1 hour
};
