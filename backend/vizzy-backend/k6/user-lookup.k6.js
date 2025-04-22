import http from 'k6/http';
import { check, sleep } from 'k6';

// Base URL for your API (adjust if necessary)
const BASE_URL = 'http://localhost:5000/v1'; // Assuming API runs on port 3000 and uses v1

// Test options
export const options = {
  vus: 10, // Number of virtual users
  duration: '10s', // Test duration
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

// --- Test Scenario ---
export default function () {
  // --- Test GET /users/lookup/:username ---
  // Replace 'testuser' with usernames that exist and don't exist in your test data
  const existingUsername = 'Basi';
  const nonExistingUsername = 'testuser_notexists';

  // Request for existing user (expect 200, likely cache hit after first request)
  // For this request, the default expected status (2xx) is fine.
  const resExist = http.get(`${BASE_URL}/users/lookup/${existingUsername}`);
  check(resExist, {
    'lookup existing status is 200': (r) => r.status === 200,
  });
  sleep(1); // Pause for 1 second

  // Request for non-existing user (expect 404, likely cache miss then cached as not found)
  // Tell k6 that a 404 is the expected status for this specific request
  const resNotExist = http.get(
    `${BASE_URL}/users/lookup/${nonExistingUsername}`,
    // Move expectedStatuses out of tags and directly into the params object
    {
      expectedStatuses: [404], // Correct placement
    },
  );
  check(resNotExist, {
    'lookup non-existing status is 404': (r) => r.status === 404,
  });
  sleep(1);
}
