export const PROPOSAL_CACHE_KEYS = {
  ALL: (userid: string): string => `user:${userid}:profile-proposals`,
  DETAIL: (proposalId: string): string => `proposal:${proposalId}`,
  SENT: (userid: string): string => `user:${userid}:sent-proposals`,
  RECEIVED: (userid: string): string => `user:${userid}:received-proposals`,
  IMAGES: (proposalId: number): string => `proposal:${proposalId}:images`,
  BY_USER: (userid: string): string => `proposal:by-user:${userid}`,
  SENT_BY_USER: (userid: string): string => `proposal:sent:by-user:${userid}`,
  RECEIVED_BY_USER: (userid: string): string =>
    `proposal:received:by-user:${userid}`,
  FILTERED_LIST: (userId: string, optionsHash: string): string =>
    `user:${userId}:proposals:${optionsHash}`,
  BALANCE: (userId: string): string => `user:${userId}:proposal-balance`,
} as const;
