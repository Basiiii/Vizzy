export const LISTING_CACHE_KEYS = {
  DETAIL: (listingId: number): string => `listing:${listingId}`,
  IMAGES: (listingId: number): string => `listing:${listingId}:images`,
  PAGINATED_BY_USER: (userid: string, page: number, limit: number): string =>
    `listing:by-user:${userid}:page:${page}:limit:${limit}`,
  HOME: (
    page: number,
    limit: number,
    type?: string,
    search?: string,
    lat?: number,
    lon?: number,
    dist?: number,
  ): string =>
    `listing:home:page:${page}:limit:${limit}:type:${type || 'all'}:search:${
      search || 'none'
    }:lat:${lat || 'none'}:lon:${lon || 'none'}:dist:${dist || 'none'}`,
} as const;
