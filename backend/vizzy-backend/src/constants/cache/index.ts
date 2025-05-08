/**
 * @fileoverview Consolidates all cache key constants from different modules into a single object
 */

/**
 * Imports cache key constants from various domain-specific modules
 */
import { GEOCODING_CACHE_KEYS } from './geocoding.cache-keys';
import { LISTING_CACHE_KEYS } from './listing.cache-keys';
import { PROFILE_CACHE_KEYS } from './profile.cache-keys';
import { PROPOSAL_CACHE_KEYS } from './proposal.cache-keys';
import { TRANSACTION_CACHE_KEYS } from './transaction.cache-keys';
import { USER_CACHE_KEYS } from './user.cache-keys';

/**
 * Combined object containing all cache keys from different modules
 * @constant
 * @type {Readonly<Object>}
 */
export const CACHE_KEYS = {
  ...USER_CACHE_KEYS,
  ...PROFILE_CACHE_KEYS,
  ...PROPOSAL_CACHE_KEYS,
  ...LISTING_CACHE_KEYS,
  ...GEOCODING_CACHE_KEYS,
  ...TRANSACTION_CACHE_KEYS,
} as const;
