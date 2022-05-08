// The core 'observable' logic / algorithm implemented in this single-file lib was copied from Cellx:
// https://github.com/Riim/cellx
// Many thanks to the original developer for designing a fast and memory-efficient reactive runtime!
//
// This lib improves the performance of the already-mighty-quick Cellx reactive core,
// as benchmarked in all 3 major web browsers (Safari, Chrome, Firefox).
// This is the result of a significant refactoring from Cellx's original source code:
// - Smaller API surface (in a nutshell: observable factory/constructor, get, set, on-changed, on-error, off ... and that's about it!)
// - Tighter TypeScript typings (no 'any's!)
// - Inlined and simplified internal event emmitter
// - Several key micro-optimisations (e.g. class vs. prototype, array vs. set, for vs. while / forward vs. reverse loops, etc. etc.)
// - Many renamed things!

// https://mermaid-js.github.io/mermaid/#/flowchart
// https://mermaid.live/view#pako:eNqdVV1v2jAU_StRpEqZ1E44EL6kVuqAatMeWBnaS5iQG98Qq4mNHIdpKv3vs_NpkpSH8QI5Pvf4fpwb3uyAE7DndhjzP0GEhbS2X3bMUp-bG0oGjh9kQgCTKyG4-IoZiUH8_lQwKEGOv_22-D63wjhLo-cMMliHG87l-iXd8g2kPD5BQ3cdf09A0BMsAY4NPnT8A0jr_sFK1VcQ0ZhYPLSOWN-cNryR4ytC8-wpvQDH8TLXfMpYoDUE1CoqvmGPFVudLIqCfuE4q1PTtU4cn4ehiUxVgIJWJ0U38ZliskWE2eFCAA00n3XoCGl-3sALWHUDZ5JvMiNHNNQt4o-BpCcsjdYhVftewIGmEsSPvDFLOAIjukNrlU1RbYUFFIy-obxREQSvS8Bdad2YjP2feF6Jat0eEiovSlf49OOctQGqgXfmjGbXMroa6uohBDFNXtp1bPkTAPnAo5WedrP1bBbnosI2xQKAgEdGFn36RvrWvZJTobW_LwEtOyohr_Z2CYwNR5bQ1ITuPt89nMuyz-pwYviy5KOBab4-0O0mVGNo2AMOG4NWtFHjrgoam8vQc8Wg54ppl1dByDM9VoKDxl0tNZ2Ths7V6p9zVmOqlqxOuMuf1U4qWm0eus1Za3relYu9K5d43alXkIu6mDHDcYtWIqY13B46mjSb0vGSGeCiVkQJdmKQKajO9ArlRdq3dgIiwZSo_5c3zdrZMoIEdvZc_SRYvO7sHXtXvOxI1CtpRajkwp5LkcGtrd-NP_-yoHouOEuKDwInBfj-D0VqCjA

// SIZE LIMIT :) [./dist/observant.terser-rollup.js] (3494 <= 3616)
// SIZE LIMIT :) [./dist/observant.terser-rollup.js.gz] (1550 <= 1578)
// SIZE LIMIT :) [./dist/observant.terser-rollup.js.br] (1400 <= 1428)
// SIZE LIMIT :) [./dist/observant.rollup.js] (17617 <= 17739)
// SIZE LIMIT :) [./dist/observant.rollup.js.gz] (2896 <= 2921)
// SIZE LIMIT :) [./dist/observant.rollup.js.br] (2644 <= 2667)
// SIZE LIMIT :) [./dist/observant.esbuild.js] (5978 <= 6100)
// SIZE LIMIT :) [./dist/observant.esbuild.js.gz] (2055 <= 2083)
// SIZE LIMIT :) [./dist/observant.esbuild.js.br] (1862 <= 1882)

// ----------------
// <TYPES>
// ----------------

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

export type TObs<_T> = {
	// noop
};

interface IObsInternal<T> {
	_eventListeners: TObsEventListenersMap<T>;

	// _eq?: (val1: T | undefined, val2: T | undefined) => boolean;

