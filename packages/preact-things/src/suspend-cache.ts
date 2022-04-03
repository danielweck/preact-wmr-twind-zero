// Inspired from: https://github.com/pmndrs/suspend-react/blob/8803996f2fcfbb927d855c2f5d74f66a2d5045a3/src/index.ts

export const DEFAULT_IS_EQUAL = (a: unknown, b: unknown): boolean => {
	return a === b;
};

export const isShallowEqual = (arrA: unknown[], arrB: unknown[], isEqual = DEFAULT_IS_EQUAL) => {
	if (arrA === arrB) {
		return true;
	}
	if (!arrA || !arrB || arrA.length !== arrB.length) {
		return false;
	}
	for (let i = 0; i < arrA.length; i++) {
		if (!isEqual(arrA[i], arrB[i])) {
			return false;
		}
	}
	return true;
};

export interface HydrationOptions<Fn extends AsyncFunc> {
	obtainInitialValueForPrerenderedClient: (key: string) => ResolvedOrRejected<Fn> | undefined;
	registerInitialValueInPrerenderingServer: (key: string, value: ResolvedOrRejected<Fn>) => void;
	notifyNewValueInPrerenderedClient: (key: string, value: ResolvedOrRejected<Fn>) => void;
	isPrerenderedClient: () => boolean;
	isPrerenderingServer: () => boolean;
}

export type SuspendCacheOptions<Fn extends AsyncFunc> = {
	hydration?: HydrationOptions<Fn>;
	removeFromCacheTimeout?: number;
	isEqual?: typeof DEFAULT_IS_EQUAL;
};

export type ResolvedType<T> = T extends Promise<infer V> ? V : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NotUndefined<T = any> = Exclude<T, undefined>;

// export type MaybeAsyncFunc = (...funcArgs: NotUndefined[]) => NotUndefined;

export type AsyncFunc = (...funcArgs: NotUndefined[]) => Promise<NotUndefined>;

export type PromiseCacheItem<Fn extends AsyncFunc> = {
	promise: ReturnType<Fn>;
	asyncFuncArgs: Parameters<Fn>;
	key: string;
	isEqual?: typeof DEFAULT_IS_EQUAL;
	removeFromCacheTimeout?: number; // > 0
	rejectedReason?: unknown;
	fulfilledValue?: ResolvedType<ReturnType<Fn>>;
};

const _PROMISE_CACHE: PromiseCacheItem<AsyncFunc>[] = [];

export type ResolvedOrRejected<Fn extends AsyncFunc> =
	| [success: ResolvedType<ReturnType<Fn>>, failure: undefined]
	| [success: undefined, failure: unknown];

function queryCache<Fn extends AsyncFunc>(
	asyncFunc: Fn,
	asyncFuncArgs: Parameters<Fn>,
	key: string,
	options: SuspendCacheOptions<Fn> = {},
	doPreload: boolean,
): ResolvedOrRejected<Fn> | undefined {
	const cacheKey = `(${key})${asyncFuncArgs.reduce(
		(previousValue: string, currentValue: unknown, currentIndex: number, _array: unknown[]) => {
			return `${previousValue}(${currentIndex}:£${JSON.stringify(currentValue)}£)`;
		},
		'',
	)}`;

	for (const cacheEntry of _PROMISE_CACHE) {
		const argsEqual = isShallowEqual(asyncFuncArgs, cacheEntry.asyncFuncArgs, cacheEntry.isEqual);
		if (!argsEqual || key !== cacheEntry.key) {
			continue;
		}
		// CACHE HIT:

		if (doPreload) {
			return undefined;
		}

		if (cacheEntry.rejectedReason) {
			// cannot throw here, somehow trips the re-render :(
			// throw cacheEntry.rejectedReason;
			//
			// const error = cacheEntry.rejectedReason instanceof Error ? cacheEntry.rejectedReason : new Error('');
			// error.message = `${cacheEntry.rejectedReason}`;
			// throw error;

			return [undefined, cacheEntry.rejectedReason];
		}

		// Note: the Promise fulfilledValue can be falsy, including undefined / null
		if (Object.prototype.hasOwnProperty.call(cacheEntry, 'fulfilledValue')) {
			return [cacheEntry.fulfilledValue, undefined];
		}

		// hand over to Preact's suspense / error boundary
		throw cacheEntry.promise;
	}
	// NO CACHE HIT:

	const removeFromCacheTimeout =
		typeof options.removeFromCacheTimeout === 'number' && options.removeFromCacheTimeout > 0
			? options.removeFromCacheTimeout
			: undefined;

	const promise = asyncFunc(...asyncFuncArgs)
		.then(
			(fulfilledValue) => {
				cacheEntry.fulfilledValue = fulfilledValue;

				if (cacheEntry.removeFromCacheTimeout) {
					setTimeout(() => {
						removeFromCache(cacheEntry.asyncFuncArgs, cacheEntry.key);
					}, cacheEntry.removeFromCacheTimeout);
				}

				return fulfilledValue;
			},
			(rejectedReason) => {
				cacheEntry.rejectedReason = rejectedReason;
			},
		)
		.finally(() => {
			if (doPreload) {
				return;
			}
			if (options.hydration?.isPrerenderingServer()) {
				options.hydration.registerInitialValueInPrerenderingServer(cacheKey, [
					cacheEntry.fulfilledValue,
					cacheEntry.rejectedReason,
				]);
			} else if (options.hydration?.isPrerenderedClient()) {
				options.hydration.notifyNewValueInPrerenderedClient(cacheKey, [
					cacheEntry.fulfilledValue,
					cacheEntry.rejectedReason,
				]);
			}
		});

	const cacheEntry: PromiseCacheItem<AsyncFunc> = {
		asyncFuncArgs,
		key,
		isEqual: options.isEqual,
		removeFromCacheTimeout,
		promise,
	};
	_PROMISE_CACHE.push(cacheEntry);

	if (doPreload) {
		return undefined;
	}

	if (options.hydration?.isPrerenderedClient()) {
		const val = options.hydration.obtainInitialValueForPrerenderedClient(cacheKey);
		if (val) {
			return val;
		}
	}

	throw promise;
}

