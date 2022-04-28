// The core observable logic in this single-file lib was copied from Cellx:
// https://github.com/Riim/cellx
// Many thanks to the original developer for designing
// a fast and memory-efficient reactive runtime!
// This lib however is a significant refactoring:
// much smaller API surface (get/set, on-changed/on-error),
// improved typings,
// simplified and inlined event emmitter,
// many renamed things, etc. :)

export type NotUndefined<T> = Exclude<T, undefined>;

// export type NeverUndefinedOrFunction<T> = T extends undefined ? never : T extends Function ? never : T;
// export type NeverNullOrUndefined<T> = T extends null | undefined ? never : T;
// export type NeverUndefined<T> = T extends undefined ? never : T;

// https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
// https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask
// https://nodejs.org/api/globals.html#queuemicrotaskcallback

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export type TickFunc = <T extends NotUndefined<any>[]>(func: (...args: T) => unknown, ...args: T) => void;
export type TickFunc = (func: () => void) => void;

// export const tickNodeJSSetTimeout: TickFunc | undefined =
// 	typeof globalThis !== 'undefined' && globalThis.setTimeout
// 		? (func, ...args) => {
// 				globalThis.setTimeout(
// 					(argz) => {
// 						func(...argz);
// 					},
// 					0,
// 					args,
// 				);
// 		  }
// 		: undefined;
export const tickNodeJSSetTimeout: TickFunc | undefined =
	typeof globalThis !== 'undefined' && globalThis.setTimeout ? globalThis.setTimeout : undefined;
// console.log('DEBUG tickNodeJSSetTimeout: ', typeof tickNodeJSSetTimeout);

// export const tickNodeJSQueueMicrotask: TickFunc | undefined =
// 	typeof globalThis !== 'undefined' && globalThis.queueMicrotask
// 		? (func, ...args) => {
// 				globalThis.queueMicrotask(() => {
// 					func(...args);
// 				});
// 		  }
// 		: undefined;
export const tickNodeJSQueueMicrotask: TickFunc | undefined =
	typeof globalThis !== 'undefined' && globalThis.queueMicrotask ? globalThis.queueMicrotask : undefined;
// console.log('DEBUG tickNodeJSQueueMicrotask: ', typeof tickNodeJSQueueMicrotask);

export const tickNodeJSSetImmediate: TickFunc | undefined =
	typeof globalThis !== 'undefined' && globalThis.setImmediate ? globalThis.setImmediate : undefined;
// console.log('DEBUG tickNodeJSSetImmediate: ', typeof tickNodeJSSetImmediate);

export const tickNodeJSProcessNextTick: TickFunc | undefined =
	typeof globalThis !== 'undefined' && globalThis.process?.nextTick ? globalThis.process.nextTick : undefined;
// console.log('DEBUG tickNodeJSProcessNextTick: ', typeof tickNodeJSProcessNextTick);

// export const tickDOMSetTimeout: TickFunc | undefined =
// 	// @ts-expect-error TS2774
// 	typeof self !== 'undefined' && self.setTimeout
// 		? (func, ...args) => {
// 				(self as WindowOrWorkerGlobalScope).setTimeout(
// 					// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 					(argz: any) => {
// 						func(...argz);
// 					},
// 					0,
// 					args,
// 				);
// 		  }
// 		: undefined;
export const tickDOMSetTimeout: TickFunc | undefined =
	typeof self !== 'undefined' && self.setTimeout ? self.setTimeout : undefined;
// console.log('DEBUG tickDOMSetTimeout: ', typeof tickDOMSetTimeout);

// export const tickDOMQueueMicrotask: TickFunc | undefined =
// 	// @ts-expect-error TS2774
// 	typeof self !== 'undefined' && self.queueMicrotask
// 		? (func, ...args) => {
// 				(self as WindowOrWorkerGlobalScope).queueMicrotask(() => {
// 					func(...args);
// 				});
// 		  }
// 		: undefined;

export const tickDOMQueueMicrotask: TickFunc | undefined =
	typeof self !== 'undefined' && self.queueMicrotask ? self.queueMicrotask : undefined;
// console.log('DEBUG tickDOMQueueMicrotask: ', typeof tickDOMQueueMicrotask);

