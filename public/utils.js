export const IS_CLIENT_SIDE = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
export const IS_SERVER_SIDE = !IS_CLIENT_SIDE;

// export const PUBLIC_PATH_ORIGIN = globalThis.process?.env.WMR_PUBLIC_PATH_ORIGIN || '';
export const PUBLIC_PATH_ROOT = globalThis.process?.env.WMR_PUBLIC_PATH_ROOT || '/';

// client-side live dev server !== page prerendered via WMR 'build' mode
export const IS_PRE_RENDERED = !IS_CLIENT_SIDE || !!document.querySelector('script[type=isodata]');

export const KEYBOARD_INTERACT = 'KEYBOARD_INTERACT';
