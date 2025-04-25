import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/v1';

// Test configuration
const EXISTING_USERNAME = 'Basi';
const NON_EXISTING_USERNAME = 'user_does_not_exist_12345';
const SLEEP_TIME = 1; // seconds between requests

// Custom metrics
const userLookupExistingTrend = new Trend(
  'user_lookup_existing_duration',
  true,
);
const userLookupNotFoundTrend = new Trend(
  'user_lookup_not_found_duration',
  true,
);
const errorRate = new Rate('errors');

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    // Overall HTTP request duration
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    // Custom metrics for specific endpoints
    user_lookup_existing_duration: ['p(95)<400', 'p(99)<800'],
    user_lookup_not_found_duration: ['p(95)<450', 'p(99)<900'],
    // Error rate should be less than 1%
    errors: ['rate<0.01'],
  },
};

/**
 * Tests the GET /users/lookup/:username endpoint
 *
 * Test scenarios:
 * 1. Lookup existing user (should return 200)
 * 2. Lookup non-existent user (should return 404)
 *
 * Metrics tracked:
 * - Response times for both scenarios
 * - Error rates
 * - HTTP request durations
 */
export default function () {
  // Test existing user lookup
  const resExist = http.get(`${BASE_URL}/users/lookup/${EXISTING_USERNAME}`, {
    tags: { name: 'UserLookupExisting' },
    expectedStatuses: [200],
  });

  check(resExist, {
    'Lookup Existing: status is 200': (r) => r.status === 200,
    'Lookup Existing: has correct username': (r) =>
      r.json('username') === EXISTING_USERNAME,
  });

  userLookupExistingTrend.add(resExist.timings.duration);
  errorRate.add(resExist.status !== 200);

  sleep(SLEEP_TIME);

  // Test non-existent user lookup
  const resNotExist = http.get(
    `${BASE_URL}/users/lookup/${NON_EXISTING_USERNAME}`,
    {
      tags: { name: 'UserLookupNotFound' },
      expectedStatuses: [404],
    },
  );

  check(resNotExist, {
    'Lookup Non-Existing: status is 404': (r) => r.status === 404,
  });

  userLookupNotFoundTrend.add(resNotExist.timings.duration);
  errorRate.add(resNotExist.status !== 404);

  sleep(SLEEP_TIME);
}
