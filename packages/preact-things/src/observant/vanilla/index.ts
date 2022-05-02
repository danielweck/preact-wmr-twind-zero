// The core 'observable' logic / algorithm implemented in this single-file lib was copied from Cellx:
// https://github.com/Riim/cellx
// Many thanks to the original developer for designing a fast and memory-efficient reactive runtime!
//
// This lib improves the performance of the already-mighty-quick Cellx reactive core,
// as benchmarked in all 3 major web browsers (Safari, Chrome, Firefox).
// This is the result of a significant refactoring from Cellx's original source code:
// - Smaller API surface (in a nutshell: observable constructor, get/set, on-changed/on-error events, dispose ... and that's about it!)
// - Tighter TypeScript typings (no 'any's!)
// - Inlined and simplified internal event emmitter
// - Several key micro-optimisations (e.g. class vs. prototype, array vs. set, for vs. while / forward vs. reverse loops, etc. etc.)
// - Many renamed things!

// ----------------
// <TYPES>
// ----------------

// export type TObsEventPayload<T> = {
// 	// target: IObs<T>;
// 	previous?: T;
// 	current?: T;
// 	error?: Error;
// };
// export type TObsEventListener<T> = (evt: TObsEventPayload<T>) => void;
export type TObsEventListenerChange<T> = (current: T, previous: T | undefined) => void;
export type TObsEventListenerError = (error: Error) => void;
export type TObsEventListener<T> = TObsEventListenerChange<T> | TObsEventListenerError;
export type TObsEventListeners<T> = TObsEventListener<T> | TObsEventListener<T>[] | undefined;
const ObsEventChange = 0;
const ObsEventError = 1;
export type TObsEventTypes = typeof ObsEventChange | typeof ObsEventError;

export type TObsPrimitive = null | number | string | boolean;
export type TObserved = TObsPrimitive | Array<TObsPrimitive> | Record<string, unknown>;
export type TObsDeriveFunc<T> = () => T;

export interface IObs<T> {
	set: (value: T) => this;
	get: (sampleOnly?: boolean) => T;

	dispose: () => this;

	onChange: (listener: TObsEventListenerChange<T>) => () => this;
	onError: (listener: TObsEventListenerError) => () => this;

	autoRun: () => void;
}

interface IObsInternal<T> extends IObs<T> {
	_eventListeners: TObsEventListeners<T>[];
	_onEvent: (key: TObsEventTypes, listener: TObsEventListener<T>) => () => this;
	_offEvent: (key?: TObsEventTypes, listener?: TObsEventListener<T>) => this;
	_emitEvent: (key: TObsEventTypes, current: T | undefined, previous: T | undefined, error: Error | undefined) => void;

	_eq: undefined | ((value1: T | undefined, value2: T | undefined) => boolean);

	_resolvedValue?: T;
	_setCurrentValue: (value: T) => void;

	_state: typeof STATE_RESOLVED | typeof STATE_DIRTY | typeof STATE_DIRTY_CHILDREN;
	_initializedWithValueOrError: boolean;

	_inQueueOfRoots: boolean;
	_climbParentDependentsToFeedQueueOfRootObsToResolve: (dirty: boolean) => void;
	_resolve: () => void;

	_deriveFunc?: TObsDeriveFunc<T>;
	_callDeriveFunc: () => void;
	_isDeriving: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_parentDependents: IObsInternal<any>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_registerParentDependentDeep: (parentDependent: IObsInternal<any>, resolved: boolean) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_unregisterParentDependentDeep: (parentDependent: IObsInternal<any>) => void;

	_hasParentDependentsOrEventListeners: boolean;
	_doActivate: (resolved: boolean) => void;
	_checkDeactivate: () => void;

	_activatedParentDependentsAfterDeep: boolean;
	_registerParentDependentsOnChildrenDependencies: (resolved: boolean) => void;
	_unregisterParentDependentsOnChildrenDependencies: () => void;

	// can be modified locally from this._callDeriveFunc()
	// and externally from currentDeriveObs._childDependencies in get()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_childDependencies: IObsInternal<any>[];

	_idOfUpdateWithValueOrError: number;

	_setErrorHereAndClimbParentDependents: (error: Error | undefined) => void;
	_resolvedError: Error | undefined;
}