const __promise = Promise.resolve();
// export const tickPromise: TickFunc = (func, ...args) => {
// 	// eslint-disable-next-line promise/catch-or-return,promise/always-return
// 	__promise.then(() => {
// 		func(...args);
// 	});
// };
export const tickPromise: TickFunc = (func) => {
	// eslint-disable-next-line promise/catch-or-return,promise/always-return
	__promise.then(() => {
		func();
	});
};
// console.log('DEBUG tickPromise: ', typeof tickPromise);

export const tickDefault = tickDOMQueueMicrotask ?? tickNodeJSProcessNextTick ?? tickPromise;

let __tick: TickFunc | undefined = tickDefault;
export const setTick = (func: TickFunc | undefined) => {
	// console.log('setTick', typeof func, func !== __tick);
	__tick = func;
};

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

const defaultErrorHandler = (err: Error, msg?: string) => {
	console.log(msg, err);
};
let __errorHandler = defaultErrorHandler;
export const setErrorHandler = (errorHandler: typeof defaultErrorHandler) => {
	__errorHandler = errorHandler;
};

export interface IObsEvent<T> {
	target: IObs<T>;
	previous?: T;
	current?: T;
	error?: Error;
}

export type TObsListener<T> = {
	(evt: IObsEvent<T>): unknown;
};

export type TObsOptions<T> = {
	name?: string;
	eq?: (value1: T | undefined, value2: T | undefined) => boolean;
};

export type TObservablePrimitive = null | number | string | boolean;
export type TObservable = TObservablePrimitive | Array<TObservablePrimitive> | Record<string, unknown>;
export type TCalc<T> = () => T;