export const suspendCache = <Fn extends AsyncFunc>(
	asyncFunc: Fn,
	asyncFuncArgs: Parameters<Fn>,
	key: string,
	options?: SuspendCacheOptions<Fn>,
): ResolvedOrRejected<Fn> => {
	return queryCache(asyncFunc, asyncFuncArgs, key, options, false) as ReturnType<typeof suspendCache>;
};

export const preloadCache = <Fn extends AsyncFunc>(
	asyncFunc: Fn,
	asyncFuncArgs: Parameters<Fn>,
	key: string,
	options?: Omit<SuspendCacheOptions<Fn>, 'hydration'>,
): void => {
	queryCache(asyncFunc, asyncFuncArgs, key, options, true);
};

export const peekCache = <Fn extends AsyncFunc>(
	asyncFuncArgs: Parameters<Fn>,
	key: string,
): ResolvedOrRejected<Fn> | undefined => {
	for (const cacheEntry of _PROMISE_CACHE) {
		const argsEqual = isShallowEqual(asyncFuncArgs, cacheEntry.asyncFuncArgs, cacheEntry.isEqual);

		// CACHE HIT
		if (argsEqual && key === cacheEntry.key) {
			// // Note: the Promise fulfilledValue can be falsy, including undefined / null
			// if (Object.prototype.hasOwnProperty.call(cacheEntry, 'fulfilledValue')) {
			// 	return cacheEntry.fulfilledValue;
			// }
			// return undefined;
			return [cacheEntry.fulfilledValue, cacheEntry.rejectedReason];
		}
	}
	return undefined;
};

export const clearCache = () => {
	// _PROMISE_CACHE.splice(0, _PROMISE_CACHE.length);
	_PROMISE_CACHE.length = 0;
};

export const removeFromCache = <Fn extends AsyncFunc>(
	asyncFuncArgs: Parameters<Fn>,
	key: string,
): ResolvedOrRejected<Fn> | undefined => {
	// const i = _PROMISE_CACHE.findIndex((cacheEntry) => {
	// 	const argsEqual = isShallowEqual(asyncFuncArgs, cacheEntry.asyncFuncArgs, cacheEntry.isEqual);
	// 	return argsEqual && key === cacheEntry.key;
	// });
	// if (i >= 0) {
	// 	_PROMISE_CACHE.splice(i, 1);
	// 	return true;
	// }
	for (let i = 0; i < _PROMISE_CACHE.length; i++) {
		const cacheEntry = _PROMISE_CACHE[i];
		const argsEqual = isShallowEqual(asyncFuncArgs, cacheEntry.asyncFuncArgs, cacheEntry.isEqual);
		if (argsEqual && key === cacheEntry.key) {
			_PROMISE_CACHE.splice(i, 1);
			return [cacheEntry.fulfilledValue, cacheEntry.rejectedReason];
		}
	}

	return undefined;
};
