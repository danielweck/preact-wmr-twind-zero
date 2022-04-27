// The core observable logic copied from Cellx,
// many thanks to the original developer for design a fast and memory-efficient reactive runtime:
// https://github.com/Riim/cellx
// ... but this is otherwise a significant refactoring:
// much smaller API surface (get/set, on-changed/on-error), improved typings, tweaked event emmitter, renamed things, etc.

export type NotUndefined<T> = Exclude<T, undefined>;

// export type NeverUndefinedOrFunction<T> = T extends undefined ? never : T extends Function ? never : T;
// export type NeverNullOrUndefined<T> = T extends null | undefined ? never : T;
// export type NeverUndefined<T> = T extends undefined ? never : T;

// https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
// https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask
// https://nodejs.org/api/globals.html#queuemicrotaskcallback

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TickFunc = <T extends NotUndefined<any>[]>(func: (...args: T) => unknown, ...args: T) => void;

export const tickNodeJSSetTimeout: TickFunc | undefined =
	typeof globalThis !== 'undefined' && globalThis.setTimeout
		? (func, ...args) => {
				globalThis.setTimeout(
					(argz) => {
						func(...argz);
					},
					0,
					args,
				);
		  }
		: undefined;
// console.log('DEBUG tickNodeJSSetTimeout: ', typeof tickNodeJSSetTimeout);

export const tickNodeJSQueueMicrotask: TickFunc | undefined =
	typeof globalThis !== 'undefined' && globalThis.queueMicrotask
		? (func, ...args) => {
				globalThis.queueMicrotask(() => {
					func(...args);
				});
		  }
		: undefined;
// console.log('DEBUG tickNodeJSQueueMicrotask: ', typeof tickNodeJSQueueMicrotask);

export const tickNodeJSSetImmediate: TickFunc | undefined =
	typeof globalThis !== 'undefined' && globalThis.setImmediate ? globalThis.setImmediate : undefined;
// console.log('DEBUG tickNodeJSSetImmediate: ', typeof tickNodeJSSetImmediate);

export const tickNodeJSProcessNextTick: TickFunc | undefined =
	typeof globalThis !== 'undefined' && globalThis.process?.nextTick ? globalThis.process.nextTick : undefined;
// console.log('DEBUG tickNodeJSProcessNextTick: ', typeof tickNodeJSProcessNextTick);

export const tickDOMSetTimeout: TickFunc | undefined =
	// @ts-expect-error TS2774
	typeof self !== 'undefined' && self.setTimeout
		? (func, ...args) => {
				(self as WindowOrWorkerGlobalScope).setTimeout(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(argz: any) => {
						func(...argz);
					},
					0,
					args,
				);
		  }
		: undefined;
// console.log('DEBUG tickDOMSetTimeout: ', typeof tickDOMSetTimeout);

export const tickDOMQueueMicrotask: TickFunc | undefined =
	// @ts-expect-error TS2774
	typeof self !== 'undefined' && self.queueMicrotask
		? (func, ...args) => {
				(self as WindowOrWorkerGlobalScope).queueMicrotask(() => {
					func(...args);
				});
		  }
		: undefined;
// console.log('DEBUG tickDOMQueueMicrotask: ', typeof tickDOMQueueMicrotask);

const __promise = Promise.resolve();
export const tickPromise: TickFunc = (func, ...args) => {
	// eslint-disable-next-line promise/catch-or-return,promise/always-return
	__promise.then(() => {
		func(...args);
	});
};
// console.log('DEBUG tickPromise: ', typeof tickPromise);

export const tickDefault = tickDOMQueueMicrotask ?? tickNodeJSProcessNextTick ?? tickPromise;

let __tick: TickFunc | undefined = tickDefault;
export const setTick = (func: TickFunc | undefined) => {
	// console.log('setTick', typeof func, func !== __tick);
	__tick = func;
};

let __errorHandler = (err: Error, msg?: string) => {
	console.log(msg, err);
};
export const setErrorHandler = (errorHandler: typeof __errorHandler) => {
	__errorHandler = errorHandler;
};

