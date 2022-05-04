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
// 	// target: TObs;
// 	previous?: T;
// 	current?: T;
// 	error?: Error;
// };
// export type TObsEventListener<T> = (evt: TObsEventPayload<T>) => void;
export type TObsEventListenerChange<T> = (current: T, previous: T | undefined) => void;
export type TObsEventListenerError = (error: Error) => void;
export type TObsEventListener<T> = TObsEventListenerChange<T> | TObsEventListenerError;
export type TObsEventListeners<T> = TObsEventListener<T> | TObsEventListener<T>[] | undefined;
export type TObsEventListenersChange<T> = TObsEventListenerChange<T> | TObsEventListenerChange<T>[] | undefined;
export type TObsEventListenersError = TObsEventListenerError | TObsEventListenerError[] | undefined;
const ObsEventChange = '0';
const ObsEventError = '1';
export type TObsEventTypes = typeof ObsEventChange | typeof ObsEventError;
export type TObsEventListenersMap<T> = {
	[ObsEventChange]: TObsEventListenersChange<T>;
	[ObsEventError]: TObsEventListenersError;
};

export type TObsPrimitive = null | number | string | boolean;
export type TObserved = TObsPrimitive | Array<TObsPrimitive> | Record<string, unknown>;
export type TObsDeriveFunc<T> = (currentValue: T | undefined) => T;

// export interface TObs {
// 	get: () => T;
// 	peek: () => T | undefined;
// 	set: (value: T | ((currentValue: T | undefined) => T)) => this;

// 	dispose: () => this;

// 	onChange: (listener: TObsEventListenerChange<T>) => () => this;
// 	onError: (listener: TObsEventListenerError) => () => this;

// 	autoRun: () => void;
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type TObs<_T> = {
	// noop
};

// interface IObsInternal<T> extends TObs {
interface IObsInternal<T> {
	_eventListeners: TObsEventListenersMap<T>;
	// _onEvent: (key: TObsEventTypes, listener: TObsEventListener<T>) => () => this;
	// _offEvent: (key?: TObsEventTypes, listener?: TObsEventListener<T>) => this;
	// _emitEvent: (key: TObsEventTypes, current: T | undefined, previous: T | undefined, error: Error | undefined) => void;

	_eq?: (value1: T | undefined, value2: T | undefined) => boolean;

	_currentValue?: T;
	// _setCurrentValue: (value: T) => void;

	_state: typeof STATE_RESOLVED | typeof STATE_DIRTY | typeof STATE_DIRTY_CHILDREN;
	_initializedWithValueOrError: boolean;

	_inQueueOfRoots: boolean;
	// _climbParentDependentsToFeedQueueOfRootObsToResolve: (dirty: boolean) => void;
	// _resolve: () => void;

	_deriveFunc?: TObsDeriveFunc<T>;
	// _callDeriveFunc: () => void;
	_isDeriving: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_parentDependents?: Array<IObsInternal<any>>;
	// // eslint-disable-next-line @typescript-eslint/no-explicit-any
	// _registerParentDependentDeep: (parentDependent: IObsInternal<any>, resolved: boolean) => void;
	// // eslint-disable-next-line @typescript-eslint/no-explicit-any
	// _unregisterParentDependentDeep: (parentDependent: IObsInternal<any>) => void;

	_hasParentDependentsOrEventListeners: boolean;
	// _doActivate: (resolved: boolean) => void;
	// _checkDeactivate: () => void;

	_activatedParentDependentsAfterDeep: boolean;
	// _registerParentDependentsOnChildrenDependencies: (resolved: boolean) => void;
	// _unregisterParentDependentsOnChildrenDependencies: () => void;

	// can be modified locally from _callDeriveFunc(thiz, )
	// and externally from currentDeriveObs._childDependencies in get()
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_childDependencies?: Array<IObsInternal<any>>;

	_idOfUpdateWithValueOrError: number;

