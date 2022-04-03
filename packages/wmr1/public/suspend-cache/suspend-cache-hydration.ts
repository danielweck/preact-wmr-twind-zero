import type {
	AsyncFunc,
	HydrationOptions,
	ResolvedOrRejected,
} from '@preact-wmr-twind-zero/preact-things/suspend-cache.js';

import { IS_CLIENT_SIDE, IS_PRE_RENDER } from '../utils.js';

export interface PreactWmrHydrateSuspendCache {
	PREACTWMR_HYDRATE_SUSPEND_CACHE?: Record<string, ResolvedOrRejected<AsyncFunc>>;
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface Window extends PreactWmrHydrateSuspendCache {}
}

export type GlobalThis = typeof globalThis & PreactWmrHydrateSuspendCache;

export const suspendCacheHydrationObtainPrerenderingServerJavascript = (): string | undefined => {
	const serverGlobal = globalThis as GlobalThis;

	if (
		!serverGlobal.PREACTWMR_HYDRATE_SUSPEND_CACHE ||
		!Object.keys(serverGlobal.PREACTWMR_HYDRATE_SUSPEND_CACHE).length
	) {
		return undefined;
	}
	// eslint-disable-next-line quotes
	const esc = "\\'";
	const strToParse = `'${
		JSON.stringify(serverGlobal.PREACTWMR_HYDRATE_SUSPEND_CACHE).replace(/\\"/g, '\\\\"').replace(/'/g, esc)
		// .replace(/&/g, '&amp;')
		// .replace(/</g, '&lt;')
		// .replace(/>/g, '&gt;')
	}'`;
	// if (1 < 2 || 2 > 1 && true) console.log('escaped ok! :)');
	return `window.PREACTWMR_HYDRATE_SUSPEND_CACHE = JSON.parse(${strToParse});`;
};

export const suspendCacheHydrationResetPrerenderingServerContext = () => {
	const serverGlobal = globalThis as GlobalThis;
	serverGlobal.PREACTWMR_HYDRATE_SUSPEND_CACHE = {};
};

export const suspendCacheHydrationOptions = <Fn extends AsyncFunc>(forceReRender: () => void): HydrationOptions<Fn> => {
	return {
		isPrerenderedClient: () => {
			return IS_PRE_RENDER && IS_CLIENT_SIDE;
		},
		isPrerenderingServer: () => {
			return IS_PRE_RENDER && !IS_CLIENT_SIDE;
		},
		registerInitialValueInPrerenderingServer: (key, value) => {
			const serverGlobal = globalThis as GlobalThis;
			if (!serverGlobal.PREACTWMR_HYDRATE_SUSPEND_CACHE) {
				serverGlobal.PREACTWMR_HYDRATE_SUSPEND_CACHE = {};
			}
			const [success, failure] = value;
			serverGlobal.PREACTWMR_HYDRATE_SUSPEND_CACHE[key] = [success, failure];
			// [JSON.stringify(success), JSON.stringify(failure)];
		},
		obtainInitialValueForPrerenderedClient: (key: string) => {
			return window.PREACTWMR_HYDRATE_SUSPEND_CACHE?.[key];
		},
		notifyNewValueInPrerenderedClient: (_key, _value) => {
			// microtask
			// Promise.resolve(() => {
			// });
			// tick
			setTimeout(() => {
				forceReRender();
			});

			// TODO: only refresh component if different values?
			// const existing = window.PREACTWMR_HYDRATE_SUSPEND_CACHE?.[key];
			// if (!existing) {
			// }
		},
	};
};
