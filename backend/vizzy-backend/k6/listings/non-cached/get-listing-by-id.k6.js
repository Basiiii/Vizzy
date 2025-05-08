import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { HEADERS, addCacheBuster } from './common.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/v1';

// Test configuration
const SLEEP_TIME = 1; // seconds between requests

// Custom metrics
const listingGetByIdTrend = new Trend(
  'listing_get_by_id_duration_no_cache',
  true,
);
const listingGetByIdNotFoundTrend = new Trend(
  'listing_get_by_id_not_found_duration_no_cache',
  true,
);
const errorRate = new Rate('errors');

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    listing_get_by_id_duration_no_cache: ['p(95)<400', 'p(99)<800'],
    listing_get_by_id_not_found_duration_no_cache: ['p(95)<450', 'p(99)<900'],
    errors: ['rate<0.01'],
  },
};

let currentId = 1;

/**
 * Tests the GET /listings/:id endpoint with cache skipping
 *
 * Test scenarios:
 * 1. Get existing listing by ID (should return 200)
 * 2. Get non-existent listing by ID (should return 404)
 *
 * Metrics tracked:
 * - Response times for both scenarios
 * - Error rates
 * - HTTP request durations
 */
export default function () {
  // Test existing listing lookup
  const listingId = currentId;
  currentId = currentId >= 25 ? 1 : currentId + 1;

  const resExist = http.get(
    addCacheBuster(`${BASE_URL}/listings/${listingId}`),
    {
      headers: HEADERS,
      tags: { name: 'ListingGetByIdNoCache' },
      expectedStatuses: [200],
    },
  );

  check(resExist, {
    'Get Existing Listing (No Cache): status is 200': (r) => r.status === 200,
    'Get Existing Listing (No Cache): has correct ID': (r) =>
      r.json('id') === listingId,
    'Get Existing Listing (No Cache): has required fields': (r) =>
      r.json('title') !== undefined &&
      r.json('description') !== undefined &&
      r.json('price') !== undefined,
  });

  listingGetByIdTrend.add(resExist.timings.duration);
  errorRate.add(resExist.status !== 200);

  sleep(SLEEP_TIME);

  // Test non-existent listing lookup (using ID 26 which is just outside valid range)
  const nonExistingId = 26;
  const resNotExist = http.get(
    addCacheBuster(`${BASE_URL}/listings/${nonExistingId}`),
    {
      headers: HEADERS,
      tags: { name: 'ListingGetByIdNotFoundNoCache' },
      expectedStatuses: [404],
    },
  );

  check(resNotExist, {
    'Get Non-Existing Listing (No Cache): status is 404': (r) =>
      r.status === 404,
  });

  listingGetByIdNotFoundTrend.add(resNotExist.timings.duration);
  errorRate.add(resNotExist.status !== 404);

  sleep(SLEEP_TIME);
}
