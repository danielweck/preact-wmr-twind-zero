export const IS_CLIENT_SIDE = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
export const IS_SERVER_SIDE = !IS_CLIENT_SIDE;