export type TObsOptions<T> = {
	autoRun?: boolean;
	eq?: (value1: T | undefined, value2: T | undefined) => boolean;
};

interface IObsConstructor<T> extends IObs<T> {
	new (v: T | TObsDeriveFunc<T>, options?: TObsOptions<T>): IObs<T>;
	(v: T | TObsDeriveFunc<T>, options?: TObsOptions<T>): IObs<T>;
}

export type TObsTick = (func: () => void) => void;

// ----------------
// </TYPES>
// ----------------

// ----------------
// <ERROR HANDLING>
// ----------------

let currentErrorHandler = (err: Error, msg?: string) => {
	console.log(msg, err);
};
export const onError = (errorHandler: typeof currentErrorHandler) => {
	currentErrorHandler = errorHandler;
};

const ensureErrorType = (err: unknown) => (err instanceof Error ? err : new Error(String(err)));

// ----------------
// </ERROR HANDLING>
// ----------------

// ----------------
// <FAST ARRAY UTILS>
// ----------------

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const arrayIndexOf = <T>(arr: T[] | undefined, v: T): number => {
// 	if (!arr?.length) {
// 		return -1;
// 	}
// 	const l = arr.length;
// 	for (let i = 0; i < l; i++) {
// 		if (arr[i] === v) {
// 			return i;
// 		}
// 	}
// 	return -1;
// };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arrayIncludes = <T>(arr: T[] | undefined, v: T): boolean => {
	if (!arr) {
		return false;
	}
	let i = arr.length;
	while (i !== 0) {
		if (arr[--i] === v) {
			return true;
		}
	}
	return false;
};

// ----------------
// </FAST ARRAY UTILS>
// ----------------

// ----------------
// <TICK MICROTASK DEFER>
// ----------------

const tickNodeJSProcessNextTick: TObsTick | undefined =
	typeof globalThis !== 'undefined' && globalThis.process?.nextTick ? globalThis.process.nextTick : undefined;

const tickDOMQueueMicrotask: TObsTick | undefined =
	typeof self !== 'undefined' && self.queueMicrotask ? self.queueMicrotask : undefined;

const tickPromise_ = Promise.resolve();
const tickPromise: TObsTick = (func) => {
	// eslint-disable-next-line promise/catch-or-return,promise/always-return
	tickPromise_.then(() => {
		func();
	});
};

const tickFunc = tickDOMQueueMicrotask ?? tickNodeJSProcessNextTick ?? tickPromise;

// ----------------
// </TICK MICROTASK DEFER>
// ----------------

// ----------------
// <TICK QUEUE PROCESS>
// ----------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queueOfRootObsToResolve: IObsInternal<any>[] = [];
let indexInQueueOfRootObsToResolve = 0;
const flushQueueOfRootObsToResolve = () => {
	while (indexInQueueOfRootObsToResolve < queueOfRootObsToResolve.length) {
		const obs = queueOfRootObsToResolve[indexInQueueOfRootObsToResolve++];
		obs._inQueueOfRoots = false;
		if (obs._activatedParentDependentsAfterDeep) {
			obs._resolve();
		}
	}
	queueOfRootObsToResolve.length = 0;
	indexInQueueOfRootObsToResolve = 0;
};

// ----------------
// </TICK QUEUE PROCESS>
// ----------------

// ----------------
// <GLOBAL STATE>
// ----------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let currentDeriveObs: IObsInternal<any> | undefined;

let currentDeriveError: Error | undefined;

let lastIdOfUpdateWithValueOrError = 0;

const STATE_RESOLVED = 1;
const STATE_DIRTY = 2;
const STATE_DIRTY_CHILDREN = 3;

// ----------------
// </GLOBAL STATE>
// ----------------

// ----------------
// <OBSERVANT WRAP CONSTRUCTOR>
// ----------------

export const obs = <T = TObserved>(v: T | TObsDeriveFunc<T>, options?: TObsOptions<T>) =>
	new (Obs as IObsConstructor<T>)(v, options);