	// _setErrorHereAndClimbParentDependents: (error: Error | undefined) => void;
	_resolvedError?: Error;
}

export type TObsOptions<T> = {
	autoRun?: boolean;
	eq?: (value1: T | undefined, value2: T | undefined) => boolean;
};

// interface IObsConstructor<T> extends TObs {
// 	new (v: T | TObsDeriveFunc<T>, options?: TObsOptions<T>): TObs;
// 	(v: T | TObsDeriveFunc<T>, options?: TObsOptions<T>): TObs;
// }

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
export const logError = (errorHandler: typeof currentErrorHandler) => {
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
			_resolve(obs);
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

// export const obs = <T = TObserved>(v: T | TObsDeriveFunc<T>, options?: TObsOptions<T>) =>
// 	new (Obs as IObsConstructor<T>)(v, options);

const O = Object.freeze(
	Object.assign(Object.create(null), {
		_eq: undefined,
		_eventListeners: undefined,
		_parentDependents: undefined,
		_childDependencies: undefined,
		_hasParentDependentsOrEventListeners: false,
		_activatedParentDependentsAfterDeep: false,
		_inQueueOfRoots: false,
		_isDeriving: false,
		_idOfUpdateWithValueOrError: -1,
		_resolvedError: undefined,
		_state: STATE_DIRTY,
		_currentValue: undefined,
		_deriveFunc: undefined,
		_initializedWithValueOrError: false,
	}),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as IObsInternal<any>;

const E = Object.freeze(
	Object.assign(Object.create(null), {
		[ObsEventChange]: undefined,
		[ObsEventError]: undefined,
	}),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as TObsEventListenersMap<any>;

export const obs = function <T = TObserved>( // extends
	// thiz: IObsInternal<T>,
	v: T | TObsDeriveFunc<T>,
	options?: TObsOptions<T>,
): TObs<T> {
	// if (
	// 	typeof this === 'undefined' ||
	// 	typeof thiz.constructor === 'undefined' ||
	// 	(typeof Window !== 'undefined' && thiz.constructor === Window)
	// ) {
	// 	return new Obs(v, options);
	// }

	// const thiz = {} as IObsInternal<T>;
	// const thiz = Object.create(null) as IObsInternal<T>;
	// const thiz = Object.create(Object.prototype) as IObsInternal<T>;
	const thiz = Object.seal(Object.assign({}, O)) as IObsInternal<T>;
	// const thiz = Object.seal({...O}) as IObsInternal<T>;

	thiz._eq = options?.eq; // ?? Object.is; // referencial === equality

	thiz._eventListeners = Object.seal(Object.assign({}, E)) as TObsEventListenersMap<T>;

	// thiz._parentDependents = undefined;
	// thiz._childDependencies = undefined;

	// thiz._hasParentDependentsOrEventListeners = false;
	// thiz._activatedParentDependentsAfterDeep = false;

	// thiz._inQueueOfRoots = false;

	// thiz._isDeriving = false;

	// thiz._idOfUpdateWithValueOrError = -1;

	// thiz._resolvedError = undefined;

	if (typeof v === 'function') {
		thiz._state = STATE_DIRTY;

		thiz._currentValue = undefined;
		thiz._deriveFunc = v as TObsDeriveFunc<T>;

		thiz._initializedWithValueOrError = false;
	} else {
		thiz._state = STATE_RESOLVED;

		thiz._currentValue = v as T;
		thiz._deriveFunc = undefined;

		thiz._initializedWithValueOrError = true;
	}

	if (options?.autoRun) {
		autoRun(thiz);
	}

	// return Object.seal(thiz);
	return thiz;
};

// ----------------
// </OBSERVANT WRAP CONSTRUCTOR>
// ----------------

// ----------------
// <OBSERVANT PUBLICS>
// ----------------

export const get = function <T>(thiz: TObs<T>): T {
	const that = thiz as IObsInternal<T>;

	if (that._state !== STATE_RESOLVED && that._idOfUpdateWithValueOrError !== lastIdOfUpdateWithValueOrError) {
		// STATE_DIRTY || STATE_DIRTY_CHILDREN
		_resolve(that);
	}

	if (currentDeriveObs && currentDeriveObs !== that) {
		if (!currentDeriveObs._childDependencies) {
			currentDeriveObs._childDependencies = [that];
		} else if (!arrayIncludes(currentDeriveObs._childDependencies, thiz)) {
			currentDeriveObs._childDependencies.push(that);
		}
	}

	if (that._resolvedError) {
		throw that._resolvedError;
	}

	// guaranteed defined, because _resolve(that) sets thiz._currentValue or sets thiz._resolvedError (which bails out in the conditional above)
	return that._currentValue as T;
};

export const peek = function <T>(thiz: TObs<T>): T | undefined {
	const that = thiz as IObsInternal<T>;

	if (that._resolvedError) {
		throw that._resolvedError;
	}
	return that._currentValue;
};

export const set = function <T>(thiz: TObs<T>, value: T | ((currentValue: T | undefined) => T)): TObs<T> {
	const that = thiz as IObsInternal<T>;

	if (!that._initializedWithValueOrError && that._deriveFunc) {
		_callDeriveFunc(that);
	}

	if (typeof value === 'function') {
		// eslint-disable-next-line @typescript-eslint/ban-types
		_setCurrentValue(that, (value as Function)(that._currentValue));
	} else {
		_setCurrentValue(that, value);
	}

	return that;
};

export const dispose = function <T>(thiz: TObs<T>) {
	const that = thiz as IObsInternal<T>;

	_offEvent(that);

	if (that._parentDependents) {
		let i = that._parentDependents.length;
		while (i !== 0) {
			dispose(that._parentDependents[--i]);
		}
	}
};

export const onChange = function <T>(thiz: TObs<T>, listener: TObsEventListenerChange<T>): () => TObs<T> {
	const that = thiz as IObsInternal<T>;
	return _onEvent(that, ObsEventChange, listener);
};

export const onError = function <T>(thiz: TObs<T>, listener: TObsEventListenerError): () => TObs<T> {
	const that = thiz as IObsInternal<T>;
	return _onEvent(that, ObsEventError, listener);
};

export const autoRun = function <T>(thiz: TObs<T>): void {
	const that = thiz as IObsInternal<T>;

	if (that._childDependencies) {
		_resolve(that);
	}

	_doActivate(that, true);

	get(that);
};

// ----------------
// </OBSERVANT PUBLICS>
// ----------------

// ----------------
// <OBSERVANT INTERNALS>
// ----------------

const _doActivate = function <T>(thiz: IObsInternal<T>, resolved: boolean) {
	thiz._hasParentDependentsOrEventListeners = true;
	_registerParentDependentsOnChildrenDependencies(thiz, resolved);
};

const _checkDeactivate = function <T>(thiz: IObsInternal<T>) {
	if (
		thiz._hasParentDependentsOrEventListeners &&
		!thiz._parentDependents?.length &&
		(!thiz._eventListeners[ObsEventChange] ||
			(Array.isArray(thiz._eventListeners[ObsEventChange]) &&
				(thiz._eventListeners[ObsEventChange] as []).length === 0)) &&
		(!thiz._eventListeners[ObsEventError] ||
			(Array.isArray(thiz._eventListeners[ObsEventError]) && (thiz._eventListeners[ObsEventError] as []).length === 0))
	) {
		thiz._hasParentDependentsOrEventListeners = false;
		_unregisterParentDependentsOnChildrenDependencies(thiz);
	}
};

const _onEvent = function <T>(
	thiz: IObsInternal<T>,
	key: TObsEventTypes,
	listener: TObsEventListener<T>,
): () => TObs<T> {
	if (thiz._childDependencies) {
		_resolve(thiz);
	}

	const listeners = thiz._eventListeners[key];
	if (!listeners) {
		// @ts-expect-error TS2322
		thiz._eventListeners[key] = listener;
	} else if (Array.isArray(listeners)) {
		if (!arrayIncludes(listeners, listener)) {
			// @ts-expect-error TS2345
			listeners.push(listener);
		}
	} else if (listeners !== listener) {
		// @ts-expect-error TS2322
		thiz._eventListeners[key] = [listeners, listener];
	}

	_doActivate(thiz, true);

	return () => _offEvent(thiz, key, listener);
};

const _offEvent = function <T>(thiz: IObsInternal<T>, key?: TObsEventTypes, listener?: TObsEventListener<T>): TObs<T> {
	if (thiz._childDependencies) {
		_resolve(thiz);
	}

	if (listener && key) {
		const listeners = thiz._eventListeners[key];
		if (listeners) {
			if (!Array.isArray(listeners)) {
				if (listeners === listener) {
					thiz._eventListeners[key] = undefined;
				}
			} else {
				let i = listeners.length;
				if (i === 1) {
					if (listeners[0] === listener) {
						thiz._eventListeners[key] = undefined;
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
		thiz._eventListeners[key] = undefined;
	} else {
		thiz._eventListeners[ObsEventChange] = undefined;
		thiz._eventListeners[ObsEventError] = undefined;
	}

	_checkDeactivate(thiz);
	return thiz;
};

const _emitEvent = function <T>(
	thiz: IObsInternal<T>,
	key: TObsEventTypes,
	current: T | undefined,
	previous: T | undefined,
	error: Error | undefined,
) {
	const listeners = thiz._eventListeners[key];
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

const _registerParentDependentDeep = function <T>(
	thiz: IObsInternal<T>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	parentDependent: IObsInternal<any>,
	resolved: boolean,
) {
	if (thiz !== parentDependent) {
		if (thiz._parentDependents) {
			thiz._parentDependents.push(parentDependent);
		} else {
			thiz._parentDependents = [parentDependent];
		}
	}

	_doActivate(thiz, resolved);
};

const _registerParentDependentsOnChildrenDependencies = function <T>(thiz: IObsInternal<T>, resolved: boolean) {
	let i = thiz._childDependencies ? thiz._childDependencies.length : 0;

	if (thiz._activatedParentDependentsAfterDeep || !thiz._deriveFunc || i === 0) {
		return;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let dep: IObsInternal<any> | undefined;
	while (i !== 0 && (dep = thiz._childDependencies?.[--i])) {
		_registerParentDependentDeep(dep, thiz, resolved);
	}

	if (resolved) {
		thiz._state = STATE_RESOLVED;
	}

	thiz._activatedParentDependentsAfterDeep = true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _unregisterParentDependentDeep = function <T>(thiz: IObsInternal<T>, parentDependent: TObs<T>) {
	let i = thiz._parentDependents ? thiz._parentDependents.length : 0;
	if (i === 0) {
		return;
	}
	if (i === 1) {
		thiz._parentDependents = undefined;
	} else {
		while (i !== 0) {
			if (thiz._parentDependents?.[--i] === parentDependent) {
				thiz._parentDependents?.splice(i, 1);
				break;
			}
		}
	}

	_checkDeactivate(thiz);
};

const _unregisterParentDependentsOnChildrenDependencies = function <T>(thiz: IObsInternal<T>) {
	if (!thiz._activatedParentDependentsAfterDeep) {
		return;
	}

	let i = thiz._childDependencies ? thiz._childDependencies.length : 0;
	let dep: IObsInternal<T> | undefined;
	while (i !== 0 && (dep = thiz._childDependencies?.[--i])) {
		_unregisterParentDependentDeep(thiz, dep);
	}

	thiz._state = STATE_DIRTY;

	thiz._activatedParentDependentsAfterDeep = false;
};

const _climbParentDependentsToFeedQueueOfRootObsToResolve = function <T>(thiz: IObsInternal<T>, dirty: boolean) {
	thiz._state = dirty ? STATE_DIRTY : STATE_DIRTY_CHILDREN;
	let i = thiz._parentDependents ? thiz._parentDependents.length : 0;
	if (i !== 0) {
		while (i !== 0) {
			const parentDependent = thiz._parentDependents?.[--i];
			if (parentDependent?._state === STATE_RESOLVED) {
				_climbParentDependentsToFeedQueueOfRootObsToResolve(parentDependent, false);
			}
		}
		// !arrayIncludes(queueOfRootObsToResolve, thiz)
	} else if (!thiz._inQueueOfRoots) {
		thiz._inQueueOfRoots = true;
		i = queueOfRootObsToResolve.push(thiz);
		if (i === 1) {
			tickFunc(flushQueueOfRootObsToResolve);
		}
	}
};

const _resolve = function <T>(thiz: IObsInternal<T>) {
	if (thiz._state === STATE_RESOLVED) {
		return;
	}

	if (thiz._state === STATE_DIRTY) {
		if (thiz._deriveFunc) {
			_callDeriveFunc(thiz);
		}
		return;
	}

	// STATE_DIRTY_CHILDREN

	let i = thiz._childDependencies ? thiz._childDependencies.length : 0;
	let dep: IObsInternal<T> | undefined;
	while (i !== 0 && (dep = thiz._childDependencies?.[--i])) {
		_resolve(dep);

		// @ts-expect-error TS2367
		if (thiz._state === STATE_DIRTY) {
			if (thiz._deriveFunc) {
				_callDeriveFunc(thiz);
			}
			return;
		}
	}

	thiz._state = STATE_RESOLVED;
};

const _callDeriveFunc = function <T>(thiz: IObsInternal<T>) {
	if (!thiz._deriveFunc) {
		return;
	}

	if (thiz._isDeriving) {
		throw new Error('Circular!');
	}
	thiz._isDeriving = true;

	const previousDeriveObs = currentDeriveObs;
	// eslint-disable-next-line @typescript-eslint/no-this-alias
	currentDeriveObs = thiz;

	const previousChildDependencies = thiz._childDependencies;
	thiz._childDependencies = undefined as IObsInternal<T>['_childDependencies'];

	let derivedValue: T | undefined;
	let deriveError: Error | undefined;
	try {
		derivedValue = thiz._deriveFunc(thiz._currentValue); // peek(thiz, ) without the possible previous error
	} catch (err) {
		deriveError = currentDeriveError = ensureErrorType(err);
	}

	currentDeriveObs = previousDeriveObs;

	thiz._isDeriving = false;

	if (thiz._hasParentDependentsOrEventListeners) {
		let newChildDependenciesCount = 0;

		let i = thiz._childDependencies ? thiz._childDependencies.length : 0;
		while (i !== 0) {
			const childDependency = thiz._childDependencies?.[--i];

			if (childDependency && !arrayIncludes(previousChildDependencies, childDependency)) {
				_registerParentDependentDeep(childDependency, thiz, false);
				newChildDependenciesCount++;
			}
		}

		i = thiz._childDependencies ? thiz._childDependencies.length : 0;
		let iPrev = previousChildDependencies ? previousChildDependencies.length : 0;
		if (iPrev !== 0 && (i === 0 || i - newChildDependenciesCount < iPrev)) {
			while (iPrev !== 0) {
				const previousChildDependency = previousChildDependencies?.[--iPrev];

				if (previousChildDependency && (i === 0 || !arrayIncludes(thiz._childDependencies, previousChildDependency))) {
					_unregisterParentDependentDeep(previousChildDependency, thiz);
				}
			}
		}

		if (i !== 0) {
			thiz._activatedParentDependentsAfterDeep = true;
		} else {
			thiz._activatedParentDependentsAfterDeep = false;
			thiz._state = STATE_RESOLVED;
		}
	} else {
		thiz._state = thiz._childDependencies ? STATE_DIRTY : STATE_RESOLVED;
	}

	if (typeof derivedValue !== 'undefined') {
		_setCurrentValue(thiz, derivedValue);
		return;
	}

	if (deriveError) {
		thiz._initializedWithValueOrError = true;

		if (currentDeriveError) {
			_setErrorHereAndClimbParentDependents(thiz, currentDeriveError);

			currentErrorHandler(currentDeriveError);
		} else {
			_setErrorHereAndClimbParentDependents(thiz, undefined);
		}

		if (thiz._activatedParentDependentsAfterDeep) {
			thiz._state = STATE_RESOLVED;
		}
	}
};

const _setCurrentValue = function <T>(thiz: IObsInternal<T>, newValue: T) {
	thiz._initializedWithValueOrError = true;

	if (thiz._resolvedError) {
		_setErrorHereAndClimbParentDependents(thiz, undefined);
	}

	if (thiz._activatedParentDependentsAfterDeep) {
		thiz._state = STATE_RESOLVED;
	}

	thiz._idOfUpdateWithValueOrError = ++lastIdOfUpdateWithValueOrError;

	const previousValue = thiz._currentValue;
	const changed = thiz._eq ? !thiz._eq(newValue, previousValue) : newValue !== previousValue;
	if (changed) {
		thiz._currentValue = newValue;

		let i = thiz._parentDependents ? thiz._parentDependents.length : 0;
		let dep: IObsInternal<T> | undefined;
		while (i !== 0 && (dep = thiz._parentDependents?.[--i])) {
			_climbParentDependentsToFeedQueueOfRootObsToResolve(dep, true);
		}

		_emitEvent(thiz, ObsEventChange, newValue, previousValue, undefined);
	}

	return changed;
};

const _setErrorHereAndClimbParentDependents = function <T>(thiz: IObsInternal<T>, error: Error | undefined) {
	if (thiz._resolvedError === error) {
		return;
	}
	thiz._resolvedError = error;

	thiz._idOfUpdateWithValueOrError = ++lastIdOfUpdateWithValueOrError;

	if (error) {
		_emitEvent(thiz, ObsEventError, undefined, undefined, error);
	}

	let i = thiz._parentDependents ? thiz._parentDependents.length : 0;
	let dep: IObsInternal<T> | undefined;
	while (i !== 0 && (dep = thiz._parentDependents?.[--i])) {
		_setErrorHereAndClimbParentDependents(dep, error);
	}
};

// Object.freeze(Obs.prototype);

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
// const MySet = Object.seal(function <T extends TObs<TObserved>>(thiz: IMySet<T>) {
// 	if (
// 		typeof this === 'undefined' ||
// 		typeof thiz.constructor === 'undefined' ||
// 		(typeof Window !== 'undefined' && thiz.constructor === Window)
// 	) {
// 		return new MySet();
// 	}

// 	thiz.data = new Set();

// 	return thiz;
// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// }) as MySetConstructor<any>;
// MySet.prototype.has = function <T>(thiz: IMySet<T>, v: T): boolean {
// 	return thiz.data.has(v);
// };
// MySet.prototype.add = function <T>(thiz: IMySet<T>, v: T): void {
// 	thiz.data.add(v);
// };
// MySet.prototype.delete = function <T>(thiz: IMySet<T>, v: T): void {
// 	thiz.data.delete(v);
// };
// MySet.prototype.clear = function <T>(thiz: IMySet<T>): void {
// 	thiz.data.clear();
// };
// export const setTick = (func: TObsTick | undefined) => {
// 	tickFunc = func;
// };

// const isChrome = typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.match(/chrome|edg\//i);
// console.log(`isChrome: ${isChrome}`);

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// return (self as any).noseal ? this : Object.seal(thiz);

// const obj = {
// 	change: undefined,
// 	error: undefined,
// };
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// thiz._eventListeners = (self as any).noseal ? obj : Object.seal(obj);