	_currentValue?: T;

	_state: typeof STATE_RESOLVED | typeof STATE_DIRTY | typeof STATE_DIRTY_CHILDREN;
	_initializedWithValueOrError: boolean;

	_inQueueOfRoots: boolean;

	_deriveFunc?: TObsDeriveFunc<T>;
	_isDeriving: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_parentDependents?: Array<IObsInternal<any>>;

	_hasParentDependentsOrEventListeners: boolean;

	_activatedParentDependentsAfterDeep: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_childDependencies?: Array<IObsInternal<any>>;

	_idOfUpdateWithValueOrError: number;

	_resolvedError?: Error;
}

export type TObsOptions<_T> = {
	run?: boolean;
	// eq?: (val1: T | undefined, val2: T | undefined) => boolean;
};

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

const ensureErrorType = (err: unknown) => (err instanceof Error ? err : Error(String(err)));

const ERROR_MSG_DERIVE_FUNC_CALLED_CIRCULAR = 'OERR_1';
const ERROR_MSG_SET_CALLED_WITH_DERIVE_FUNC = 'OERR_2';

// ----------------
// </ERROR HANDLING>
// ----------------

// ----------------
// <FAST ARRAY UTILS>
// ----------------

const arrayIncludes = <T>(arr: T[] | undefined, v: T): boolean => {
	for (let i = arr ? arr.length : 0; i !== 0; ) {
		// let i = arr ? arr.length : 0;
		// while (; i !== 0; i--) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (arr![--i] === v) {
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
	typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.nextTick
		? globalThis.process.nextTick
		: undefined;

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
	for (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let obs: IObsInternal<any> | undefined;
		indexInQueueOfRootObsToResolve < queueOfRootObsToResolve.length &&
		(obs = queueOfRootObsToResolve[indexInQueueOfRootObsToResolve++]);

	) {
		if (obs._activatedParentDependentsAfterDeep) {
			obs._inQueueOfRoots = false;
			_deriveDeep(obs);
		}
		// else, skip and flush
	}
	indexInQueueOfRootObsToResolve = 0;
	queueOfRootObsToResolve.length = 0;
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

// perf code golf!
// Object.assign(Object.create(null), { .... })
const O = Object.freeze(
	{
		prototype: null,
		// _eq: undefined,
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
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as unknown as IObsInternal<any>;

// perf code golf!
// Object.assign(Object.create(null), { .... })
const E = Object.freeze(
	{
		prototype: null,
		[ObsEventChange]: undefined,
		[ObsEventError]: undefined,
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as TObsEventListenersMap<any>;

export const obs = <T = TObserved>(v: T | TObsDeriveFunc<T>, opts?: TObsOptions<T>): TObs<T> => {
	// perf code golf!
	// const thiz = {} as IObsInternal<T>;
	// const thiz = Object.create(null) as IObsInternal<T>;
	// const thiz = Object.create(Object.prototype) as IObsInternal<T>;
	// const thiz = Object.assign( .... , O);
	// const thiz = {...O} as IObsInternal<T>;
	// const thiz = Object.seal( ...... ) as IObsInternal<T>;
	const thiz = { ...O } as IObsInternal<T>;
	// thiz.prototype = null;
	// Object.setPrototypeOf(thiz, null);

	// thiz._eq = opts?.eq; // ?? Object.is; // referencial === equality

	thiz._eventListeners = { ...E } as TObsEventListenersMap<T>;

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

	if (opts && opts.run) {
		run(thiz);
	}

	return thiz;
};

// ----------------
// </OBSERVANT WRAP CONSTRUCTOR>
// ----------------

// ----------------
// <OBSERVANT PUBLICS>
// ----------------

export const get = <T>(thiz: TObs<T>): T => {
	const that = thiz as IObsInternal<T>;

	if (that._state !== STATE_RESOLVED && that._idOfUpdateWithValueOrError !== lastIdOfUpdateWithValueOrError) {
		// STATE_DIRTY || STATE_DIRTY_CHILDREN
		_deriveDeep(that);
	}

	if (currentDeriveObs && currentDeriveObs !== that) {
		if (!currentDeriveObs._childDependencies) {
			currentDeriveObs._childDependencies = [that];
		} else if (!arrayIncludes(currentDeriveObs._childDependencies, thiz) && currentDeriveObs._childDependencies) {
			currentDeriveObs._childDependencies.push(that);
		}
	}

	if (that._resolvedError) {
		throw that._resolvedError;
	}

	// guaranteed defined, because _deriveDeep(that) sets thiz._currentValue or sets thiz._resolvedError (which bails out in the conditional above)
	return that._currentValue as T;
};

export const peek = <T>(thiz: TObs<T>): T | undefined => {
	const that = thiz as IObsInternal<T>;

	if (that._resolvedError) {
		throw that._resolvedError;
	}
	return that._currentValue;
};

export const set = <T>(thiz: TObs<T>, val: T | ((currentValue: T | undefined) => T)): void => {
	const that = thiz as IObsInternal<T>;

	if (that._deriveFunc) {
		throw Error(ERROR_MSG_SET_CALLED_WITH_DERIVE_FUNC);
	}
	// if (!that._initializedWithValueOrError && that._deriveFunc) {
	// 	_callDeriveFunc(that);
	// }

	if (typeof val === 'function') {
		// eslint-disable-next-line @typescript-eslint/ban-types
		_setCurrentValue(that, (val as Function)(that._currentValue));
	} else {
		_setCurrentValue(that, val);
	}
};

export const off = <T>(thiz: TObs<T>) => {
	const that = thiz as IObsInternal<T>;

	_offEvent(that);

	for (
		let thisParentDependents = that._parentDependents, i = thisParentDependents ? thisParentDependents.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= thisParentDependents!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		off(thisParentDependents![--i]);
	}
};

export const onChange = <T>(thiz: TObs<T>, listener: TObsEventListenerChange<T>): (() => void) => {
	return _onEvent(thiz as IObsInternal<T>, ObsEventChange, listener);
};

export const onError = <T>(thiz: TObs<T>, listener: TObsEventListenerError): (() => void) => {
	return _onEvent(thiz as IObsInternal<T>, ObsEventError, listener);
};

export const run = <T>(thiz: TObs<T>): void => {
	const that = thiz as IObsInternal<T>;

	if (that._childDependencies) {
		_deriveDeep(that);
	}

	_doActivate(that, true);

	get(that);
};

// ----------------
// </OBSERVANT PUBLICS>
// ----------------

// // ----------------
// // <OBSERVANT CLASS>
// // ----------------

// // interface IObsConstructor<T> extends TObs<T> {
// // 	new (v: T | TObsDeriveFunc<T>, opts?: TObsOptions<T>): TObs<T>;
// // 	(v: T | TObsDeriveFunc<T>, opts?: TObsOptions<T>): TObs<T>;
// // }

// export interface IObs<T> {
// 	get: () => T;
// 	peek: () => T | undefined;
// 	set: (val: T | ((currentValue: T | undefined) => T)) => this;

// 	off: () => this;

// 	onChange: (listener: TObsEventListenerChange<T>) => () => this;
// 	onError: (listener: TObsEventListenerError) => () => this;

// 	run: () => void;
// }

// export const makeObs = <T = TObserved>(v: T | TObsDeriveFunc<T>, opts?: TObsOptions<T>): TObs<T> =>
// 	// new (Obs as IObsConstructor<T>)(v, opts);
// 	new Obs(v, opts);

// export class Obs<T = TObserved> {
// 	declare readonly _thiz: IObsInternal<T>;

// 	constructor(v: T | TObsDeriveFunc<T>, opts?: TObsOptions<T>) {
// 		this._thiz = obs(v, opts) as IObsInternal<T>;
// 	}

// 	get(): T {
// 		return get(this._thiz);
// 	}

// 	peek(): T | undefined {
// 		return peek(this._thiz);
// 	}

// 	set(v: T | ((currentValue: T | undefined) => T)): void {
// 		set(this._thiz, v);
// 	}

// 	off() {
// 		off(this._thiz);
// 	}

// 	onChange(listener: TObsEventListenerChange<T>): () => TObs<T> {
// 		return onChange(this._thiz, listener);
// 	}

// 	onError(listener: TObsEventListenerError): () => TObs<T> {
// 		return onError(this._thiz, listener);
// 	}

// 	run(): void {
// 		run(this._thiz);
// 	}
// }

// Object.freeze(Obs.prototype);

// // ----------------
// // </OBSERVANT CLASS>
// // ----------------

// ----------------
// <OBSERVANT INTERNALS>
// ----------------

const _doActivate = <T>(thiz: IObsInternal<T>, resolved: boolean) => {
	thiz._hasParentDependentsOrEventListeners = true;
	_registerParentDependentsOnChildrenDependencies(thiz, resolved);
};

const _checkDeactivate = <T>(thiz: IObsInternal<T>) => {
	if (
		thiz._hasParentDependentsOrEventListeners &&
		(!thiz._parentDependents || thiz._parentDependents.length === 0) &&
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

const _onEvent = <T>(thiz: IObsInternal<T>, key: TObsEventTypes, listener: TObsEventListener<T>): (() => void) => {
	if (thiz._childDependencies) {
		_deriveDeep(thiz);
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

	return () => {
		_offEvent(thiz, key, listener);
	};
};

const _offEvent = <T>(thiz: IObsInternal<T>, key?: TObsEventTypes, listener?: TObsEventListener<T>) => {
	if (thiz._childDependencies) {
		_deriveDeep(thiz);
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
					for (; i !== 0; ) {
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
};

const _emitEvent = <T>(
	thiz: IObsInternal<T>,
	key: TObsEventTypes,
	current: T | undefined,
	previous: T | undefined,
	error: Error | undefined,
) => {
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
			for (; i !== 0; ) {
				tryEventListener(listeners[--i]);
			}
		}
	} else {
		tryEventListener(listeners);
	}
};

const _registerParentDependentDeep = <T>(
	thiz: IObsInternal<T>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	parentDependent: IObsInternal<any>,
	resolved: boolean,
) => {
	if (thiz !== parentDependent) {
		if (thiz._parentDependents) {
			thiz._parentDependents.push(parentDependent);
		} else {
			thiz._parentDependents = [parentDependent];
		}
	}

	_doActivate(thiz, resolved);
};

const _registerParentDependentsOnChildrenDependencies = <T>(thiz: IObsInternal<T>, resolved: boolean) => {
	if (thiz._activatedParentDependentsAfterDeep || !thiz._deriveFunc || !thiz._childDependencies) {
		return;
	}

	for (
		let thisChildDependencies = thiz._childDependencies, i = thisChildDependencies ? thisChildDependencies.length : 0;
		i !== 0 && i <= thisChildDependencies.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_registerParentDependentDeep(thisChildDependencies![--i], thiz, resolved);
	}

	if (resolved) {
		thiz._state = STATE_RESOLVED;
	}

	thiz._activatedParentDependentsAfterDeep = true;
};

const _unregisterParentDependentDeep = <T>(thiz: IObsInternal<T>, parentDependent: TObs<T>) => {
	const thisParentDependents = thiz._parentDependents;
	if (!thisParentDependents) {
		return;
	}
	let i = thisParentDependents ? thisParentDependents.length : 0;
	if (i === 1) {
		thiz._parentDependents = undefined;
	} else {
		for (; i !== 0 && i <= thisParentDependents.length; ) {
			if (thisParentDependents[--i] === parentDependent) {
				thisParentDependents.splice(i, 1);
				break;
			}
		}
	}

	_checkDeactivate(thiz);
};

const _unregisterParentDependentsOnChildrenDependencies = <T>(thiz: IObsInternal<T>) => {
	if (!thiz._activatedParentDependentsAfterDeep) {
		return;
	}

	for (
		let thisChildDependencies = thiz._childDependencies, i = thisChildDependencies ? thisChildDependencies.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= thisChildDependencies!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_unregisterParentDependentDeep(thiz, thisChildDependencies![--i]);
	}

	thiz._state = STATE_DIRTY;

	thiz._activatedParentDependentsAfterDeep = false;
};

const _climbParentDependentsToFeedQueueOfRootObsToResolve = <T>(thiz: IObsInternal<T>, dirty: boolean) => {
	thiz._state = dirty ? STATE_DIRTY : STATE_DIRTY_CHILDREN;
	const thisParentDependents = thiz._parentDependents;
	if (thisParentDependents) {
		for (let i = thisParentDependents.length; i !== 0 && i <= thisParentDependents.length; ) {
			const parentDependent = thisParentDependents[--i];
			if (parentDependent._state === STATE_RESOLVED) {
				_climbParentDependentsToFeedQueueOfRootObsToResolve(parentDependent, false);
			}
		}
		// !arrayIncludes(queueOfRootObsToResolve, thiz)
	} else if (!thiz._inQueueOfRoots) {
		thiz._inQueueOfRoots = true;
		const i = queueOfRootObsToResolve.push(thiz);
		if (i === 1) {
			tickFunc(flushQueueOfRootObsToResolve);
		}
	}
};

const _deriveDeep = <T>(thiz: IObsInternal<T>) => {
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

	for (
		let thisChildDependencies = thiz._childDependencies, i = thisChildDependencies ? thisChildDependencies.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= thisChildDependencies!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_deriveDeep(thisChildDependencies![--i]);

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

const _callDeriveFunc = <T>(thiz: IObsInternal<T>) => {
	if (!thiz._deriveFunc) {
		return;
	}

	if (thiz._isDeriving) {
		throw Error(ERROR_MSG_DERIVE_FUNC_CALLED_CIRCULAR);
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

		const thisChildDependencies = thiz._childDependencies;
		const l = thisChildDependencies ? thisChildDependencies.length : 0;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		for (let i = l; i !== 0 && i <= thisChildDependencies!.length; ) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const childDependency = thisChildDependencies![--i];

			if (!arrayIncludes(previousChildDependencies, childDependency)) {
				_registerParentDependentDeep(childDependency, thiz, false);
				newChildDependenciesCount++;
			}
		}

		let iPrev = previousChildDependencies ? previousChildDependencies.length : 0;
		if (iPrev !== 0 && (l === 0 || l - newChildDependenciesCount < iPrev)) {
			for (; iPrev !== 0; ) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const previousChildDependency = previousChildDependencies![--iPrev];

				if (l === 0 || !arrayIncludes(thisChildDependencies, previousChildDependency)) {
					_unregisterParentDependentDeep(previousChildDependency, thiz);
				}
			}
		}

		if (l !== 0) {
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

	if (!deriveError) {
		return;
	}

	thiz._initializedWithValueOrError = true;

	_setErrorHereAndClimbParentDependents(thiz, currentDeriveError);
	if (currentDeriveError) {
		currentErrorHandler(currentDeriveError);
	}

	if (thiz._activatedParentDependentsAfterDeep) {
		thiz._state = STATE_RESOLVED;
	}
};

const _setCurrentValue = <T>(thiz: IObsInternal<T>, newValue: T) => {
	thiz._initializedWithValueOrError = true;

	if (thiz._resolvedError) {
		_setErrorHereAndClimbParentDependents(thiz, undefined);
	}

	if (thiz._activatedParentDependentsAfterDeep) {
		thiz._state = STATE_RESOLVED;
	}

	thiz._idOfUpdateWithValueOrError = ++lastIdOfUpdateWithValueOrError;

	const previousValue = thiz._currentValue;
	// const changed = thiz._eq ? !thiz._eq(newValue, previousValue) : newValue !== previousValue;
	if (newValue === previousValue) {
		return;
	}

	thiz._currentValue = newValue;

	for (
		let thisParentDependents = thiz._parentDependents, i = thisParentDependents ? thisParentDependents.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= thisParentDependents!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_climbParentDependentsToFeedQueueOfRootObsToResolve(thisParentDependents![--i], true);
	}

	_emitEvent(thiz, ObsEventChange, newValue, previousValue, undefined);
};

const _setErrorHereAndClimbParentDependents = <T>(thiz: IObsInternal<T>, error: Error | undefined) => {
	if (thiz._resolvedError === error) {
		return;
	}
	thiz._resolvedError = error;

	thiz._idOfUpdateWithValueOrError = ++lastIdOfUpdateWithValueOrError;

	if (error) {
		_emitEvent(thiz, ObsEventError, undefined, undefined, error);
	}

	for (
		let thisParentDependents = thiz._parentDependents, i = thisParentDependents ? thisParentDependents.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= thisParentDependents!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_setErrorHereAndClimbParentDependents(thisParentDependents![--i], error);
	}
};

// ----------------
// </OBSERVANT INTERNALS>
// ----------------

// <!DOCTYPE html>
// <html>
// <head>
// 	<meta charset="UTF-8">
// 	<title></title>

// 	<link rel="stylesheet" type="text/css" href="lib/ceres.css">
// 	<style>
// body {
// 	padding: 50px;
// }

// #bSelectLibrary {
// 	line-height: 2.2rem;
// }

// #tfOutput {
// 	display: block;
// 	padding: 10px 20px;
// 	border: 1px dashed #999;
// 	color: #000;
// 	font-size: 1.1em;
// }
// 	</style>

// </head>
// <body>

// <p>
// 	<label>
// 		Number of layers
// 		<input id="tfLayerCount" class="-textfield" type="text" value="5000">

// 		<div id="bSetLayerCount">
// 			<button class="-btn -btn-primary">10</button>
// 			<button class="-btn -btn-primary">20</button>
// 			<button class="-btn -btn-primary">30</button>
// 			<button class="-btn -btn-danger">50</button>
// 			<button class="-btn -btn-danger">100</button>
// 			<button class="-btn -btn-danger">1000</button>
// 			<button class="-btn -btn-danger">2000</button>
// 			<button class="-btn -btn-danger">3000</button>
// 			<button class="-btn -btn-danger">4000</button>
// 			<button class="-btn -btn-danger">5000</button>
// 			<button class="-btn -btn-danger">6000</button>
// 		</div>
// 	</label>
// </p>

// <hr>

// <p id="bSelectLibrary">
// 	Library
// 	<br>
// 	<label class="-radiobox"><input type="radio" name="rdbLibrary" value="observant" checked><span></span>observant</label>
// </p>

// <hr>

// <p>
// 	<button id="btnRunTest" class="-btn -btn-high -btn-success">Run</button>
// </p>

// <hr>

// <p>
// 	Output
// 	<pre><output id="tfOutput">&nbsp;</output></pre>
// </p>

// <script src="./lib/obs.min.js"></script>
// <script>

// document.querySelectorAll('#bSetLayerCount button').forEach((b) => {
// 	b.addEventListener('click', function() {
// 	document.querySelector('#tfLayerCount').value = this.innerHTML;
// })});

// document.querySelector('#btnRunTest').addEventListener('click', function() {
// 	runTest(document.querySelector('#bSelectLibrary input:checked').value, parseInt(document.querySelector('#tfLayerCount').value, 10));
// });

// function runTest(lib, layerCount) {
// 	document.querySelector('#btnRunTest').disabled = true;

// 	// console.log(lib, layerCount);

// 	// setTimeout(() => {
// 		let report = {};

// 		function onDone() {
// 			// setTimeout(() => {
// 			document.querySelector('#tfOutput').innerHTML =
// 				'beforeChange: [' + report.beforeChange +
// 					'],<br>afterChange: [' + report.afterChange +
// 					'],<br>MIN: ' + report.min +
// 					',<br>MAX: ' + report.max +
// 					',<br>AVERAGE: ' + report.avg +
// 					',<br>MEDIAN: ' + report.median
// 			;

// 			document.querySelector('#btnRunTest').disabled = false;
// 			// }, 500);
// 		}

// 		switch (lib) {
// 			case 'observant': {
// 				testObservant(report, layerCount, onDone);
// 				break;
// 			}
// 		}
// 	// }, 500);

// }

// function testObservant(report, layerCount, done) {

// 	const once = () => {
// 		let start = {
// 			prop1: observant.obs(1),
// 			prop2: observant.obs(2),
// 			prop3: observant.obs(3),
// 			prop4: observant.obs(4)
// 		};
// 		let layer = start;

// 		for (let i = layerCount; i--; ) {
// 			layer = ((prev) => {
// 				let next = {
// 					prop1: observant.obs(() => observant.get(prev.prop2), {run: true}),
// 					prop2: observant.obs(() => observant.get(prev.prop1) - observant.get(prev.prop3), {run: true}),
// 					prop3: observant.obs(() => observant.get(prev.prop2) + observant.get(prev.prop4), {run: true}),
// 					prop4: observant.obs(() => observant.get(prev.prop3), {run: true})
// 				};

// 				// next.prop1.onChange(() => {});
// 				// next.prop2.onChange(() => {});
// 				// next.prop3.onChange(() => {});
// 				// next.prop4.onChange(() => {});

// 				// observant.run(next.prop1);
// 				// observant.run(next.prop2);
// 				// observant.run(next.prop3);
// 				// observant.run(next.prop4);

// 				// observant.get(next.prop1);
// 				// observant.get(next.prop2);
// 				// observant.get(next.prop3);
// 				// observant.get(next.prop4);

// 				return next;
// 			})(layer);
// 		}

// 		let end = layer;

// 		// end.prop1.onChange(() => {});
// 		// end.prop2.onChange(() => {});
// 		// end.prop3.onChange(() => {});
// 		// end.prop4.onChange(() => {});

// 		report.beforeChange = [
// 			observant.get(end.prop1),
// 			observant.get(end.prop2),
// 			observant.get(end.prop3),
// 			observant.get(end.prop4)
// 		];

// 		let startTime = performance.now();

// 		observant.set(start.prop1, 4);
// 		observant.set(start.prop2, 3);
// 		observant.set(start.prop3, 2);
// 		observant.set(start.prop4, 1);

// 		report.afterChange = [
// 			observant.get(end.prop1),
// 			observant.get(end.prop2),
// 			observant.get(end.prop3),
// 			observant.get(end.prop4)
// 		];

// 		report.recalculationTime = performance.now() - startTime;

// 		report.min = Math.min(report.min || 9999, report.recalculationTime);
// 		report.max = Math.max(report.max || 0, report.recalculationTime);

// 		if (!report.times) {
// 			report.times = [];
// 		}
// 		report.times.push(report.recalculationTime);
// 	}

// 	const sleep = (ms) => new Promise((res) => {
// 		setTimeout(() => {
// 			res();
// 		}, ms);
// 	});
// 	setTimeout(async () => {
// 		// warmup
// 		once();
// 		await sleep(200);

// 		once();
// 		await sleep(200);

// 		once();
// 		await sleep(200);

// 		console.log(JSON.stringify(report, null, 4));

// 		report.min = 888;
// 		report.max = 0;
// 		report.avg = 0;
// 		report.median = 0;
// 		report.times = [];
// 		report.sorted = [];

// 		for (let i = 0; i < 10; i++) {
// 			once();
// 			await sleep(100);
// 		}

// 		report.avg = report.times.reduce((prev, cur) => {
// 			return prev + cur;
// 		}, 0) / report.times.length;

//   		const middle = Math.floor(report.times.length / 2);
//     	const times = report.sorted = [...report.times].sort((a, b) => a - b);
// 		report.median = times.length % 2 !== 0 ? times[middle] : (times[middle - 1] + times[middle]) / 2;

// 		console.log(JSON.stringify(report, null, 4));

// 		done();
// 	});
// }

// </script>

// </body>
// </html>
