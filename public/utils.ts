export const IS_CLIENT_SIDE = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
export const IS_SERVER_SIDE = !IS_CLIENT_SIDE;

export const PUBLIC_PATH_ORIGIN = process.env.WMR_PUBLIC_PATH_ORIGIN || '';
export const PUBLIC_PATH_ROOT = process.env.WMR_PUBLIC_PATH_ROOT || '/';
