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
const proposalGetAllTrend = new Trend(
  'proposal_get_all_duration_no_cache',
  true,
);
const errorRate = new Rate('errors');

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    proposal_get_all_duration_no_cache: ['p(95)<400', 'p(99)<800'],
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
 * Tests the GET /proposals endpoint with cache skipping
 *
 * Test scenarios:
 * 1. Get all proposals with default pagination
 * 2. Get all proposals with custom pagination
 * 3. Get all proposals with status filter
 * 4. Get all proposals with type filter
 *
 * Metrics tracked:
 * - Response times for all scenarios
 * - Error rates
 * - HTTP request durations
 */
export default function (data) {
  if (!data.authToken) {
    fail('No auth token available - setup failed');
  }

  const headers = {
    'x-skip-cache': 'true', // Skip cache header
    Authorization: `Bearer ${data.authToken}`,
  };

  // Test default pagination
  const resDefault = http.get(`${BASE_URL}/proposals`, {
    headers: headers,
    tags: { name: 'ProposalGetAllDefaultNoCache' },
    expectedStatuses: [200],
  });

  check(resDefault, {
    'Get All Proposals Default (No Cache): status is 200': (r) =>
      r.status === 200,
    'Get All Proposals Default (No Cache): has proposals array': (r) =>
      Array.isArray(r.json('proposals')),
    'Get All Proposals Default (No Cache): has total count': (r) =>
      typeof r.json('totalProposals') === 'number',
  });

  proposalGetAllTrend.add(resDefault.timings.duration);
  errorRate.add(resDefault.status !== 200);

  sleep(SLEEP_TIME);

  // Test custom pagination
  const resCustomPage = http.get(`${BASE_URL}/proposals?page=2&limit=5`, {
    headers: headers,
    tags: { name: 'ProposalGetAllCustomPageNoCache' },
    expectedStatuses: [200],
  });

  check(resCustomPage, {
    'Get All Proposals Custom Page (No Cache): status is 200': (r) =>
      r.status === 200,
    'Get All Proposals Custom Page (No Cache): has proposals array': (r) =>
      Array.isArray(r.json('proposals')),
    'Get All Proposals Custom Page (No Cache): has correct page size': (r) => {
      const proposals = r.json('proposals');
      return Array.isArray(proposals) && proposals.length <= 5;
    },
  });

  proposalGetAllTrend.add(resCustomPage.timings.duration);
  errorRate.add(resCustomPage.status !== 200);

  sleep(SLEEP_TIME);

  // Test status filter
  const resStatus = http.get(`${BASE_URL}/proposals?status=PENDING`, {
    headers: headers,
    tags: { name: 'ProposalGetAllStatusNoCache' },
    expectedStatuses: [200],
  });

  check(resStatus, {
    'Get All Proposals Status (No Cache): status is 200': (r) =>
      r.status === 200,
    'Get All Proposals Status (No Cache): has proposals array': (r) =>
      Array.isArray(r.json('proposals')),
  });

  proposalGetAllTrend.add(resStatus.timings.duration);
  errorRate.add(resStatus.status !== 200);

  sleep(SLEEP_TIME);

  // Test type filter
  const resType = http.get(`${BASE_URL}/proposals?type=SENT`, {
    headers: headers,
    tags: { name: 'ProposalGetAllTypeNoCache' },
    expectedStatuses: [200],
  });

  check(resType, {
    'Get All Proposals Type (No Cache): status is 200': (r) => r.status === 200,
    'Get All Proposals Type (No Cache): has proposals array': (r) =>
      Array.isArray(r.json('proposals')),
  });

  proposalGetAllTrend.add(resType.timings.duration);
  errorRate.add(resType.status !== 200);

  sleep(SLEEP_TIME);
}
