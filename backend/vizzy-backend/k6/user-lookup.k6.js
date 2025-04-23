import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/v1';

const EXISTING_USERNAME = 'Basi';
const NON_EXISTING_USERNAME = 'user_does_not_exist_12345';

const userLookupExistingTrend = new Trend(
  'user_lookup_existing_duration',
  true,
);
const userLookupNotFoundTrend = new Trend(
  'user_lookup_not_found_duration',
  true,
);

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    user_lookup_existing_duration: ['p(95)<400'],
    user_lookup_not_found_duration: ['p(95)<450'],
  },
};

/**
 * Default function executed by each Virtual User (VU).
 * Tests the GET /users/lookup/:username endpoint for both existing and non-existing users.
 */
export default function () {
  const resExist = http.get(`${BASE_URL}/users/lookup/${EXISTING_USERNAME}`, {
    tags: { name: 'UserLookupExisting' },
    expectedStatuses: [200],
  });
  check(resExist, {
    'Lookup Existing: status is 200': (r) => r.status === 200,
  });
  userLookupExistingTrend.add(resExist.timings.duration);
  sleep(1);

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
  sleep(1);
}
