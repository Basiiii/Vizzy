import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/v1';

// Test configuration
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const SLEEP_TIME = 1; // seconds between requests

// Search test cases
const SEARCH_QUERIES = [
  'test', // Basic search
  'user', // Common term
  'nonexistent123', // No results expected
  'a', // Short query
  'test user', // Multi-word query
];

// Custom metrics
const searchDurationTrend = new Trend('user_search_duration', true);
const searchResultsTrend = new Trend('user_search_results', true);
const errorRate = new Rate('errors');

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    user_search_duration: ['p(95)<400', 'p(99)<800'],
    errors: ['rate<0.01'],
  },
};

/**
 * Tests the GET /users/search endpoint
 *
 * Test scenarios:
 * 1. Search with different query terms
 * 2. Test pagination
 * 3. Test sorting options
 *
 * Metrics tracked:
 * - Response times
 * - Number of results
 * - Error rates
 * - HTTP request durations
 */
export default function () {
  const params = {
    headers: {
      Authorization: `Bearer ${TEST_USER_ID}`,
    },
  };

  // Test basic search with different queries
  const query =
    SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  const searchRes = http.get(
    `${BASE_URL}/users/search?query=${query}&page=1&limit=10`,
    params,
  );

  check(searchRes, {
    'Search: status is 200': (r) => r.status === 200,
    'Search: has results array': (r) => Array.isArray(r.json('results')),
    'Search: has pagination info': (r) =>
      r.json('total') !== undefined &&
      r.json('page') !== undefined &&
      r.json('limit') !== undefined,
  });

  searchDurationTrend.add(searchRes.timings.duration);
  searchResultsTrend.add(searchRes.json('results').length);
  errorRate.add(searchRes.status !== 200);

  // Test pagination
  const paginationRes = http.get(
    `${BASE_URL}/users/search?query=${query}&page=2&limit=5`,
    params,
  );

  check(paginationRes, {
    'Pagination: status is 200': (r) => r.status === 200,
    'Pagination: correct page size': (r) => r.json('results').length <= 5,
  });

  // Test sorting
  const sortRes = http.get(
    `${BASE_URL}/users/search?query=${query}&sort=name&order=asc`,
    params,
  );

  check(sortRes, {
    'Sort: status is 200': (r) => r.status === 200,
    'Sort: has sorted results': (r) => {
      const results = r.json('results');
      if (results.length < 2) return true;
      return results[0].name <= results[1].name;
    },
  });

  sleep(SLEEP_TIME);
}
