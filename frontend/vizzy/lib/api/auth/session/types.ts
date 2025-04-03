export type SessionVerificationResult = {
  valid: boolean | 'UNKNOWN';
  error: string | null;
};

export type SessionError = {
  code: 'NO_TOKEN' | 'INVALID_TOKEN' | 'SERVER_ERROR';
  message: string;
};
