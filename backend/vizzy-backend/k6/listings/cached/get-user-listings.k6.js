import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, TEST_USER_ID, errorRate, HEADERS } from './common.js';

export { options } from './common.js';

const ITEMS_PER_PAGE = 9;

export default function () {
  const page = Math.floor(Math.random() * 3) + 1;

  const userListingsResponse = http.get(
    `${BASE_URL}/listings?userid=${TEST_USER_ID}&page=${page}&limit=${ITEMS_PER_PAGE}`,
    { headers: HEADERS },
  );

  const checks = check(userListingsResponse, {
    'get user listings status is 200': (r) => r.status === 200,
    'get user listings has data': (r) => {
      try {
        const body = r.json();
        return Array.isArray(body) && body.length >= 0;
      } catch (e) {
        console.log(`JSON parse error: ${e.message}`);
        console.log(`Raw response: ${r.body}`);
        return false;
      }
    },
    'get user listings has correct page size': (r) => {
      try {
        const body = r.json();
        return Array.isArray(body) && body.length <= ITEMS_PER_PAGE;
      } catch (e) {
        return false;
      }
    },
  });

  if (!checks) {
    errorRate.add(1);
  }

  sleep(1);
}
