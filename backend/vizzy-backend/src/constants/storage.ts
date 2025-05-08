/** Base URL for Supabase storage public access */
export const SUPABASE_STORAGE_URL =
  'https://pblciirmszmcndmaxcvo.supabase.co/storage/v1/object/public';

/** Bucket name for storing user profile data */
export const PROFILE_AVATAR_BUCKET = 'user';

/** Folder name for storing user avatar images */
export const PROFILE_AVATAR_FOLDER = 'avatar';

/** Complete storage path for user profile pictures */
export const PROFILE_PICTURE_PATH = `${PROFILE_AVATAR_BUCKET}/${PROFILE_AVATAR_FOLDER}`;

/** Bucket name for storing proposal-related images */
export const PROPOSAL_IMAGES_BUCKET = 'proposals';
