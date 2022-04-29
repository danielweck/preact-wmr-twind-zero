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
export type TObsEventListenersMap<T> = {
	[ObsEventChange]: TObsEventListeners<T>;
	[ObsEventError]: TObsEventListeners<T>;
};
export type TObsEventTypes<T> = keyof TObsEventListenersMap<T>;

export type TObsPrimitive = null | number | string | boolean;
export type TObserved = TObsPrimitive | Array<TObsPrimitive> | Record<string, unknown>;
export type TObsDeriveFunc<T> = () => T;

export interface IObs<T> {
	set: (value: T) => this;
	get: () => T;

	dispose: () => this;

	onChange: (listener: TObsEventListenerChange<T>) => () => this;
	onError: (listener: TObsEventListenerError) => () => this;

	_eventListeners: TObsEventListenersMap<T>;
	_onEvent: (key: TObsEventTypes<T>, listener: TObsEventListener<T>) => () => this;
	_offEvent: (key?: TObsEventTypes<T>, listener?: TObsEventListener<T>) => this;
	_emitEvent: (
		key: TObsEventTypes<T>,
		current: T | undefined,
		previous: T | undefined,
		error: Error | undefined,
	) => void;

	_eq: undefined | ((value1: T | undefined, value2: T | undefined) => boolean);

	_currentValue?: T;
	_setCurrentValue: (value: T) => void;

	_state: typeof STATE_RESOLVED | typeof STATE_PENDING | typeof STATE_RESOLVE_CHILD_DEPS;
	_initializedWithValueOrError: boolean;

	_activatedStage1: boolean;
	_activatedStage2: boolean;
	_tryActivate: (resolved: boolean) => void;
	_checkDeactivate: () => void;

	_feedQueue: (dirty: boolean) => void;
	_resolve: () => void;

	_deriveFunc?: TObsDeriveFunc<T>;
	_callDeriveFunc: () => void;
	_isDeriving: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_parentDependents: IObs<any>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_registerParentDependent: (parentDependent: IObs<any>, resolved: boolean) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_unregisterParentDependent: (parentDependent: IObs<any>) => void;

	// can be modified externally from other Observers
	// (see currentDeriveObs._childDependencies in get() and _callDeriveFunc())
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_childDependencies?: IObs<any>[];

	_idOfUpdateWithValueOrError: number;

	_setError: (error: Error | undefined) => void;
	_error: Error | undefined;
}

