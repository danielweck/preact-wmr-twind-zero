import { IS_CLIENT_SIDE } from '/utils.js';
import lazy from 'preact-iso/lazy';

// Code splitting
// export const SuspendedLazy = lazy(() => import('./island.js'));
export const SuspendedLazy = lazy(() =>
	IS_CLIENT_SIDE
		? new Promise<typeof import('./island.js')>((resolve) => {
				setTimeout(() => {
					resolve(import('./island.js'));
				}, 1000);
		  })
		: import('./island.js'),
);