const Obs = function <T extends TObserved>(
	this: IObsInternal<T>,
	v: T | TObsDeriveFunc<T>,
	options?: TObsOptions<T>,
): IObs<T> {
	// if (
	// 	typeof this === 'undefined' ||
	// 	typeof this.constructor === 'undefined' ||
	// 	(typeof Window !== 'undefined' && this.constructor === Window)
	// ) {
	// 	return new Obs(v, options);
	// }

	this._eq = options?.eq; // ?? Object.is; // referencial === equality

	this._eventListeners = [undefined, undefined];

	this._parentDependents = [];
	this._childDependencies = [];

	this._hasParentDependentsOrEventListeners = false;
	this._activatedParentDependentsAfterDeep = false;

	this._inQueueOfRoots = false;

	this._isDeriving = false;

	this._idOfUpdateWithValueOrError = -1;

	this._resolvedError = undefined;

	if (typeof v === 'function') {
		this._state = STATE_DIRTY;

		this._resolvedValue = undefined;
		this._deriveFunc = v as TObsDeriveFunc<T>;

		this._initializedWithValueOrError = false;
	} else {
		this._state = STATE_RESOLVED;

		this._resolvedValue = v as T;
		this._deriveFunc = undefined;

		this._initializedWithValueOrError = true;
	}

	if (options?.autoRun) {
		this.autoRun();
	}

	// return Object.seal(this);
	return this;
};

// ----------------
// </OBSERVANT WRAP CONSTRUCTOR>
// ----------------

// ----------------
// <OBSERVANT PUBLICS>
// ----------------

Obs.prototype.get = function <T>(this: IObsInternal<T>, sampleOnly?: boolean): T {
	if (!sampleOnly) {
		if (this._state !== STATE_RESOLVED && this._idOfUpdateWithValueOrError !== lastIdOfUpdateWithValueOrError) {
			// STATE_DIRTY || STATE_DIRTY_CHILDREN
			this._resolve();
		}

		if (currentDeriveObs && currentDeriveObs !== this && !arrayIncludes(currentDeriveObs._childDependencies, this)) {
			currentDeriveObs._childDependencies.push(this);
		}
	}

	if (this._resolvedError) {
		throw this._resolvedError;
	}

	// guaranteed defined, because this._resolve() sets this._resolvedValue or sets this._resolvedError (which bails out in the conditional above)
	return this._resolvedValue as T;
};

Obs.prototype.set = function <T>(this: IObsInternal<T>, value: T): IObs<T> {
	if (!this._initializedWithValueOrError && this._deriveFunc) {
		this._callDeriveFunc();
	}

	this._setCurrentValue(value);

	return this;
};

Obs.prototype.dispose = function <T>(this: IObsInternal<T>): IObs<T> {
	this._offEvent();

	let i = this._parentDependents.length;
	while (i !== 0) {
		this._parentDependents[--i].dispose();
	}

	return this;
};

Obs.prototype.onChange = function <T>(this: IObsInternal<T>, listener: TObsEventListener<T>): () => IObs<T> {
	return this._onEvent(ObsEventChange, listener);
};

Obs.prototype.onError = function <T>(this: IObsInternal<T>, listener: TObsEventListener<T>): () => IObs<T> {
	return this._onEvent(ObsEventError, listener);
};

Obs.prototype.autoRun = function <T>(this: IObsInternal<T>): void {
	if (this._childDependencies.length !== 0) {
		this._resolve();
	}

	this._doActivate(true);
};

// ----------------
// </OBSERVANT PUBLICS>
// ----------------

// ----------------
// <OBSERVANT INTERNALS>
// ----------------

Obs.prototype._doActivate = function <T>(this: IObsInternal<T>, resolved: boolean) {
	this._hasParentDependentsOrEventListeners = true;
	this._registerParentDependentsOnChildrenDependencies(resolved);
};

Obs.prototype._checkDeactivate = function <T>(this: IObsInternal<T>) {
	if (
		this._hasParentDependentsOrEventListeners &&
		this._parentDependents.length === 0 &&
		(!this._eventListeners[ObsEventChange] ||
			(Array.isArray(this._eventListeners[ObsEventChange]) &&
				(this._eventListeners[ObsEventChange] as []).length === 0)) &&
		(!this._eventListeners[ObsEventError] ||
			(Array.isArray(this._eventListeners[ObsEventError]) && (this._eventListeners[ObsEventError] as []).length === 0))
	) {
		this._hasParentDependentsOrEventListeners = false;
		this._unregisterParentDependentsOnChildrenDependencies();
	}
};

