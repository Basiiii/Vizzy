import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:3000/v1';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  // --- Test GET /users/:id ---
  // Replace with user IDs that exist and don't exist
  const existingUserId = 'replace-with-existing-user-id';
  const nonExistingUserId = 'replace-with-non-existing-user-id';

  // Request for existing user (expect 200, cache hit potential)
  const resExist = http.get(`${BASE_URL}/users/${existingUserId}`);
  check(resExist, {
    'detail existing status is 200': (r) => r.status === 200,
  });
  sleep(1);

  // Request for non-existing user (expect 404, cache miss potential)
  const resNotExist = http.get(`${BASE_URL}/users/${nonExistingUserId}`);
  check(resNotExist, {
    'detail non-existing status is 404': (r) => r.status === 404,
  });
  sleep(1);
}