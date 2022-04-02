import {
	type AsyncFunc,
	type ResolvedOrRejected,
	type SuspendCacheOptions,
	suspendCache,
} from '@preact-wmr-twind-zero/preact-things/suspend-cache.js';
import { useEffect, useRef, useState } from 'preact/hooks';

import { IS_PRE_RENDER } from '../utils.js';
import { suspendCacheHydrationOptions } from './suspend-cache-hydration.js';

export const useSuspendCache = <Fn extends AsyncFunc>(
	asyncFunc: Fn,
	asyncFuncArgs: Parameters<Fn>,
	key: string,
	options?: SuspendCacheOptions<Fn>,
): ResolvedOrRejected<Fn> => {
	const hasRenderCommittedOnce = useRef(false);
	useEffect(() => {
		hasRenderCommittedOnce.current = true;
	}, []);

	const [, forceReRender_] = useState(NaN);
	const forceReRender = () => {
		// TODO check isMounted?
		forceReRender_(NaN);
	};

	return suspendCache(asyncFunc, asyncFuncArgs, key, {
		...options,
		hydration: IS_PRE_RENDER && !hasRenderCommittedOnce.current ? suspendCacheHydrationOptions(forceReRender) : undefined,
	});
};
