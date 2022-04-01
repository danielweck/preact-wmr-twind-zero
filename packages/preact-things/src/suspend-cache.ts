// Inspired from: https://github.com/pmndrs/suspend-react/blob/8803996f2fcfbb927d855c2f5d74f66a2d5045a3/src/index.ts

import { useState } from 'preact/hooks';

const DEFAULT_IS_EQUAL = (a: unknown, b: unknown): boolean => {
	return a === b;
};

function isShallowEqual(arrA: unknown[], arrB: unknown[], isEqual = DEFAULT_IS_EQUAL) {
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Options<Fn extends (...args: any) => any> = {
	hydrationValue?: ResolvedOrRejected<Fn>;
	removeFromCacheTimeout?: number;
	isEqual?: typeof DEFAULT_IS_EQUAL;
};

export type ResolvedType<T> = T extends Promise<infer V> ? V : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncFunc = (...asyncFuncArgs: Array<any>) => Promise<any>;

export type PromiseCacheItem<Fn extends AsyncFunc = AsyncFunc> = {
	promise: ReturnType<Fn>;
	asyncFuncArgs: Parameters<Fn>;
	key: string;
	isEqual?: typeof DEFAULT_IS_EQUAL;
	removeFromCacheTimeout?: number; // > 0
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	rejectedReason?: any;
	fulfilledValue?: ResolvedType<ReturnType<Fn>>;
};

const _PROMISE_CACHE: PromiseCacheItem<AsyncFunc>[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResolvedOrRejected<Fn extends (...args: any) => any> =
	| [success: ResolvedType<ReturnType<Fn>>, failure: undefined]
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| [success: undefined, failure: any];

function queryCache<Fn extends AsyncFunc>(
	asyncFunc: Fn,
	asyncFuncArgs: Parameters<Fn>,
	key: string,
	options: Options<Fn> = {},
	forceReRender: (() => void) | undefined,
): ResolvedOrRejected<Fn> | undefined {
	const doPreload = !forceReRender;

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
			if (typeof options.hydrationValue !== 'undefined') {
				delete options.hydrationValue;
				if (forceReRender) {
					// Promise.resolve(() => {
					// 	// microtask
					// });
					setTimeout(() => {
						forceReRender();
					});
				}
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

	if (typeof options.hydrationValue !== 'undefined') {
		return options.hydrationValue;
	}

	throw promise;
}

export const useSuspendCache = <Fn extends AsyncFunc>(
	asyncFunc: Fn,
	asyncFuncArgs: Parameters<Fn>,
	key: string,
	options?: Options<Fn>,
): ResolvedOrRejected<Fn> => {
	const [, forceReRender_] = useState(NaN);
	const forceReRender = () => {
		forceReRender_(NaN);
	};

	return queryCache(asyncFunc, asyncFuncArgs, key, options, forceReRender) as ReturnType<typeof useSuspendCache>;
};

export const preloadCache = <Fn extends AsyncFunc>(
	asyncFunc: Fn,
	asyncFuncArgs: Parameters<Fn>,
	key: string,
	options?: Options<Fn>,
): void => {
	queryCache(asyncFunc, asyncFuncArgs, key, options, undefined);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const peekCache = (asyncFuncArgs: any[], key: string): PromiseCacheItem['fulfilledValue'] | undefined => {
	for (const cacheEntry of _PROMISE_CACHE) {
		const argsEqual = isShallowEqual(asyncFuncArgs, cacheEntry.asyncFuncArgs, cacheEntry.isEqual);

		// CACHE HIT
		if (argsEqual && key === cacheEntry.key) {
			// Note: the Promise fulfilledValue can be falsy, including undefined / null
			if (Object.prototype.hasOwnProperty.call(cacheEntry, 'fulfilledValue')) {
				return cacheEntry.fulfilledValue;
			}
			return undefined;
		}
	}
	return undefined;
};

export const clearCache = () => {
	// _PROMISE_CACHE.splice(0, _PROMISE_CACHE.length);
	_PROMISE_CACHE.length = 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeFromCache = (asyncFuncArgs: any[], key: string): boolean => {
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
			return true;
		}
	}

	return false;
};