Obs.prototype._onEvent = function <T>(
	this: IObsInternal<T>,
	key: TObsEventTypes,
	listener: TObsEventListener<T>,
): () => IObs<T> {
	if (this._childDependencies.length !== 0) {
		this._resolve();
	}

	const listeners = this._eventListeners[key];
	if (!listeners) {
		this._eventListeners[key] = listener;
	} else if (Array.isArray(listeners)) {
		if (!arrayIncludes(listeners, listener)) {
			listeners.push(listener);
		}
	} else if (listeners !== listener) {
		this._eventListeners[key] = [listeners, listener];
	}

	this._doActivate(true);

	return () => this._offEvent(key, listener);
};

Obs.prototype._offEvent = function <T>(
	this: IObsInternal<T>,
	key?: TObsEventTypes,
	listener?: TObsEventListener<T>,
): IObs<T> {
	if (this._childDependencies.length !== 0) {
		this._resolve();
	}

	if (listener && key) {
		const listeners = this._eventListeners[key];
		if (listeners) {
			if (!Array.isArray(listeners)) {
				if (listeners === listener) {
					this._eventListeners[key] = undefined;
				}
			} else {
				let i = listeners.length;
				if (i === 1) {
					if (listeners[0] === listener) {
						this._eventListeners[key] = undefined;
					}
				} else {
					while (i !== 0) {
						if (listeners[--i] === listener) {
							listeners.splice(i, 1);
							break;
						}
					}
				}
			}
		}
	} else if (key) {
		this._eventListeners[key] = undefined;
	} else {
		this._eventListeners[ObsEventChange] = undefined;
		this._eventListeners[ObsEventError] = undefined;
	}

	this._checkDeactivate();
	return this;
};

Obs.prototype._emitEvent = function <T>(
	this: IObsInternal<T>,
	key: TObsEventTypes,
	current: T | undefined,
	previous: T | undefined,
	error: Error | undefined,
) {
	const listeners = this._eventListeners[key];
	if (!listeners) {
		return;
	}

	const tryEventListener = (listener: TObsEventListener<T>) => {
		try {
			if (key === ObsEventChange) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				(listener as TObsEventListenerChange<T>)(current!, previous);
			} else {
				// key === ObsEventError
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				(listener as TObsEventListenerError)(error!);
			}
		} catch (err) {
			currentErrorHandler(ensureErrorType(err), 'Listener!');
		}
	};

	if (Array.isArray(listeners)) {
		let i = listeners.length;
		if (i === 1) {
			tryEventListener(listeners[0]);
		} else {
			while (i !== 0) {
				tryEventListener(listeners[--i]);
			}
		}
	} else {
		tryEventListener(listeners);
	}
};

Obs.prototype._registerParentDependentDeep = function <T>(
	this: IObsInternal<T>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	parentDependent: IObsInternal<any>,
	resolved: boolean,
) {
	if (this !== parentDependent) {
		this._parentDependents.push(parentDependent);
	}

	this._doActivate(resolved);
};

