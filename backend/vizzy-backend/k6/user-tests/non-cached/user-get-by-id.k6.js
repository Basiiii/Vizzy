import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/v1';

// Test configuration
const EXISTING_USER_ID = '00000000-0000-0000-0000-000000000001';
const NON_EXISTING_USER_ID = '00000000-0000-0000-0000-000000000002';
const SLEEP_TIME = 1; // seconds between requests

// Custom metrics
const userGetByIdTrend = new Trend('user_get_by_id_duration_no_cache', true);
const userGetByIdNotFoundTrend = new Trend(
  'user_get_by_id_not_found_duration_no_cache',
  true,
);
const errorRate = new Rate('errors');

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    user_get_by_id_duration_no_cache: ['p(95)<400', 'p(99)<800'],
    user_get_by_id_not_found_duration_no_cache: ['p(95)<450', 'p(99)<900'],
    errors: ['rate<0.01'],
  },
};

/**
 * Tests the GET /users/:id endpoint with cache skipping
 *
 * Test scenarios:
 * 1. Get existing user by ID (should return 200)
 * 2. Get non-existent user by ID (should return 404)
 *
 * Metrics tracked:
 * - Response times for both scenarios
 * - Error rates
 * - HTTP request durations
 */
export default function () {
  const headers = {
    'x-skip-cache': 'true', // Skip cache header
  };

  // Test existing user lookup
  const resExist = http.get(`${BASE_URL}/users/${EXISTING_USER_ID}`, {
    headers: headers,
    tags: { name: 'UserGetByIdNoCache' },
    expectedStatuses: [200],
  });

  check(resExist, {
    'Get Existing User (No Cache): status is 200': (r) => r.status === 200,
    'Get Existing User (No Cache): has correct ID': (r) =>
      r.json('id') === EXISTING_USER_ID,
    'Get Existing User (No Cache): has required fields': (r) =>
      r.json('username') !== undefined &&
      r.json('name') !== undefined &&
      r.json('email') !== undefined,
  });

  userGetByIdTrend.add(resExist.timings.duration);
  errorRate.add(resExist.status !== 200);

  sleep(SLEEP_TIME);

  // Test non-existent user lookup
  const resNotExist = http.get(`${BASE_URL}/users/${NON_EXISTING_USER_ID}`, {
    headers: headers,
    tags: { name: 'UserGetByIdNotFoundNoCache' },
    expectedStatuses: [404],
  });

  check(resNotExist, {
    'Get Non-Existing User (No Cache): status is 404': (r) => r.status === 404,
  });

  userGetByIdNotFoundTrend.add(resNotExist.timings.duration);
  errorRate.add(resNotExist.status !== 404);

  sleep(SLEEP_TIME);
}
