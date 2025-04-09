export const CACHE_KEYS = {
  USERNAME_LOOKUP: (username: string): string => `user:${username}:id`,
  BASIC_USER_INFO: (userid: string): string => `user:${userid}:basic-info`,
  USER_ACCOUNT_INFO: (userid: string): string => `user:${userid}:account-info`,
  PROFILE_INFO: (username: string): string => `user:${username}:profile-info`,
  PROFILE_LISTINGS: (userid: string): string =>
    `user:${userid}:profile-listings`,
  USER_LISTINGS_PAGINATED: (
    userid: string,
    page: number,
    limit: number,
  ): string => `user:${userid}:listings:page:${page}:limit:${limit}`,
  USER_CONTACTS: (userid: string): string => `user:${userid}:contacts`,
  FORWARD_GEOCODING: (address: string): string =>
    `geocoding:forward:${address}`,
  REVERSE_GEOCODING: (lat: number, lon: number): string =>
    `geocoding:reverse:${lat}:${lon}`,
  PROPOSALS: (userid: string): string => `user:${userid}:profile-proposals`,
  PROPOSAL_DETAIL: (proposalId: string): string =>
    `proposal-detail:${proposalId}`,
  SENT_PROPOSALS: (userid: string): string => `user:${userid}:sent-proposals`,
  RECEIVED_PROPOSALS: (userid: string): string =>
    `user:${userid}:received-proposals`,
  LISTING_DETAIL: (listingId: number) => `listing:${listingId}`,
  HOME_LISTINGS: (
    page: number,
    limit: number,
    type?: string,
    search?: string,
    lat?: number,
    lon?: number,
    dist?: number,
  ) =>
    `home-listings:page:${page}:limit:${limit}:type:${type || 'all'}:search:${search || 'none'}:lat:${lat || 'none'}:lon:${lon || 'none'}:dist:${dist || 'none'}`,
  USER_LOCATION: (userid: string): string => `user:${userid}:location`,
};