export interface IObsEvent<T> {
	target: IObs<T>;
	name: TObsEvent;
	data: {
		// [key: string]: any;
		previous?: T;
		current?: T;
		error?: Error;
	};
}

export type TObsListener<T> = {
	(evt: IObsEvent<T>): unknown;
};

export type TObsListenerAndThiz<T> = {
	listener: TObsListener<T>;
	// thiz: TThiz<T>;
};

export type TObsOptions<T> = {
	name?: string;
	// thiz?: TThiz<T>;
	eq?: (value1: T | undefined, value2: T | undefined) => boolean;
};

export type TObsEvent = 'change' | 'error';

type TState = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	pending: IObs<any>[];
	pendingIndex: number;
	resolvePending: () => void;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	calculating?: IObs<any>;

	calcError?: Error;

	updateCount: number;
};
const __state: TState = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	pending: [],

	pendingIndex: 0,

	resolvePending: () => {
		while (__state.pendingIndex < __state.pending.length) {
			const pendingObs = __state.pending[__state.pendingIndex++];

			if (pendingObs._active) {
				pendingObs._resolve();
			}
		}

		__state.pending.length = 0;
		__state.pendingIndex = 0;
	},

	calculating: undefined,

	calcError: undefined,

	updateCount: 0,
};

export type TObservablePrimitive = null | number | string | boolean;
export type TObservable = TObservablePrimitive | Array<TObservablePrimitive> | Record<string, unknown>;
export type TCalc<T> = () => T;

// export type TThiz<T> = Obs<T> | object;

// export type TObs<T = TObservable> = Obs<T> & IObs<T>;
// export interface IObs<T = TObservable> {
// 	_setError: (evt: IObsEvent<T> | undefined) => void;
// }
// implements IObs<T>
// export class Obs<T = TObservable> {
// 	declare set: (value: T) => void;
// 	declare get: () => T;
// 	declare on: (name: TObsEvent, listener: TObsListener<T>) => this;
// 	declare off: (name?: TObsEvent, listener?: TObsListener<T>) => this;
// 	declare dispose: () => void;
// 	declare _emit: (name: TObsEvent, data: IObsEvent<T>['data']) => void;
// 	declare _handleEvent: (evt: IObsEvent<T>) => void;
// 	declare _tryEventListener: (evtListener: TObsListenerAndThiz<T>, evt: IObsEvent<T>) => void;
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	declare _addReaction: (reaction: Obs<any>, resolved: boolean) => void;
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	declare _deleteReaction: (reaction: Obs<any>) => void;
// 	declare _activate: (resolved: boolean) => void;
// 	declare _deactivate: () => void;
// 	declare _onChange: (evt: IObsEvent<T>) => void;
// 	declare _addToPending: (dirty: boolean) => void;
// 	declare _resolve: () => void;
// 	declare _doCalc: () => void;
// 	declare _set: (value: T) => void;
// 	declare _setError: (evt: IObsEvent<T> | undefined) => void;

// 	// declare readonly _this: IObs<T>;
// 	// declare readonly _thiz: TThiz<T>;

// 	declare readonly _name?: string;

// 	declare readonly _eq: (value1: T | undefined, value2: T | undefined) => boolean;

// 	declare readonly _eventListeners: Map<TObsEvent, TObsListenerAndThiz<T> | TObsListenerAndThiz<T>[]>;

// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	declare readonly _reactions: Obs<any>[];

// 	// can be modified externally from other Observers
// 	// (see __state.calculating._$$dependencies in get())
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	declare _$$dependencies?: Obs<any>[];

// 	declare _state: 'resolved' | 'pending' | 'deps';
// 	declare _initialized: boolean;

// 	declare _current?: T;
// 	declare _calc?: TCalc<T>;

// 	declare _hasReactionsOrEventListeners: boolean;

// 	declare _active: boolean;

// 	declare _calculating: boolean;

// 	declare _updateCount: number;

