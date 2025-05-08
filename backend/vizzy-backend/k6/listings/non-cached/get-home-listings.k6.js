import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, errorRate, HEADERS, addCacheBuster } from './common.js';

export { options } from './common.js';

const ITEMS_PER_PAGE = 12;

// Define query types for better error reporting
const queryTypes = {
  basic: `page=1&limit=${ITEMS_PER_PAGE}`,
  sale: `page=1&limit=${ITEMS_PER_PAGE}&type=sale`,
  search: `page=1&limit=${ITEMS_PER_PAGE}&query=test`,
  location: `page=1&limit=${ITEMS_PER_PAGE}&lat=38.7223&lng=-9.1393&radius=5000`,
};

export default function () {
  // Test each query type separately
  Object.entries(queryTypes).forEach(([type, query]) => {
    const homeListingsResponse = http.get(
      addCacheBuster(`${BASE_URL}/listings/home?${query}`),
      { headers: HEADERS },
    );

    // Log the response for debugging
    if (homeListingsResponse.status !== 200) {
      console.log(`Failed request for type ${type} with query: ${query}`);
      console.log(`Status: ${homeListingsResponse.status}`);
      console.log(`Response body: ${homeListingsResponse.body}`);
    }

    const checks = check(homeListingsResponse, {
      [`${type}: status is 200`]: (r) => r.status === 200,
      [`${type}: has valid data`]: (r) => {
        try {
          const body = r.json();
          return body && Array.isArray(body.listings);
        } catch (e) {
          console.log(`JSON parse error for ${type}: ${e.message}`);
          console.log(`Raw response: ${r.body}`);
          return false;
        }
      },
      [`${type}: has valid page size`]: (r) => {
        try {
          const body = r.json();
          return (
            body &&
            Array.isArray(body.listings) &&
            body.listings.length <= ITEMS_PER_PAGE
          );
        } catch (e) {
          return false;
        }
      },
    });

    if (!checks) {
      errorRate.add(1);
      console.log(`Check failed for query type: ${type}`);
    }

    sleep(1);
  });
}
