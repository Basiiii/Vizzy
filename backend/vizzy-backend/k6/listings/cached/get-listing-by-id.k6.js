import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, errorRate, HEADERS } from './common.js';

export { options } from './common.js';

export default function () {
  // Generate random listing ID between 1 and 25
  const listingId = Math.floor(Math.random() * 25) + 1;

  const listingResponse = http.get(`${BASE_URL}/listings/${listingId}`, {
    headers: HEADERS,
  });

  // Log the response for debugging
  if (listingResponse.status !== 200) {
    console.log(`Failed request for listing ID ${listingId}`);
    console.log(`Status: ${listingResponse.status}`);
    console.log(`Response body: ${listingResponse.body}`);
  }

  const checks = check(listingResponse, {
    'get listing by id status is 200': (r) => r.status === 200,
    'get listing by id has data': (r) => {
      try {
        const body = r.json();
        return body && body.id === listingId;
      } catch (e) {
        console.log(`JSON parse error: ${e.message}`);
        console.log(`Raw response: ${r.body}`);
        return false;
      }
    },
  });

  if (!checks) {
    errorRate.add(1);
  }

  sleep(1);
}