// 	declare _error: Error | undefined;

// 	declare _lastErrorEvent: IObsEvent<T> | undefined;

// 	constructor(v: T | TCalc<T>, options?: TObsOptions<T>) {
// 		// this._this = this;
// 		// this._thiz = options?.thiz ?? this;

// 		this._name = options?.name ?? undefined;

// 		this._eq = options?.eq ?? Object.is; // referencial equality

// 		this._eventListeners = new Map<TObsEvent, TObsListenerAndThiz<T> | TObsListenerAndThiz<T>[]>();

// 		this._reactions = [];

// 		this._initialized = false;

// 		this._hasReactionsOrEventListeners = false;

// 		this._active = false;

// 		this._calculating = false;

// 		this._updateCount = -1;

// 		if (typeof v === 'function') {
// 			this._state = 'pending';
// 			this._calc = v as TCalc<T>;
// 		} else {
// 			this._state = 'resolved';
// 			this._current = v as T;

// 			this._initialized = true;

// 			if (v instanceof Obs) {
// 				v.on('change', this._onChange); // , this -- not this._thiz!
// 			}
// 		}
// 	}
// }

export interface IObs<T> {
	set: (value: T) => void;
	get: () => T;
	on: (name: TObsEvent, listener: TObsListener<T>) => this;
	off: (name?: TObsEvent, listener?: TObsListener<T>) => this;
	dispose: () => void;
	_emit: (name: TObsEvent, data: IObsEvent<T>['data']) => void;
	_handleEvent: (evt: IObsEvent<T>) => void;
	_tryEventListener: (evtListener: TObsListenerAndThiz<T>, evt: IObsEvent<T>) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_addReaction: (reaction: IObs<any>, resolved: boolean) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_deleteReaction: (reaction: IObs<any>) => void;
	_activate: (resolved: boolean) => void;
	_deactivate: () => void;
	_onChange: (evt: IObsEvent<T>) => void;
	_addToPending: (dirty: boolean) => void;
	_resolve: () => void;
	_doCalc: () => void;
	_set: (value: T) => void;
	_setError: (evt: IObsEvent<T> | undefined) => void;

	// _this: IObs<T>;
	// _thiz: TThiz<T>;

	_name?: string;

	_eq: (value1: T | undefined, value2: T | undefined) => boolean;

	_eventListeners: Map<TObsEvent, TObsListenerAndThiz<T> | TObsListenerAndThiz<T>[]>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_reactions: IObs<any>[];

	// can be modified externally from other Observers
	// (see __state.calculating._$$dependencies in get())
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_$$dependencies?: IObs<any>[];

	_state: 'resolved' | 'pending' | 'deps';
	_initialized: boolean;

	_current?: T;
	_calc?: TCalc<T>;

	_hasReactionsOrEventListeners: boolean;

	_active: boolean;

	_calculating: boolean;

	_updateCount: number;

	_error: Error | undefined;

