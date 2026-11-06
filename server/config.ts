import dotenv from 'dotenv';
dotenv.config();

export const PORT = Number(process.env.PORT) || 3000;

export const MEDIAKIT_API_KEY = process.env.MEDIAKIT_API_KEY || '';
export const MEDIAKIT_BASE_URL = process.env.MEDIAKIT_BASE_URL || 'https://mediakit.cn-beijing.volces.com/api/v1';

export const ARK_API_KEY = process.env.ARK_API_KEY || '';
export const ARK_MODEL = process.env.ARK_MODEL || '';
export const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';

export const VOD_SPACE_NAME = process.env.VOD_SPACE_NAME || 'spacegpn4h0';

export const TOS_CONFIG = {
  region: process.env.TOS_REGION || 'cn-beijing',
  endpoint: process.env.TOS_ENDPOINT || 'tos-cn-beijing.volces.com',
  bucket: process.env.TOS_BUCKET || 'aimediakit',
  accessKeyId: process.env.VOLC_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.VOLC_SECRET_ACCESS_KEY || '',
};