export type TObsOptions<T> = {
	// name?: string;
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

const defaultErrorHandler = (err: Error, msg?: string) => {
	console.log(msg, err);
};
let currentErrorHandler = defaultErrorHandler;
export const onError = (errorHandler: typeof defaultErrorHandler) => {
	currentErrorHandler = errorHandler;
};

// ----------------
// </ERROR HANDLING>
// ----------------

// ----------------
// <FAST ARRAY UTILS>
// ----------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arrayIndexOf = <T>(arr: T[] | undefined, v: T): number => {
	if (!arr) {
		return -1;
	}
	const l = arr.length;
	for (let i = 0; i < l; i++) {
		if (arr[i] === v) {
			return i;
		}
	}
	return -1;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arrayIncludes = <T>(arr: T[] | undefined, v: T): boolean => {
	if (!arr) {
		return false;
	}
	const l = arr.length;
	for (let i = 0; i < l; i++) {
		if (arr[i] === v) {
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
const obsQueue: IObs<any>[] = [];
let obsQueueIndex = 0;
const processObsQueue = () => {
	// do not cache array.length here! (re-evaluated in loop)
	while (obsQueueIndex < obsQueue.length) {
		const obs = obsQueue[obsQueueIndex++];
		if (obs._activatedStage2) {
			obs._resolve();
		}
	}
	obsQueue.length = 0;
	obsQueueIndex = 0;
};

// ----------------
// </TICK QUEUE PROCESS>
// ----------------

// ----------------
// <GLOBAL STATE>
// ----------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let currentDeriveObs: IObs<any> | undefined;

let currentDeriveError: Error | undefined;

let lastIdOfUpdateWithValueOrError = 0;

const STATE_RESOLVED = 1;
const STATE_PENDING = 2;
const STATE_RESOLVE_CHILD_DEPS = 3;

// ----------------
// </GLOBAL STATE>
// ----------------

// ----------------
// <OBSERVANT WRAP CONSTRUCTOR>
// ----------------

export const obs = <T = TObserved>(v: T | TObsDeriveFunc<T>, options?: TObsOptions<T>) =>
	new (Obs as IObsConstructor<T>)(v, options);

const Obs = function <T extends TObserved>(this: IObs<T>, v: T | TObsDeriveFunc<T>, options?: TObsOptions<T>): IObs<T> {
	// if (
	// 	typeof this === 'undefined' ||
	// 	typeof this.constructor === 'undefined' ||
	// 	(typeof Window !== 'undefined' && this.constructor === Window)
	// ) {
	// 	return new Obs(v, options);
	// }

	this._eq = options?.eq; // ?? Object.is; // referencial === equality

	this._eventListeners = {
		[ObsEventChange]: undefined,
		[ObsEventError]: undefined,
	};

	this._parentDependents = [];
	this._childDependencies = undefined;

	this._activatedStage1 = false;
	this._activatedStage2 = false;

	this._isDeriving = false;

	this._idOfUpdateWithValueOrError = -1;

	this._error = undefined;

	if (typeof v === 'function') {
		this._state = STATE_PENDING;

		this._currentValue = undefined;
		this._deriveFunc = v as TObsDeriveFunc<T>;

		this._initializedWithValueOrError = false;
	} else {
		this._state = STATE_RESOLVED;

		this._currentValue = v as T;
		this._deriveFunc = undefined;

		this._initializedWithValueOrError = true;
	}

	return this;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
};

// ----------------
// </OBSERVANT WRAP CONSTRUCTOR>
// ----------------

// ----------------
// <OBSERVANT PUBLICS>
// ----------------

Obs.prototype.get = function <T>(this: IObs<T>): T {
	if (this._state !== STATE_RESOLVED && this._idOfUpdateWithValueOrError !== lastIdOfUpdateWithValueOrError) {
		// STATE_PENDING || STATE_RESOLVE_CHILD_DEPS
		this._resolve();
	}

	if (currentDeriveObs && currentDeriveObs !== this) {
		if (!currentDeriveObs._childDependencies) {
			currentDeriveObs._childDependencies = [this];
		} else if (!arrayIncludes(currentDeriveObs._childDependencies, this)) {
			currentDeriveObs._childDependencies.push(this);
		}
	}

	if (this._error) {
		throw this._error;
	}

	// guaranteed defined, because this._resolve() sets this._currentValue or sets this._error (which bails out in the conditional above)
	return this._currentValue as T;
};

Obs.prototype.set = function <T>(this: IObs<T>, value: T): IObs<T> {
	if (!this._initializedWithValueOrError && this._deriveFunc) {
		this._callDeriveFunc();
	}

	this._setCurrentValue(value);

	return this;
};

Obs.prototype.dispose = function <T>(this: IObs<T>): IObs<T> {
	this._offEvent();

	const parentDependents = this._parentDependents;
	const l = parentDependents.length;
	for (let i = 0; i < l; i++) {
		parentDependents[i].dispose();
	}

	return this;
};

Obs.prototype.onChange = function <T>(this: IObs<T>, listener: TObsEventListener<T>): () => IObs<T> {
	return this._onEvent(ObsEventChange, listener);
};

Obs.prototype.onError = function <T>(this: IObs<T>, listener: TObsEventListener<T>): () => IObs<T> {
	return this._onEvent(ObsEventError, listener);
};

// ----------------
// </OBSERVANT PUBLICS>
// ----------------

// ----------------
// <OBSERVANT INTERNALS>
// ----------------

Obs.prototype._onEvent = function <T>(
	this: IObs<T>,
	key: TObsEventTypes<T>,
	listener: TObsEventListener<T>,
): () => IObs<T> {
	if (this._childDependencies) {
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

	this._tryActivate(true);

	return () => this._offEvent(key, listener);
};

Obs.prototype._offEvent = function <T>(
	this: IObs<T>,
	key?: TObsEventTypes<T>,
	listener?: TObsEventListener<T>,
): IObs<T> {
	if (this._childDependencies) {
		this._resolve();
	}

	if (listener && key) {
		const listeners = this._eventListeners[key];
		if (listeners) {
			const l = listeners.length;
			if (!Array.isArray(listeners)) {
				if (listeners === listener) {
					this._eventListeners[key] = undefined;
				}
			} else if (l === 1) {
				if (listeners[0] === listener) {
					this._eventListeners[key] = undefined;
				}
			} else {
				for (let i = 0; i < l; i++) {
					if (listeners[i] === listener) {
						listeners.splice(i, 1);
						break;
					}
				}
			}
		}
	} else if (key) {
		this._eventListeners[key] = undefined;
	} else {
		this._eventListeners = { [ObsEventChange]: undefined, [ObsEventError]: undefined };
	}

	this._checkDeactivate();

	return this;
};

Obs.prototype._emitEvent = function <T>(
	this: IObs<T>,
	key: TObsEventTypes<T>,
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
			const exception = err instanceof Error ? err : new Error(String(err));
			currentErrorHandler(exception, 'Listener!');
		}
	};

	if (Array.isArray(listeners)) {
		const l = listeners.length;
		if (l === 1) {
			tryEventListener(listeners[0]);
		} else {
			for (let i = 0; i < l; i++) {
				tryEventListener(listeners[i]);
			}
		}
	} else {
		tryEventListener(listeners);
	}
};

Obs.prototype._registerParentDependent = function <T>(
	this: IObs<T>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	parentDependent: IObs<any>,
	resolved: boolean,
) {
	if (this !== parentDependent) {
		this._parentDependents.push(parentDependent);
	}

	this._tryActivate(resolved);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Obs.prototype._unregisterParentDependent = function <T>(this: IObs<T>, parentDependent: IObs<any>) {
	const i = arrayIndexOf(this._parentDependents, parentDependent);
	if (i >= 0) {
		this._parentDependents.splice(i, 1);
	}

	this._checkDeactivate();
};

Obs.prototype._tryActivate = function <T>(this: IObs<T>, resolved: boolean) {
	this._activatedStage1 = true;

	// _childDependencies pointer copy, because can be modified externally
	// (see currentDeriveObs._childDependencies in get() and _callDeriveFunc())
	const thisChildDependencies = this._childDependencies;

	if (this._activatedStage2 || !this._deriveFunc || !thisChildDependencies) {
		return;
	}

	const l = thisChildDependencies.length;
	for (let i = 0; i < l; i++) {
		thisChildDependencies[i]._registerParentDependent(this, resolved);
	}

	if (resolved) {
		this._state = STATE_RESOLVED;
	}

	this._activatedStage2 = true;
};

Obs.prototype._checkDeactivate = function <T>(this: IObs<T>) {
	if (
		!this._activatedStage1 ||
		this._parentDependents.length ||
		this._eventListeners[ObsEventChange] ||
		this._eventListeners[ObsEventError]
	) {
		return;
	}

	this._activatedStage1 = false;

	if (!this._activatedStage2) {
		return;
	}

	// _childDependencies pointer copy, because can be modified externally
	// (see currentDeriveObs._childDependencies in get() and _callDeriveFunc())
	const thisChildDependencies = this._childDependencies;
	if (thisChildDependencies) {
		const l = thisChildDependencies.length;
		for (let i = 0; i < l; i++) {
			thisChildDependencies[i]._unregisterParentDependent(this);
		}
	}

	this._state = STATE_PENDING;

	this._activatedStage2 = false;
};

Obs.prototype._feedQueue = function <T>(this: IObs<T>, dirty: boolean) {
	this._state = dirty ? STATE_PENDING : STATE_RESOLVE_CHILD_DEPS;

	const parentDependents = this._parentDependents;
	const l = parentDependents.length;
	if (l) {
		for (let i = 0; i < l; i++) {
			const parentDependent = parentDependents[i];
			if (parentDependent._state === STATE_RESOLVED) {
				parentDependent._feedQueue(false);
			}
		}
	} else if (!arrayIncludes(obsQueue, this)) {
		const i = obsQueue.push(this);
		if (i === 1) {
			tickFunc(processObsQueue);
		}
	}
};

Obs.prototype._resolve = function <T>(this: IObs<T>) {
	if (this._state === STATE_PENDING) {
		if (this._deriveFunc) {
			this._callDeriveFunc();
		}
		return;
	}

	if (this._state !== STATE_RESOLVE_CHILD_DEPS) {
		// STATE_RESOLVED
		return;
	}

	// STATE_RESOLVE_CHILD_DEPS

	// _childDependencies pointer copy, because can be modified externally
	// (see currentDeriveObs._childDependencies in get() and _callDeriveFunc())
	const thisChildDependencies = this._childDependencies;
	if (thisChildDependencies) {
		const l = thisChildDependencies.length;
		for (let i = 0; i < l; i++) {
			thisChildDependencies[i]._resolve();

			// @ts-expect-error TS2367
			if (this._state === STATE_PENDING) {
				if (this._deriveFunc) {
					this._callDeriveFunc();
				}
				return;
			}
		}
		this._state = STATE_RESOLVED;
	}
};

Obs.prototype._callDeriveFunc = function <T>(this: IObs<T>) {
	if (!this._deriveFunc) {
		return;
	}

	if (this._isDeriving) {
		throw new Error('Circular!');
	}
	this._isDeriving = true;

	const previousChildDependencies = this._childDependencies;
	this._childDependencies = undefined;

	const previousDeriveObs = currentDeriveObs;
	// eslint-disable-next-line @typescript-eslint/no-this-alias
	currentDeriveObs = this;

	let derivedValue: T | undefined;
	let deriveError: Error | undefined;
	try {
		derivedValue = this._deriveFunc();
	} catch (err) {
		const exception = err instanceof Error ? err : new Error(String(err));
		deriveError = currentDeriveError = exception;
	}

	currentDeriveObs = previousDeriveObs;

	this._isDeriving = false;

	if (this._activatedStage1) {
		let newChildDependenciesCount = 0;

		// _childDependencies pointer copy, because can be modified externally
		// (see currentDeriveObs._childDependencies in get() and _callDeriveFunc())

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const thisChildDependencies = this._childDependencies as IObs<any>[] | undefined;
		if (thisChildDependencies) {
			const l = thisChildDependencies.length;
			for (let i = 0; i < l; i++) {
				const childDependency = thisChildDependencies[i];

				if (!arrayIncludes(previousChildDependencies, childDependency)) {
					childDependency._registerParentDependent(this, false);
					newChildDependenciesCount++;
				}
			}
		}

		if (
			previousChildDependencies &&
			(!thisChildDependencies ||
				thisChildDependencies.length - newChildDependenciesCount < previousChildDependencies.length)
		) {
			const l = previousChildDependencies.length;
			for (let i = 0; i < l; i++) {
				const previousChildDependency = previousChildDependencies[i];

				if (!arrayIncludes(thisChildDependencies, previousChildDependency)) {
					previousChildDependency._unregisterParentDependent(this);
				}
			}
		}

		if (thisChildDependencies) {
			this._activatedStage2 = true;
		} else {
			this._activatedStage2 = false;
			this._state = STATE_RESOLVED;
		}
	} else {
		this._state = this._childDependencies ? STATE_PENDING : STATE_RESOLVED;
	}

	if (typeof derivedValue !== 'undefined') {
		this._setCurrentValue(derivedValue);
		return;
	}

	if (deriveError) {
		this._initializedWithValueOrError = true;

		if (currentDeriveError) {
			this._setError(currentDeriveError);

			currentErrorHandler(currentDeriveError);
		} else {
			this._setError(undefined);
		}

		if (this._activatedStage2) {
			this._state = STATE_RESOLVED;
		}
	}
};

Obs.prototype._setCurrentValue = function <T>(this: IObs<T>, newValue: T) {
	this._initializedWithValueOrError = true;

	if (this._error) {
		this._setError(undefined);
	}

	if (this._activatedStage2) {
		this._state = STATE_RESOLVED;
	}

	const previousValue = this._currentValue;

	const changed = this._eq ? !this._eq(newValue, previousValue) : newValue !== previousValue;
	if (changed) {
		this._currentValue = newValue;

		this._idOfUpdateWithValueOrError = ++lastIdOfUpdateWithValueOrError;

		const parentDependents = this._parentDependents;
		const l = parentDependents.length;
		for (let i = 0; i < l; i++) {
			parentDependents[i]._feedQueue(true);
		}

		this._emitEvent(ObsEventChange, newValue, previousValue, undefined);
	}

	return changed;
};

Obs.prototype._setError = function <T>(this: IObs<T>, error: Error | undefined) {
	if (this._error === error) {
		return;
	}
	this._error = error;

	this._idOfUpdateWithValueOrError = ++lastIdOfUpdateWithValueOrError;

	if (error) {
		this._emitEvent(ObsEventError, undefined, undefined, error);
	}

	const parentDependents = this._parentDependents;
	const l = parentDependents.length;
	for (let i = 0; i < l; i++) {
		parentDependents[i]._setError(error);
	}
};

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