Obs.prototype._registerParentDependentsOnChildrenDependencies = function <T>(this: IObsInternal<T>, resolved: boolean) {
	let i = this._childDependencies.length;

	if (this._activatedParentDependentsAfterDeep || !this._deriveFunc || i === 0) {
		return;
	}

	while (i !== 0) {
		this._childDependencies[--i]._registerParentDependentDeep(this, resolved);
	}

	if (resolved) {
		this._state = STATE_RESOLVED;
	}

	this._activatedParentDependentsAfterDeep = true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Obs.prototype._unregisterParentDependentDeep = function <T>(this: IObsInternal<T>, parentDependent: IObs<any>) {
	let i = this._parentDependents.length;
	if (i === 0) {
		return;
	}
	if (i === 1) {
		this._parentDependents.length = 0;
	} else {
		// const i = arrayIndexOf(this._parentDependents, parentDependent);
		// if (i >= 0) {
		// 	this._parentDependents.splice(i, 1);
		// }
		while (i !== 0) {
			if (this._parentDependents[--i] === parentDependent) {
				this._parentDependents.splice(i, 1);
				break;
			}
		}
	}

	this._checkDeactivate();
};

Obs.prototype._unregisterParentDependentsOnChildrenDependencies = function <T>(this: IObsInternal<T>) {
	if (!this._activatedParentDependentsAfterDeep) {
		return;
	}

	let i = this._childDependencies.length;
	while (i !== 0) {
		this._childDependencies[--i]._unregisterParentDependentDeep(this);
	}

	this._state = STATE_DIRTY;

	this._activatedParentDependentsAfterDeep = false;
};

Obs.prototype._climbParentDependentsToFeedQueueOfRootObsToResolve = function <T>(
	this: IObsInternal<T>,
	dirty: boolean,
) {
	this._state = dirty ? STATE_DIRTY : STATE_DIRTY_CHILDREN;
	let i = this._parentDependents.length;
	if (i !== 0) {
		while (i !== 0) {
			const parentDependent = this._parentDependents[--i];
			if (parentDependent._state === STATE_RESOLVED) {
				parentDependent._climbParentDependentsToFeedQueueOfRootObsToResolve(false);
			}
		}
		// !arrayIncludes(queueOfRootObsToResolve, this)
	} else if (!this._inQueueOfRoots) {
		this._inQueueOfRoots = true;
		i = queueOfRootObsToResolve.push(this);
		if (i === 1) {
			tickFunc(flushQueueOfRootObsToResolve);
		}
	}
};

Obs.prototype._resolve = function <T>(this: IObsInternal<T>) {
	if (this._state === STATE_RESOLVED) {
		return;
	}

	if (this._state === STATE_DIRTY) {
		if (this._deriveFunc) {
			this._callDeriveFunc();
		}
		return;
	}

	// STATE_DIRTY_CHILDREN

	let i = this._childDependencies.length;
	while (i !== 0) {
		this._childDependencies[--i]._resolve();

		// @ts-expect-error TS2367
		if (this._state === STATE_DIRTY) {
			if (this._deriveFunc) {
				this._callDeriveFunc();
			}
			return;
		}
	}

	this._state = STATE_RESOLVED;
};

Obs.prototype._callDeriveFunc = function <T>(this: IObsInternal<T>) {
	if (!this._deriveFunc) {
		return;
	}

	if (this._isDeriving) {
		throw new Error('Circular!');
	}
	this._isDeriving = true;

	const previousDeriveObs = currentDeriveObs;
	// eslint-disable-next-line @typescript-eslint/no-this-alias
	currentDeriveObs = this;

	const previousChildDependencies = this._childDependencies.slice();
	this._childDependencies.length = 0;

	let derivedValue: T | undefined;
	let deriveError: Error | undefined;
	try {
		derivedValue = this._deriveFunc();
	} catch (err) {
		deriveError = currentDeriveError = ensureErrorType(err);
	}

	currentDeriveObs = previousDeriveObs;

	this._isDeriving = false;

	if (this._hasParentDependentsOrEventListeners) {
		let newChildDependenciesCount = 0;

		let i = this._childDependencies.length;
		while (i !== 0) {
			const childDependency = this._childDependencies[--i];

			if (!arrayIncludes(previousChildDependencies, childDependency)) {
				childDependency._registerParentDependentDeep(this, false);
				newChildDependenciesCount++;
			}
		}

		i = this._childDependencies.length;
		let iPrev = previousChildDependencies.length;
		if (iPrev !== 0 && (i === 0 || i - newChildDependenciesCount < iPrev)) {
			while (iPrev !== 0) {
				const previousChildDependency = previousChildDependencies[--iPrev];

				if (i === 0 || !arrayIncludes(this._childDependencies, previousChildDependency)) {
					previousChildDependency._unregisterParentDependentDeep(this);
				}
			}
		}

		if (i !== 0) {
			this._activatedParentDependentsAfterDeep = true;
		} else {
			this._activatedParentDependentsAfterDeep = false;
			this._state = STATE_RESOLVED;
		}
	} else {
		this._state = this._childDependencies.length ? STATE_DIRTY : STATE_RESOLVED;
	}

	if (typeof derivedValue !== 'undefined') {
		this._setCurrentValue(derivedValue);
		return;
	}

	if (deriveError) {
		this._initializedWithValueOrError = true;

		if (currentDeriveError) {
			this._setErrorHereAndClimbParentDependents(currentDeriveError);

			currentErrorHandler(currentDeriveError);
		} else {
			this._setErrorHereAndClimbParentDependents(undefined);
		}

		if (this._activatedParentDependentsAfterDeep) {
			this._state = STATE_RESOLVED;
		}
	}
};

Obs.prototype._setCurrentValue = function <T>(this: IObsInternal<T>, newValue: T) {
	this._initializedWithValueOrError = true;

	if (this._resolvedError) {
		this._setErrorHereAndClimbParentDependents(undefined);
	}

	if (this._activatedParentDependentsAfterDeep) {
		this._state = STATE_RESOLVED;
	}

	this._idOfUpdateWithValueOrError = ++lastIdOfUpdateWithValueOrError;

	const previousValue = this._resolvedValue;
	const changed = this._eq ? !this._eq(newValue, previousValue) : newValue !== previousValue;
	if (changed) {
		this._resolvedValue = newValue;

		let i = this._parentDependents.length;
		while (i !== 0) {
			this._parentDependents[--i]._climbParentDependentsToFeedQueueOfRootObsToResolve(true);
		}

		this._emitEvent(ObsEventChange, newValue, previousValue, undefined);
	}

	return changed;
};

Obs.prototype._setErrorHereAndClimbParentDependents = function <T>(this: IObsInternal<T>, error: Error | undefined) {
	if (this._resolvedError === error) {
		return;
	}
	this._resolvedError = error;

	this._idOfUpdateWithValueOrError = ++lastIdOfUpdateWithValueOrError;

	if (error) {
		this._emitEvent(ObsEventError, undefined, undefined, error);
	}

	let i = this._parentDependents.length;
	while (i !== 0) {
		this._parentDependents[--i]._setErrorHereAndClimbParentDependents(error);
	}
};

Object.freeze(Obs.prototype);

// ----------------
// </OBSERVANT INTERNALS>
// ----------------

// export const test1 = obs(' ');
// export const test11 = obs(() => {
// 	return ' ';
// });

// export const test2 = obs(0);
// export const test22 = obs(() => {
// 	return 0;
// });

// export const test3 = obs(null);
// export const test33 = obs(() => {
// 	return null;
// });

// export const test4 = obs(() => {
// 	//noop
// });
// export const test44 = obs(() => {
// 	return () => {
// 		// noop
// 	};
// });

// export const test5 = obs(() => {
// 	return 0;
// });
// export const test55 = obs(() => {
// 	return () => {
// 		return 0;
// 	};
// });

// export const test6 = obs((s: string) => {
// 	return 0;
// });
// export const test66 = obs((s: string) => {
// 	return () => {
// 		return 0;
// 	};
// });

// export const test7 = obs(undefined);
// export const test77 = obs(() => {
// 	return undefined;
// });

// export const test8 = obs({
// 	n: 0,
// });
// export const test88 = obs(() => {
// 	return {
// 		n: 0,
// 	};
// });

// export type TNotUndefined<T> = Exclude<T, undefined>;

// export type TNeverUndefinedOrFunction<T> = T extends undefined ? never : T extends Function ? never : T;
// export type TNeverNullOrUndefined<T> = T extends null | undefined ? never : T;
// export type TNeverUndefined<T> = T extends undefined ? never : T;

// https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
// https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask
// https://nodejs.org/api/globals.html#queuemicrotaskcallback

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export type TObsTick = <T extends TNotUndefined<any>[]>(func: (...args: T) => unknown, ...args: T) => void;

// // export const tickNodeJSSetTimeout: TObsTick | undefined =
// // 	typeof globalThis !== 'undefined' && globalThis.setTimeout
// // 		? (func, ...args) => {
// // 				globalThis.setTimeout(
// // 					(argz) => {
// // 						func(...argz);
// // 					},
// // 					0,
// // 					args,
// // 				);
// // 		  }
// // 		: undefined;
// export const tickNodeJSSetTimeout: TObsTick | undefined =
// 	typeof globalThis !== 'undefined' && globalThis.setTimeout ? globalThis.setTimeout : undefined;
// // console.log('DEBUG tickNodeJSSetTimeout: ', typeof tickNodeJSSetTimeout);

// // export const tickNodeJSQueueMicrotask: TObsTick | undefined =
// // 	typeof globalThis !== 'undefined' && globalThis.queueMicrotask
// // 		? (func, ...args) => {
// // 				globalThis.queueMicrotask(() => {
// // 					func(...args);
// // 				});
// // 		  }
// // 		: undefined;
// export const tickNodeJSQueueMicrotask: TObsTick | undefined =
// 	typeof globalThis !== 'undefined' && globalThis.queueMicrotask ? globalThis.queueMicrotask : undefined;
// // console.log('DEBUG tickNodeJSQueueMicrotask: ', typeof tickNodeJSQueueMicrotask);

// export const tickNodeJSSetImmediate: TObsTick | undefined =
// 	typeof globalThis !== 'undefined' && globalThis.setImmediate ? globalThis.setImmediate : undefined;
// // console.log('DEBUG tickNodeJSSetImmediate: ', typeof tickNodeJSSetImmediate);

// // export const tickDOMSetTimeout: TObsTick | undefined =
// // 	// @ts-expect-error TS2774
// // 	typeof self !== 'undefined' && self.setTimeout
// // 		? (func, ...args) => {
// // 				(self as WindowOrWorkerGlobalScope).setTimeout(
// // 					// eslint-disable-next-line @typescript-eslint/no-explicit-any
// // 					(argz: any) => {
// // 						func(...argz);
// // 					},
// // 					0,
// // 					args,
// // 				);
// // 		  }
// // 		: undefined;
// export const tickDOMSetTimeout: TObsTick | undefined =
// 	typeof self !== 'undefined' && self.setTimeout ? self.setTimeout : undefined;
// // console.log('DEBUG tickDOMSetTimeout: ', typeof tickDOMSetTimeout);

// export const tickDOMQueueMicrotask: TObsTick | undefined =
// 	// @ts-expect-error TS2774
// 	typeof self !== 'undefined' && self.queueMicrotask
// 		? (func, ...args) => {
// 				(self as WindowOrWorkerGlobalScope).queueMicrotask(() => {
// 					func(...args);
// 				});
// 		  }
// 		: undefined;

// export const tickPromise: TObsTick = (func, ...args) => {
// 	// eslint-disable-next-line promise/catch-or-return,promise/always-return
// 	__promise.then(() => {
// 		func(...args);
// 	});
// };

// :(
// preserveConstEnums = false
// isolatedModules = false
// const enum EnumState {
// 	resolved = 1,
// 	pending,
// 	deps,
// }

// interface IMySet<T> {
// 	data: Set<T>;
// 	has: (v: T) => boolean;
// 	add: (v: T) => void;
// 	delete: (v: T) => void;
// 	clear: () => void;
// }
// interface MySetConstructor<T> {
// 	new (): IMySet<T>;
// 	(): IMySet<T>;
// }
// const MySet = Object.seal(function <T extends IObs<TObserved>>(this: IMySet<T>) {
// 	if (
// 		typeof this === 'undefined' ||
// 		typeof this.constructor === 'undefined' ||
// 		(typeof Window !== 'undefined' && this.constructor === Window)
// 	) {
// 		return new MySet();
// 	}

// 	this.data = new Set();

// 	return this;
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// }) as MySetConstructor<any>;
// MySet.prototype.has = function <T>(this: IMySet<T>, v: T): boolean {
// 	return this.data.has(v);
// };
// MySet.prototype.add = function <T>(this: IMySet<T>, v: T): void {
// 	this.data.add(v);
// };
// MySet.prototype.delete = function <T>(this: IMySet<T>, v: T): void {
// 	this.data.delete(v);
// };
// MySet.prototype.clear = function <T>(this: IMySet<T>): void {
// 	this.data.clear();
// };
// export const setTick = (func: TObsTick | undefined) => {
// 	tickFunc = func;
// };

// const isChrome = typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.match(/chrome|edg\//i);
// console.log(`isChrome: ${isChrome}`);

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// return (self as any).noseal ? this : Object.seal(this);

// const obj = {
// 	change: undefined,
// 	error: undefined,
// };
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// this._eventListeners = (self as any).noseal ? obj : Object.seal(obj);
