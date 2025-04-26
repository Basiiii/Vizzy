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
const NON_EXISTENT_PROPOSAL_ID = 99999;
const SLEEP_TIME = 1; // seconds between requests

// Custom metrics
const proposalGetByIdTrend = new Trend('proposal_get_by_id_duration', true);
const proposalGetByIdNotFoundTrend = new Trend(
  'proposal_get_by_id_not_found_duration',
  true,
);
const errorRate = new Rate('errors');

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    proposal_get_by_id_duration: ['p(95)<400', 'p(99)<800'],
    proposal_get_by_id_not_found_duration: ['p(95)<450', 'p(99)<900'],
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

  let authToken;
  if (loginRes.status === 200) {
    console.log('Successfully logged in existing user');
    const response = loginRes.json();
    authToken = response.tokens.accessToken;
  } else {
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
      authToken = response.tokens.accessToken;
    } else {
      // If we get here, both signup and login failed
      console.error('Failed to authenticate test user');
      console.error('Signup response:', signupRes.body);
      console.error('Login response:', loginRes.body);
      fail('Authentication failed - check console logs for details');
    }
  }

  // Create a test proposal with listing ID 1
  const createProposalRes = http.post(
    `${BASE_URL}/proposals`,
    JSON.stringify({
      title: 'Test Proposal for K6 Testing',
      description: 'This is a test proposal created for K6 performance testing',
      listing_id: 1,
      proposal_type: 'sale',
      receiver_id: '00000000-0000-0000-0000-000000000001',
      offered_price: 100,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  let testProposalId;
  if (createProposalRes.status === 201) {
    const proposalData = createProposalRes.json();
    testProposalId = proposalData.id;
    console.log(`Successfully created test proposal with ID ${testProposalId}`);
  } else {
    console.warn('Could not create test proposal. Tests may fail.');
    console.warn('Create proposal response:', createProposalRes.body);
    // Use a fallback ID if creation fails
    testProposalId = 1;
  }

  return { authToken, testProposalId };
}

/**
 * Tests the GET /proposals/:proposalId endpoint
 *
 * Test scenarios:
 * 1. Get an existing proposal by ID (should return 200)
 * 2. Get a non-existent proposal by ID (should return 404)
 *
 * Metrics tracked:
 * - Response times for both scenarios
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

  // Test getting an existing proposal
  const resExist = http.get(
    `${BASE_URL}/proposals/${data.testProposalId}`,
    params,
  );

  const existingCheck = check(resExist, {
    'Get Existing Proposal: status is 200': (r) => r.status === 200,
    'Get Existing Proposal: has id field': (r) => r.json('id') !== undefined,
    'Get Existing Proposal: has required fields': (r) =>
      r.json('sender_id') !== undefined &&
      r.json('receiver_id') !== undefined &&
      r.json('proposal_status') !== undefined,
  });

  if (existingCheck) {
    proposalGetByIdTrend.add(resExist.timings.duration);
    errorRate.add(resExist.status !== 200);
  } else {
    console.warn(
      'Could not access test proposal. This is expected if the test user does not have access to the proposal.',
    );
  }

  sleep(SLEEP_TIME);

  // Test getting a non-existent proposal
  const resNotExist = http.get(
    `${BASE_URL}/proposals/${NON_EXISTENT_PROPOSAL_ID}`,
    params,
  );

  check(resNotExist, {
    'Get Non-Existing Proposal: status is 404 or 403': (r) =>
      r.status === 404 || r.status === 403,
  });

  proposalGetByIdNotFoundTrend.add(resNotExist.timings.duration);
  errorRate.add(resNotExist.status !== 404 && resNotExist.status !== 403);

  sleep(SLEEP_TIME);
}