	_lastErrorEvent: IObsEvent<T> | undefined;
}
export interface ObsConstructor<T> {
	new (v: T | TCalc<T>, options?: TObsOptions<T>): IObs<T>;
	(v: T | TCalc<T>, options?: TObsOptions<T>): IObs<T>;
	// (): void;
}
export const Obs = function <T>(this: IObs<T>, v: T | TCalc<T>, options?: TObsOptions<T>) {
	if (
		typeof this === 'undefined' ||
		typeof this.constructor === 'undefined' ||
		(typeof Window !== 'undefined' && this.constructor === Window)
	) {
		return new Obs(v, options);
	}

	// this._this = this;
	// this._thiz = options?.thiz ?? this;

	this._name = options?.name ?? undefined;

	this._eq = options?.eq ?? Object.is; // referencial equality

	this._eventListeners = new Map<TObsEvent, TObsListenerAndThiz<T> | TObsListenerAndThiz<T>[]>();

	this._reactions = [];

	this._initialized = false;

	this._hasReactionsOrEventListeners = false;

	this._active = false;

	this._calculating = false;

	this._updateCount = -1;

	if (typeof v === 'function') {
		this._state = 'pending';
		this._calc = v as TCalc<T>;
	} else {
		this._state = 'resolved';
		this._current = v as T;

		this._initialized = true;

		if (v instanceof Obs) {
			v.on('change', this._onChange); // , this -- not this._thiz!
		}
	}
	return this;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as ObsConstructor<any>;

Obs.prototype.get = function <T>(this: IObs<T>): T {
	if (this._state !== 'resolved' && this._updateCount !== __state.updateCount) {
		this._resolve();
	}

	if (__state.calculating) {
		if (!__state.calculating._$$dependencies) {
			__state.calculating._$$dependencies = [this];
		} else if (!__state.calculating._$$dependencies.includes(this)) {
			__state.calculating._$$dependencies.push(this);
		}
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

	this._set(value);

	return this;
};

// , thiz?: TThiz<T>
Obs.prototype.on = function <T>(this: IObs<T>, name: TObsEvent, listener: TObsListener<T>): IObs<T> {
	if (this._$$dependencies) {
		this._resolve();
	}

	const eventListeners = this._eventListeners.get(name);

	// const that = thiz ? thiz : this._thiz;
	// , thiz: that
	const evt: TObsListenerAndThiz<T> = { listener };

	if (!eventListeners) {
		this._eventListeners.set(name, evt);
	} else if (Array.isArray(eventListeners)) {
		eventListeners.push(evt);
	} else {
		this._eventListeners.set(name, [eventListeners, evt]);
	}

	this._activate(true);

	return this;
};

// , thiz?: TThiz<T>
Obs.prototype.off = function <T>(this: IObs<T>, name?: TObsEvent, listener?: TObsListener<T>): IObs<T> {
	if (this._$$dependencies) {
		this._resolve();
	}

	if (name && listener) {
		// const that = thiz ? thiz : this._thiz;
		const eventListeners = this._eventListeners.get(name);
		if (eventListeners) {
			let evt: TObsListenerAndThiz<T> | undefined;
			let skipDelete = false;
			if (!Array.isArray(eventListeners)) {
				evt = eventListeners;
			} else if (eventListeners.length === 1) {
				evt = eventListeners[0];
			} else {
				for (let i = eventListeners.length; i; ) {
					evt = eventListeners[--i];

					//  && evt.thiz === that
					if (evt.listener === listener) {
						eventListeners.splice(i, 1);
						// break; possible multiple listeners!
					}
				}
				skipDelete = true;
			}

			//  && evt.thiz === that
			if (!skipDelete && evt && evt.listener === listener) {
				this._eventListeners.delete(name);
			}
		}
	} else {
		this._eventListeners.clear();
	}

	this._deactivate();

	return this;
};

Obs.prototype.dispose = function <T>(this: IObs<T>) {
	this.off();

	const reactions = this._reactions;
	for (let i = 0; i < reactions.length; i++) {
		reactions[i].dispose();
	}
	// for (const reaction of this._reactions) {
	// 	reaction.dispose();
	// }

	return this;
};

Obs.prototype._emit = function <T>(this: IObs<T>, name: TObsEvent, data: IObsEvent<T>['data']) {
	const evt: IObsEvent<T> = {
		target: this,
		name,
		data,
	};

	this._handleEvent(evt);

	return evt;
};

Obs.prototype._handleEvent = function <T>(this: IObs<T>, evt: IObsEvent<T>) {
	let eventListeners = this._eventListeners.get(evt.name);
	if (!eventListeners) {
		return;
	}

	if (Array.isArray(eventListeners)) {
		if (eventListeners.length === 1) {
			this._tryEventListener(eventListeners[0], evt);
		} else {
			eventListeners = eventListeners.slice();
			for (let i = 0; i < eventListeners.length; i++) {
				this._tryEventListener(eventListeners[i], evt);
			}
		}
	} else {
		this._tryEventListener(eventListeners, evt);
	}
};

Obs.prototype._tryEventListener = function <T>(this: IObs<T>, evtListener: TObsListenerAndThiz<T>, evt: IObsEvent<T>) {
	try {
		// evtListener.listener.call(evtListener.thiz, evt);
		evtListener.listener(evt);
	} catch (err) {
		const exception = err instanceof Error ? err : new Error(String(err));
		__errorHandler(exception, `Obs event listener error: [${evt.name}]`);
	}
};

Obs.prototype._addReaction = function <T>(
	this: IObs<T>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reaction: IObs<any>,
	resolved: boolean,
) {
	this._reactions.push(reaction);

	this._activate(resolved);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
Obs.prototype._deleteReaction = function <T>(this: IObs<T>, reaction: IObs<any>) {
	this._reactions.splice(this._reactions.indexOf(reaction), 1);

	this._deactivate();
};

Obs.prototype._activate = function <T>(this: IObs<T>, resolved: boolean) {
	this._hasReactionsOrEventListeners = true;

	if (this._active || !this._calc) {
		return;
	}

	if (this._$$dependencies) {
		// _$$dependencies pointer copy, because can be modified externally
		// (see __state.calculating._$$dependencies in get())
		const thisDependencies = this._$$dependencies;
		let i = thisDependencies.length;
		do {
			thisDependencies[--i]._addReaction(this, resolved);
		} while (i);

		if (resolved) {
			this._state = 'resolved';
		}

		this._active = true;
	}
};

Obs.prototype._deactivate = function <T>(this: IObs<T>) {
	if (
		!this._hasReactionsOrEventListeners ||
		this._reactions.length ||
		this._eventListeners.has('change') ||
		this._eventListeners.has('error')
	) {
		return;
	}

	this._hasReactionsOrEventListeners = false;

	if (!this._active) {
		return;
	}

	if (this._$$dependencies) {
		// _$$dependencies pointer copy, because can be modified externally
		// (see __state.calculating._$$dependencies in get())
		const thisDependencies = this._$$dependencies;
		let i = thisDependencies.length;
		do {
			thisDependencies[--i]._deleteReaction(this);
		} while (i);
	}

	this._state = 'pending';
	this._active = false;
};

Obs.prototype._onChange = function <T>(this: IObs<T>, evt: IObsEvent<T>) {
	this._initialized = true;

	this._updateCount = ++__state.updateCount;

	const reactions = this._reactions;
	for (let i = 0; i < reactions.length; i++) {
		reactions[i]._addToPending(true);
	}
	// for (const reaction of this._reactions) {
	// 	reaction._addToPending(true);
	// }

	this._handleEvent(evt);
};

Obs.prototype._addToPending = function <T>(this: IObs<T>, dirty: boolean) {
	this._state = dirty ? 'pending' : 'deps';

	let i = this._reactions.length;
	if (i) {
		do {
			if (this._reactions[--i]._state === 'resolved') {
				this._reactions[i]._addToPending(false);
			}
		} while (i);
	} else if (__state.pending.push(this) === 1) {
		if (__tick) {
			__tick(__state.resolvePending);
		} else {
			console.log('OBSERVANT NO TICK?!!');
			__state.resolvePending();
		}
	}
};

Obs.prototype._resolve = function <T>(this: IObs<T>) {
	if (this._state === 'pending') {
		this._doCalc();
		return;
	}
	if (this._state === 'deps' && this._$$dependencies) {
		// _$$dependencies pointer copy, because can be modified externally
		// (see __state.calculating._$$dependencies in get())
		const thisDependencies = this._$$dependencies;
		for (let i = 0; ; ) {
			thisDependencies[i]._resolve();

			// @ts-expect-error TS2367
			if (this._state === 'pending') {
				this._doCalc();
				break;
			}

			if (++i === thisDependencies.length) {
				this._state = 'resolved';
				break;
			}
		}
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

	const previousDependencies = this._$$dependencies;
	this._$$dependencies = undefined;

	const previousCalculating = __state.calculating;
	// eslint-disable-next-line @typescript-eslint/no-this-alias
	__state.calculating = this;

	let calculated: T | undefined;
	let errored: Error | undefined;
	try {
		// calculated = this._calc.call(this._thiz);
		calculated = this._calc();
	} catch (err) {
		const exception = err instanceof Error ? err : new Error(String(err));
		__state.calcError = exception;
		errored = __state.calcError;
	}

	__state.calculating = previousCalculating;

	this._calculating = false;

	if (this._hasReactionsOrEventListeners) {
		let newDependenciesCount = 0;

		// _$$dependencies pointer copy, because can be modified externally
		// (see __state.calculating._$$dependencies in get())

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const thisDependencies = this._$$dependencies as IObs<any>[] | undefined;
		// the above type coersion is necessary because of preceeding this._$$dependencies = undefined
		if (thisDependencies) {
			let i = thisDependencies.length;
			do {
				const dependency = thisDependencies[--i];

				if (!previousDependencies?.includes(dependency)) {
					dependency._addReaction(this, false);
					newDependenciesCount++;
				}
			} while (i);
		}

		if (
			previousDependencies &&
			(!thisDependencies || thisDependencies.length - newDependenciesCount < previousDependencies.length)
		) {
			let i = previousDependencies.length;
			do {
				const previousDependency = previousDependencies[--i];

				if (!thisDependencies?.includes(previousDependency)) {
					previousDependency._deleteReaction(this);
				}
			} while (i);
			// for (let i = previousDependencies.length; i; ) {
			// 	i--;

			// 	if (!thisDependencies_?.includes(previousDependencies[i])) {
			// 		previousDependencies[i]._deleteReaction(this);
			// 	}
			// }
		}

		// this._$$dependencies
		if (thisDependencies) {
			this._active = true;
		} else {
			this._active = false;
			this._state = 'resolved';
		}
	} else {
		this._state = this._$$dependencies ? 'pending' : 'resolved';
	}

	if (typeof calculated !== 'undefined') {
		this._set(calculated);
		return;
	}

	if (errored) {
		this._initialized = true;

		if (__state.calcError) {
			this._setError({
				target: this,
				name: 'error',
				data: {
					error: __state.calcError,
				},
			});

			__errorHandler(__state.calcError, this._name);
		} else {
			this._setError(undefined);
		}

		if (this._active) {
			this._state = 'resolved';
		}
	}
};

Obs.prototype._set = function <T>(this: IObs<T>, value: T) {
	this._initialized = true;

	const error = this._error;
	if (error) {
		this._setError(undefined);
	}

	const previous = this._current;
	const changed = !this._eq(value, previous);

	if (changed) {
		this._current = value;

		if (previous instanceof Obs) {
			previous.off('change', this._onChange); // , this
		}
		if (value instanceof Obs) {
			value.on('change', this._onChange); // , this
		}
	}

	if (this._active) {
		this._state = 'resolved';
	}

	this._updateCount = ++__state.updateCount;

	if (changed) {
		const reactions = this._reactions;
		for (let i = 0; i < reactions.length; i++) {
			reactions[i]._addToPending(true);
		}
		// for (const reaction of this._reactions) {
		// 	reaction._addToPending(true);
		// }

		this._emit('change', {
			previous,
			current: value,
		});
	}

	return changed;
};

Obs.prototype._setError = function <T>(this: IObs<T>, evt: IObsEvent<T> | undefined) {
	if (this._lastErrorEvent === evt) {
		return;
	}
	this._lastErrorEvent = evt;

	const error = evt?.data.error;

	this._error = error;

	this._updateCount = ++__state.updateCount;
	if (evt) {
		this._handleEvent(evt);
	}

	const reactions = this._reactions;
	for (let i = 0; i < reactions.length; i++) {
		reactions[i]._setError(evt);
	}
	// for (const reaction of this._reactions) {
	// 	reaction._setError(evt);
	// }
};

export const obs = <T>(v: T | TCalc<T>, options?: TObsOptions<T>) => new Obs(v, options);

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