// :(
// preserveConstEnums = false
// isolatedModules = false
// const enum EnumState {
// 	resolved = 1,
// 	pending,
// 	deps,
// }
const EnumState_resolved = 1;
const EnumState_pending = 2;
const EnumState_deps = 3;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const __pendingObs: IObs<any>[] = [];
// const __pendingObs: Set<IObs<any>> = new Set();
let __pendingObsIndex = 0;
const __resolvePending = () => {
	// do not cache array.length here! (re-evaluated in loop)
	while (__pendingObsIndex < __pendingObs.length) {
		const obs = __pendingObs[__pendingObsIndex++];
		if (obs._active) {
			obs._resolve();
		}
	}
	__pendingObs.length = 0;
	__pendingObsIndex = 0;

	// // __pendingObs.forEach((obs) => {
	// // 	if (obs._active) {
	// // 		obs._resolve();
	// // 	}
	// // });
	// // const it = __pendingObs.values();
	// // // eslint-disable-next-line @typescript-eslint/no-explicit-any
	// // let obs: IObs<any> | undefined;
	// // while ((obs = it.next().value)) {
	// // 	if (obs._active) {
	// // 		obs._resolve();
	// // 	}
	// // }
	// for (const obs of __pendingObs.values()) {
	// 	if (obs._active) {
	// 		obs._resolve();
	// 	}
	// }

	// __pendingObs.clear();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let __calcObs: IObs<any> | undefined;

let __calcError: Error | undefined;

let __updateID = 0;

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
// const MySet = Object.seal(function <T extends IObs<TObservable>>(this: IMySet<T>) {
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

export interface IObs<T> {
	set: (value: T) => void;
	get: () => T;

	onChange: (listener: TObsListener<T>) => this;
	offChange: (listener?: TObsListener<T>) => this;

	onError: (listener: TObsListener<T>) => this;
	offError: (listener?: TObsListener<T>) => this;

	dispose: () => void;

	_emitEventChange: (evt: IObsEvent<T>) => void;
	_emitEventError: (evt: IObsEvent<T>) => void;

	_tryEventListener: (evtListener: TObsListener<T>, evt: IObsEvent<T>) => void;

	_activated: boolean;
	_active: boolean;
	_activate: (resolved: boolean) => void;
	_deactivate: () => void;

	_addToPending: (dirty: boolean) => void;
	_resolve: () => void;

	_calc?: TCalc<T>;
	_doCalc: () => void;

	_current?: T;
	_setCurrent: (value: T) => void;

	_setError: (evt: IObsEvent<T> | undefined) => void;

	_name?: string;

	_eq: (value1: T | undefined, value2: T | undefined) => boolean;

	_eventListenersChange: TObsListener<T> | TObsListener<T>[] | undefined;
	_eventListenersError: TObsListener<T> | TObsListener<T>[] | undefined;

	_calculating: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_calcReactions: IObs<any>[];
	// _calcReactions: Set<IObs<any>>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_addCalcReaction: (calcReaction: IObs<any>, resolved: boolean) => boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_deleteCalcReaction: (calcReaction: IObs<any>) => void;

	// can be modified externally from other Observers
	// (see __calculating._$$calcDependencies in get())
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_$$calcDependencies?: IObs<any>[];
	// _$$calcDependencies?: Set<IObs<any>>;

	_state: typeof EnumState_resolved | typeof EnumState_pending | typeof EnumState_deps;
	_initialized: boolean;

	_updateID: number;

	_error: Error | undefined;

	_lastErrorEvent: IObsEvent<T> | undefined;
}
export interface ObsConstructor<T> {
	new (v: T | TCalc<T>, options?: TObsOptions<T>): IObs<T>;
	(v: T | TCalc<T>, options?: TObsOptions<T>): IObs<T>;
}
export const Obs = Object.seal(function <T extends TObservable>(
	this: IObs<T>,
	v: T | TCalc<T>,
	options?: TObsOptions<T>,
) {
	if (
		typeof this === 'undefined' ||
		typeof this.constructor === 'undefined' ||
		(typeof Window !== 'undefined' && this.constructor === Window)
	) {
		return new Obs(v, options);
	}

	this._name = options?.name ?? undefined;

	this._eq = options?.eq ?? Object.is; // referencial equality

	this._eventListenersChange = undefined;
	this._eventListenersError = undefined;

	// this._calcReactions = new Set();
	this._calcReactions = [];

	this._activated = false;
	this._active = false;

	this._calculating = false;

	this._updateID = -1;

	if (typeof v === 'function') {
		this._state = EnumState_pending;
		this._calc = v as TCalc<T>;

		this._initialized = false;
	} else {
		this._state = EnumState_resolved;
		this._current = v as T;

		this._initialized = true;
	}

	return this;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as ObsConstructor<any>;

export const obs = <T extends TObservable>(v: T | TCalc<T>, options?: TObsOptions<T>) => new Obs(v, options);

Obs.prototype.get = function <T>(this: IObs<T>): T {
	if (this._state !== EnumState_resolved && this._updateID !== __updateID) {
		this._resolve();
	}

	if (__calcObs) {
		if (!__calcObs._$$calcDependencies) {
			__calcObs._$$calcDependencies = [this];
		} else if (!arrayIncludes(__calcObs._$$calcDependencies, this)) {
			__calcObs._$$calcDependencies.push(this);
		}
		// if (!__calcObs._$$calcDependencies) {
		// 	__calcObs._$$calcDependencies = new Set();
		// }
		// __calcObs._$$calcDependencies.add(this);
	}

	if (this._error) {
		throw this._error;
	}

	// guaranteed defined, because this._resolve() sets this._current or sets this._error (which bails out in the conditional above)
	return this._current as T;
};

Obs.prototype.set = function <T>(this: IObs<T>, value: T) {
	if (!this._initialized) {
		this._doCalc();
	}

	this._setCurrent(value);

	return this;
};

Obs.prototype.onChange = function <T>(this: IObs<T>, listener: TObsListener<T>): IObs<T> {
	// if (this._state === EnumState_pending || (this._state === EnumState_deps && this._$$calcDependencies)) {
	if (this._$$calcDependencies) {
		this._resolve();
	}

	const listeners = this._eventListenersChange;
	if (!listeners) {
		this._eventListenersChange = listener;
	} else if (Array.isArray(listeners)) {
		if (!arrayIncludes(listeners, listener)) {
			listeners.push(listener);
		}
	} else if (listeners !== listener) {
		this._eventListenersChange = [listeners, listener];
	}

	this._activate(true);

	return this;
};

Obs.prototype.offChange = function <T>(this: IObs<T>, listener?: TObsListener<T>): IObs<T> {
	// if (this._state === EnumState_pending || (this._state === EnumState_deps && this._$$calcDependencies)) {
	if (this._$$calcDependencies) {
		this._resolve();
	}

	if (listener) {
		const listeners = this._eventListenersChange;
		if (listeners) {
			const l = listeners.length;
			if (!Array.isArray(listeners)) {
				if (listeners === listener) {
					this._eventListenersChange = undefined;
				}
			} else if (l === 1) {
				if (listeners[0] === listener) {
					this._eventListenersChange = undefined;
				}
			} else {
				// let i = l - 1;
				// while (i >= 0) {
				// 	if (listeners[i] === listener) {
				// 		listeners.splice(i, 1);
				// 		// break; possible multiple listeners!
				// 	}
				// 	i--;
				// }
				for (let i = 0; i < l; i++) {
					if (listeners[i] === listener) {
						listeners.splice(i, 1);
						break;
					}
				}
			}
		}
	} else {
		this._eventListenersChange = undefined;
	}

	this._deactivate();

	return this;
};

Obs.prototype.onError = function <T>(this: IObs<T>, listener: TObsListener<T>): IObs<T> {
	// if (this._state === EnumState_pending || (this._state === EnumState_deps && this._$$calcDependencies)) {
	if (this._$$calcDependencies) {
		this._resolve();
	}

	const listeners = this._eventListenersError;
	if (!listeners) {
		this._eventListenersError = listener;
	} else if (Array.isArray(listeners)) {
		if (!arrayIncludes(listeners, listener)) {
			listeners.push(listener);
		}
	} else if (listeners !== listener) {
		this._eventListenersError = [listeners, listener];
	}

	this._activate(true);

	return this;
};

Obs.prototype.offError = function <T>(this: IObs<T>, listener?: TObsListener<T>): IObs<T> {
	// if (this._state === EnumState_pending || (this._state === EnumState_deps && this._$$calcDependencies)) {
	if (this._$$calcDependencies) {
		this._resolve();
	}

	if (listener) {
		const listeners = this._eventListenersError;
		if (listeners) {
			const l = listeners.length;
			if (!Array.isArray(listeners)) {
				if (listeners === listener) {
					this._eventListenersError = undefined;
				}
			} else if (l === 1) {
				if (listeners[0] === listener) {
					this._eventListenersError = undefined;
				}
			} else {
				// let i = l - 1;
				// while (i >= 0) {
				// 	if (listeners[i] === listener) {
				// 		listeners.splice(i, 1);
				// 		// break; possible multiple listeners!
				// 	}
				// 	i--;
				// }
				for (let i = 0; i < l; i++) {
					if (listeners[i] === listener) {
						listeners.splice(i, 1);
						break;
					}
				}
			}
		}
	} else {
		this._eventListenersError = undefined;
	}

	this._deactivate();

	return this;
};

Obs.prototype.dispose = function <T>(this: IObs<T>) {
	this.offChange();
	this.offError();

	const calcReactions = this._calcReactions;
	const l = calcReactions.length;
	for (let i = 0; i < l; i++) {
		calcReactions[i].dispose();
	}
	// // this._calcReactions.forEach((calcReaction) => {
	// // 	calcReaction.dispose();
	// // });
	// // const it = this._calcReactions.values();
	// // // eslint-disable-next-line @typescript-eslint/no-explicit-any
	// // let calcReaction: IObs<any> | undefined;
	// // while ((calcReaction = it.next().value)) {
	// // 	calcReaction.dispose();
	// // }
	// for (const calcReaction of this._calcReactions.values()) {
	// 	calcReaction.dispose();
	// }

	return this;
};

Obs.prototype._emitEventChange = function <T>(this: IObs<T>, evt: IObsEvent<T>) {
	const listeners = this._eventListenersChange;
	if (!listeners) {
		return;
	}

	const tryEventListener = this._tryEventListener;
	if (Array.isArray(listeners)) {
		const l = listeners.length;
		if (l === 1) {
			tryEventListener(listeners[0], evt);
		} else {
			for (let i = 0; i < l; i++) {
				tryEventListener(listeners[i], evt);
			}
		}
	} else {
		tryEventListener(listeners, evt);
	}
};

Obs.prototype._emitEventError = function <T>(this: IObs<T>, evt: IObsEvent<T>) {
	const listeners = this._eventListenersError;
	if (!listeners) {
		return;
	}

	const tryEventListener = this._tryEventListener;
	if (Array.isArray(listeners)) {
		const l = listeners.length;
		if (l === 1) {
			tryEventListener(listeners[0], evt);
		} else {
			for (let i = 0; i < l; i++) {
				tryEventListener(listeners[i], evt);
			}
		}
	} else {
		tryEventListener(listeners, evt);
	}
};

Obs.prototype._tryEventListener = function <T>(this: IObs<T>, listener: TObsListener<T>, evt: IObsEvent<T>) {
	try {
		listener(evt);
	} catch (err) {
		const exception = err instanceof Error ? err : new Error(String(err));
		__errorHandler(exception, 'Obs event listener error');
	}
};

Obs.prototype._addCalcReaction = function <T>(
	this: IObs<T>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	calcReaction: IObs<any>,
	resolved: boolean,
): boolean {
	if (this === calcReaction) {
		return false;
	}

	this._calcReactions.push(calcReaction);
	// this._calcReactions.add(calcReaction);

	this._activate(resolved);

	return true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Obs.prototype._deleteCalcReaction = function <T>(this: IObs<T>, calcReaction: IObs<any>) {
	const i = arrayIndexOf(this._calcReactions, calcReaction);
	if (i >= 0) {
		this._calcReactions.splice(i, 1);
	}
	// this._calcReactions.delete(calcReaction);

	this._deactivate();
};

Obs.prototype._activate = function <T>(this: IObs<T>, resolved: boolean) {
	this._activated = true;

	// _$$calcDependencies pointer copy, because can be modified externally
	// (see __calculating._$$calcDependencies in get())
	const thisCalcDependencies = this._$$calcDependencies;

	if (this._active || !this._calc || !thisCalcDependencies) {
		return;
	}

	// let i = thisCalcDependencies.length - 1;
	// while (i >= 0) {
	// 	thisCalcDependencies[i]._addCalcReaction(this, resolved);
	// 	i--;
	// }
	const l = thisCalcDependencies.length;
	for (let i = 0; i < l; i++) {
		thisCalcDependencies[i]._addCalcReaction(this, resolved);
	}
	// for (const calcDependency of thisCalcDependencies.values()) {
	// 	calcDependency._addCalcReaction(this, resolved);
	// }

	if (resolved) {
		this._state = EnumState_resolved;
	}

	this._active = true;
};

Obs.prototype._deactivate = function <T>(this: IObs<T>) {
	if (!this._activated || this._calcReactions.length || this._eventListenersChange || this._eventListenersError) {
		return;
	}

	this._activated = false;

	if (!this._active) {
		return;
	}

	// _$$calcDependencies pointer copy, because can be modified externally
	// (see __calculating._$$calcDependencies in get())
	const thisCalcDependencies = this._$$calcDependencies;
	if (thisCalcDependencies) {
		// let i = thisCalcDependencies.length - 1;
		// while (i >= 0) {
		// 	thisCalcDependencies[i]._deleteCalcReaction(this);
		// 	i--;
		// }
		const l = thisCalcDependencies.length;
		for (let i = 0; i < l; i++) {
			thisCalcDependencies[i]._deleteCalcReaction(this);
		}
		// for (const calcDependency of thisCalcDependencies.values()) {
		// 	calcDependency._deleteCalcReaction(this);
		// }
	}

	this._state = EnumState_pending;
	this._active = false;
};

Obs.prototype._addToPending = function <T>(this: IObs<T>, dirty: boolean) {
	this._state = dirty ? EnumState_pending : EnumState_deps;

	const calcReactions = this._calcReactions;
	const l = calcReactions.length;
	if (l) {
		// let i = l - 1;
		// while (i >= 0) {
		// 	const calcReaction = calcReactions[i];
		// 	if (calcReaction._state === EnumState_resolved) {
		// 		calcReaction._addToPending(false);
		// 	}
		// 	i--;
		// }
		for (let i = 0; i < l; i++) {
			const calcReaction = calcReactions[i];
			if (calcReaction._state === EnumState_resolved) {
				calcReaction._addToPending(false);
			}
		}
		// // calcReactions.forEach((calcReaction) => {
		// // 	if (calcReaction._state === EnumState_resolved) {
		// // 		calcReaction._addToPending(false);
		// // 	}
		// // });
		// // const it = calcReactions.values();
		// // // eslint-disable-next-line @typescript-eslint/no-explicit-any
		// // let calcReaction: IObs<any> | undefined;
		// // while ((calcReaction = it.next().value)) {
		// // 	if (calcReaction._state === EnumState_resolved) {
		// // 		calcReaction._addToPending(false);
		// // 	}
		// // }
		// for (const calcReaction of calcReactions.values()) {
		// 	if (calcReaction._state === EnumState_resolved) {
		// 		calcReaction._addToPending(false);
		// 	}
		// }
	} else if (__tick) {
		if (!arrayIncludes(__pendingObs, this) && __pendingObs.push(this) === 1) {
			__tick(__resolvePending);
		}
	} else {
		// This code path is very problematic
		// (breaks reactivity perf unit tests due to circular detection)
		// => we NEED to yield the resolution of observer dependencies after the main processing loop.
		console.log('OBSERVANT NO TICK?!!');
		if (this._active) {
			this._resolve();
		}
	}
	// else {
	// 	__pendingObs.add(this);
	// 	if (__pendingObs.size === 1) {
	// 		if (__tick) {
	// 			__tick(__resolvePending);
	// 		} else {
	// 			console.log('OBSERVANT NO TICK?!!');
	// 			__resolvePending();
	// 		}
	// 	}
	// }
};

Obs.prototype._resolve = function <T>(this: IObs<T>) {
	if (this._state === EnumState_pending) {
		this._doCalc();
		return;
	}

	// _$$calcDependencies pointer copy, because can be modified externally
	// (see __calculating._$$calcDependencies in get())
	const thisCalcDependencies = this._$$calcDependencies;
	if (this._state === EnumState_deps && thisCalcDependencies) {
		const l = thisCalcDependencies.length;
		// let i = 0;
		// while (i < l) {
		// 	thisCalcDependencies[i]._resolve();

		// 	// @ts-expect-error TS2367
		// 	if (this._state === EnumState_pending) {
		// 		this._doCalc();
		// 		return;
		// 	}

		// 	i++;
		// }
		for (let i = 0; i < l; i++) {
			thisCalcDependencies[i]._resolve();

			// @ts-expect-error TS2367
			if (this._state === EnumState_pending) {
				this._doCalc();
				return;
			}
		}
		this._state = EnumState_resolved;

		// for (const calcDependency of thisCalcDependencies.values()) {
		// 	calcDependency._resolve();

		// 	// @ts-expect-error TS2367
		// 	if (this._state === EnumState_pending) {
		// 		this._doCalc();
		// 		return;
		// 	}
		// }
		// this._state = EnumState_resolved;
	}
};

Obs.prototype._doCalc = function <T>(this: IObs<T>) {
	if (!this._calc) {
		return;
	}

	if (this._calculating) {
		throw new Error(`Obs circular calculation: [${String(this._name)}]`);
	}
	this._calculating = true;

	const previousCalcDependencies = this._$$calcDependencies;
	this._$$calcDependencies = undefined;

	const previousCalcObs = __calcObs;
	// eslint-disable-next-line @typescript-eslint/no-this-alias
	__calcObs = this;

	let calculated: T | undefined;
	let errored: Error | undefined;
	try {
		calculated = this._calc();
	} catch (err) {
		const exception = err instanceof Error ? err : new Error(String(err));
		errored = __calcError = exception;
	}

	__calcObs = previousCalcObs;

	this._calculating = false;

	if (this._activated) {
		let newCalcDependenciesCount = 0;

		// _$$calcDependencies pointer copy, because can be modified externally
		// (see __calculating._$$calcDependencies in get())

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const thisCalcDependencies = this._$$calcDependencies as IObs<any>[] | undefined;
		if (thisCalcDependencies) {
			const l = thisCalcDependencies.length;
			// let i = l - 1;
			// while (i >= 0) {
			// 	const calcDependency = thisCalcDependencies[i];

			// 	if (!arrayIncludes(previousCalcDependencies, calcDependency)) {
			// 		if (calcDependency._addCalcReaction(this, false)) {
			// 			newCalcDependenciesCount++;
			// 		}
			// 	}

			// 	i--;
			// }
			for (let i = 0; i < l; i++) {
				const calcDependency = thisCalcDependencies[i];

				if (!arrayIncludes(previousCalcDependencies, calcDependency)) {
					if (calcDependency._addCalcReaction(this, false)) {
						newCalcDependenciesCount++;
					}
				}
			}
			// for (const calcDependency of thisCalcDependencies.values()) {
			// 	if (!previousCalcDependencies?.has(calcDependency)) {
			// 		if (calcDependency._addCalcReaction(this, false)) {
			// 			newCalcDependenciesCount++;
			// 		}
			// 	}
			// }
		}

		if (
			previousCalcDependencies &&
			(!thisCalcDependencies || thisCalcDependencies.length - newCalcDependenciesCount < previousCalcDependencies.length)
		) {
			const l = previousCalcDependencies.length;
			// let i = l - 1;
			// while (i >= 0) {
			// 	const previousCalcDependency = previousCalcDependencies[i];

			// 	if (!arrayIncludes(thisCalcDependencies, previousCalcDependency)) {
			// 		previousCalcDependency._deleteCalcReaction(this);
			// 	}

			// 	i--;
			// }
			for (let i = 0; i < l; i++) {
				const previousCalcDependency = previousCalcDependencies[i];

				if (!arrayIncludes(thisCalcDependencies, previousCalcDependency)) {
					previousCalcDependency._deleteCalcReaction(this);
				}
			}
			// for (const previousCalcDependency of previousCalcDependencies.values()) {
			// 	if (!thisCalcDependencies?.has(previousCalcDependency)) {
			// 		previousCalcDependency._deleteCalcReaction(this);
			// 	}
			// }
		}

		if (thisCalcDependencies) {
			this._active = true;
		} else {
			this._active = false;
			this._state = EnumState_resolved;
		}
	} else {
		this._state = this._$$calcDependencies ? EnumState_pending : EnumState_resolved;
	}

	if (typeof calculated !== 'undefined') {
		this._setCurrent(calculated);
		return;
	}

	if (errored) {
		this._initialized = true;

		if (__calcError) {
			this._setError({
				target: this,
				error: __calcError,
			});

			__errorHandler(__calcError, this._name);
		} else {
			this._setError(undefined);
		}

		if (this._active) {
			this._state = EnumState_resolved;
		}
	}
};

Obs.prototype._setCurrent = function <T>(this: IObs<T>, value: T) {
	this._initialized = true;

	if (this._error) {
		this._setError(undefined);
	}

	if (this._active) {
		this._state = EnumState_resolved;
	}

	const previous = this._current;

	const changed = !this._eq(value, previous);

	if (changed) {
		this._current = value;

		this._updateID = ++__updateID;

		const calcReactions = this._calcReactions;
		const l = calcReactions.length;
		for (let i = 0; i < l; i++) {
			calcReactions[i]._addToPending(true);
		}
		// // this._calcReactions.forEach((calcReaction) => {
		// // 	calcReaction._addToPending(true);
		// // });
		// // const it = this._calcReactions.values();
		// // // eslint-disable-next-line @typescript-eslint/no-explicit-any
		// // let calcReaction: IObs<any> | undefined;
		// // while ((calcReaction = it.next().value)) {
		// // 	calcReaction._addToPending(true);
		// // }
		// for (const calcReaction of this._calcReactions.values()) {
		// 	calcReaction._addToPending(true);
		// }

		const evt: IObsEvent<T> = {
			target: this,
			previous,
			current: value,
		};
		this._emitEventChange(evt);
	}

	return changed;
};

Obs.prototype._setError = function <T>(this: IObs<T>, evt: IObsEvent<T> | undefined) {
	if (this._lastErrorEvent === evt) {
		return;
	}
	this._lastErrorEvent = evt;

	const error = evt?.error;

	this._error = error;

	this._updateID = ++__updateID;

	if (evt) {
		this._emitEventError(evt);
	}

	const calcReactions = this._calcReactions;
	const l = calcReactions.length;
	for (let i = 0; i < l; i++) {
		calcReactions[i]._setError(evt);
	}
	// // this._calcReactions.forEach((calcReaction) => {
	// // 	calcReaction._setError(evt);
	// // });
	// // const it = this._calcReactions.values();
	// // // eslint-disable-next-line @typescript-eslint/no-explicit-any
	// // let calcReaction: IObs<any> | undefined;
	// // while ((calcReaction = it.next().value)) {
	// // 	calcReaction._setError(evt);
	// // }
	// for (const calcReaction of this._calcReactions.values()) {
	// 	calcReaction._setError(evt);
	// }
};

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
