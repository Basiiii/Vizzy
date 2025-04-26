import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/v1';

// Test configuration
const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
  name: 'Test User',
  username: 'testuser',
  address: '123 Test St, Test City',
  latitude: 40.7128,
  longitude: -74.006,
};
const SLEEP_TIME = 1; // seconds between requests

// Custom metrics
const proposalBalanceTrend = new Trend('proposal_balance_duration', true);
const errorRate = new Rate('errors');

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    proposal_balance_duration: ['p(95)<400', 'p(99)<800'],
    errors: ['rate<0.01'],
  },
  setupTimeout: '30s',
};

/**
 * Setup function that runs once before the test
 * Signs up a test user and returns the auth token
 */
export function setup() {
  // First try to sign in (in case user already exists)
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (loginRes.status === 200) {
    console.log('Successfully logged in existing user');
    const response = loginRes.json();
    return { authToken: response.tokens.accessToken };
  }

  console.log('Login failed, attempting signup...');
  console.log('Login response:', loginRes.body);

  // If login fails, try to sign up
  const signupRes = http.post(
    `${BASE_URL}/auth/signup`,
    JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
      name: TEST_USER.name,
      username: TEST_USER.username,
      address: TEST_USER.address,
      latitude: TEST_USER.latitude,
      longitude: TEST_USER.longitude,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  // If signup was successful
  if (signupRes.status === 201) {
    console.log('Successfully created new user');
    const response = signupRes.json();
    return { authToken: response.tokens.accessToken };
  }

  // If we get here, both signup and login failed
  console.error('Failed to authenticate test user');
  console.error('Signup response:', signupRes.body);
  console.error('Login response:', loginRes.body);
  fail('Authentication failed - check console logs for details');
}

/**
 * Tests the GET /proposals/balance endpoint
 *
 * Test scenarios:
 * 1. Get the proposal balance for the logged-in user (should return 200)
 *
 * Metrics tracked:
 * - Response times
 * - Error rates
 * - HTTP request durations
 */
export default function (data) {
  if (!data.authToken) {
    fail('No auth token available - setup failed');
  }

  const params = {
    headers: {
      Authorization: `Bearer ${data.authToken}`,
    },
  };

  const res = http.get(`${BASE_URL}/proposals/balance`, params);

  check(res, {
    'Get Proposal Balance: status is 200': (r) => r.status === 200,
    'Get Proposal Balance: has balance field': (r) =>
      typeof r.json('balance') === 'number',
  });

  proposalBalanceTrend.add(res.timings.duration);
  errorRate.add(res.status !== 200);

  sleep(SLEEP_TIME);
}
