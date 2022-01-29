import lazy from 'preact-iso/lazy';

import { IS_CLIENT_SIDE } from '../../utils';

// Code splitting
// export const SuspendedLazy = lazy(() => import('./island'));
export const SuspendedLazy = lazy(
	() =>
		new Promise<typeof import('./island')>((resolve) => {
			setTimeout(
				() => {
					resolve(import('./island'));
				},
				IS_CLIENT_SIDE ? 1000 : 0,
			);
		}),
);
