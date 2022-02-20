import { IS_CLIENT_SIDE } from '@preact-wmr-twind-zero/preact-things/utils.js';

export const LAZY_TIMEOUT = IS_CLIENT_SIDE ? 1000 : 0;

// export const PUBLIC_PATH_ORIGIN = process.env.WMR_PUBLIC_PATH_ORIGIN || '';
export const PUBLIC_PATH_ROOT = process.env.WMR_PUBLIC_PATH_ROOT || '/';

// client-side live dev server !== page prerendered via WMR 'build' mode
// NOTE: includes IS_SERVER_SIDE
// TODO: DOM must be in ready state here, so should be lazy-evaluated?
// (right now JS code is guaranteed to execute after DOM ready due to script element located at end of body)
const isodataScript = IS_CLIENT_SIDE ? document.querySelector('script[type=isodata]') : undefined;
export const IS_PRE_RENDER = !IS_CLIENT_SIDE || !!isodataScript;

// we don't really need fancy setter/getter here,
// but hey ... it's only a fun demo project, not an examplar API :)
// export const HYDRATION_STATUS = {
// 	_hydrated: false,
// 	get hydrated() {
// 		return this._hydrated;
// 	},
// 	set hydrated(h) {
// 		this._hydrated = h;
// 	},
// };

export const KEYBOARD_INTERACT = 'KEYBOARD_INTERACT';

export { IS_CLIENT_SIDE, IS_SERVER_SIDE } from '@preact-wmr-twind-zero/preact-things';
