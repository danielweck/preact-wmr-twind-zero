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
// https://mermaid.live/edit#pako:eNp9lF1r2zAUhv-KERRcaIflxPkwtBdrCx27Ciu7sUcQ1nEsastBsTtG0_--o0S2FNskN0me8x6dj1f2J8lqDiQmeVn_zQqmGu_teyo9_NzcCB74SdYqBbJ5UapWr0zyEtSf27NCcOonbz-efsZeXraHYmMDoZ9sOSjxAc8Ae8tnfrKDxnt49A74lRWi5F6de3umaxysbu4nKLD_o_48naugz8Y8q1qgCiO_WdkxPcTST-o8d8kKdQO0RpF8KpjcgYtpoKXyAlEtPe3jAuPIqnWaoTjrlmWN-GANOBhH25ZCvjvoPN2EVg_USld9KoUTbaESzn7oypyq192td7RVuu7Pu6oL9dQ5AN90Eu2yt3GbCKlp4mITWMN7wByM95ZfAp07Nyjq7TZg4bhm0MpF99_uH4-m3SMGl46BRk8D16opGI4b6hmdTcCZtbSTza13HVq4t2aiRDBRYjXWdYhGruEGBtbvwWm6J42O3VNxPKms84NjdcNj_bq_AedVu8HQxgbuRVcKR1eKRGPXOxTSMXM8XAxkhrhXI5yQ06W94aO75CaEdJBh4CiHugdiTD8npyHJHalAVUxwfLl-alVKmgIqSEmMPzlT7ylJ5Rfq2j3Hp_6Fi6ZWJM5ZeYA7wtqm_vVPZiRuVAud6FmwnWKVUX39B0Cvo00
// https://mermaid.live/view#pako:eNp9lF1r2zAUhv-KERRcaIflxPmC9mJtoWNXYWU39gjCkmNRWw6K3TGa_vcdxbJ1YpvkJvFz3qPz8cr5JGnFBdmQrKj-pjnTtff2PVEefG5uJA_8OG20Fqp-0brSr0zxQug_t61CcurHbz-efm68rGiO-dYFQj_ecaHlh3gW4uD4zI_3ovYeHr0jfKW5LLhXZd6BmRpHp5v7MQjcc9SfZ3K16LMhz6kWoILIb1Z0zAyx9OMqyzBZgW6A1iBSTzlTe4ExDYxUXSBqpOd9XGAYWTeoGQqz7lhayw9WC4RhtF0h1TtC7XQTWjNQo7D6XAom2olSov3QlT3VrLtb72irdN2fd1UXmqkzIfi2kxiXvS1uIqS2iYtNQA3vAXIg3lt-CUzu3KKot9uCBXLNohVG99_uH0-23RMEl8hAq6cBtmoKhuOGekZnE3DmLO1kc-ddhxb41kyUCCZKrMa6DtEIG25h4PwenGZ6MujUvRWns8o5PzjWNDzWr_sb0K4aB0MXG7gXXSkcXSkSjV3vUEjHDHm4GMgswVcjnJDTpbvho7uEE0I6yLBwlEPxgRAz78l5SHJHSqFLJjn8uX4aVULqXJQiIRv4yZl-T0iivkDXHDi89S9c1pUmm1o34o6wpq5-_VNp99xqniXba1a28Os__g-itw

// SIZE LIMIT :) [./dist/observant.terser-rollup.js] (3391 <= 3524)
// SIZE LIMIT :) [./dist/observant.terser-rollup.js.gz] (1533 <= 1562)
// SIZE LIMIT :) [./dist/observant.terser-rollup.js.br] (1383 <= 1414)
// SIZE LIMIT :) [./dist/observant.esbuild.js] (4574 <= 6008)
// SIZE LIMIT :) [./dist/observant.esbuild.js.gz] (1887 <= 2063)
// SIZE LIMIT :) [./dist/observant.esbuild.js.br] (1700 <= 1867)

// ----------------
// <ERROR HANDLING>
// ----------------

// const _errorHandler = (err: Error, msg?: string) => {
// 	console.log(msg, err);
// };
// export const logError = (errorHandler: typeof _errorHandler) => {
// 	_errorHandler = errorHandler;
// };

const mkError = (err: unknown) => (err instanceof Error ? err : Error(String(err)));

const ERROR_MSG_DERIVE_FUNC_CALLED_CIRCULAR = 'OERR_1';
const ERROR_MSG_SET_CALLED_WITH_DERIVE_FUNC = 'OERR_2';
// const ERROR_MSG_EVENT_LISTENER_THROW = 'OERR_3';

// ----------------
// </ERROR HANDLING>
// ----------------

// ----------------
// <FAST ARRAY UTILS>
// ----------------

const inArray = <T>(arr: T[] | undefined, v: T): boolean => {
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

const tickNext: TObsTick | undefined =
	typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.nextTick
		? globalThis.process.nextTick
		: undefined;

const tickQMicrotask: TObsTick | undefined =
	typeof self !== 'undefined' && self.queueMicrotask ? self.queueMicrotask : undefined;

const tickPromise_ = Promise.resolve();
const tickPromise: TObsTick = (func) => {
	// eslint-disable-next-line promise/catch-or-return,promise/always-return
	tickPromise_.then(() => {
		func();
	});
};

const ticker = tickQMicrotask ?? tickNext ?? tickPromise;

// ----------------
// </TICK MICROTASK DEFER>
// ----------------

// ----------------
// <TICK QUEUE PROCESS>
// ----------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _Q: IObsInternal<any>[] = [];
let _iQ = 0;
const _flushQ = () => {
	for (
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let obs: IObsInternal<any> | undefined;
		_iQ < _Q.length && (obs = _Q[_iQ++]);

	) {
		if (obs._active) {
			obs._inQ = false;
			_deriveDeep(obs);
		}
		// else, skip and flush
	}
	_iQ = 0;
	_Q.length = 0;
};

// ----------------
// </TICK QUEUE PROCESS>
// ----------------

// ----------------
// <GLOBAL STATE>
// ----------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _currentDerive: IObsInternal<any> | undefined;

let _currentError: Error | undefined;

let _lastUpdateID = 0;

// perf code golf!
// // const STATE_UNKNOWN = 0;
// const STATE_RESOLVED = 1 << 0; // 1
// const STATE_DIRTY = 1 << 1; // 2
// const STATE_DIRTY_CHILDREN = 1 << 2; // 4
const STATE_RESOLVED = '0';
const STATE_DIRTY = '1';
const STATE_DIRTY_CHILDREN = '2';

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
		_events: undefined,
		_hasEvents: false,
		_parents: undefined,
		_children: undefined,
		_wired: false,
		_active: false,
		_inQ: false,
		_deriving: false,
		_updateID: -1,
		_error: undefined,
		_state: STATE_DIRTY,
		_val: undefined,
		_deriver: undefined,
		// _initialized: false,
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) as unknown as IObsInternal<any>;

const EVT_CHANGE = '0';
const EVT_ERROR = '1';

// perf code golf!
// Object.assign(Object.create(null), { .... })
const E = Object.freeze(
	{
		prototype: null,
		[EVT_CHANGE]: undefined,
		[EVT_ERROR]: undefined,
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

	thiz._events = { ...E } as TObsEventListenersMap<T>;

	if (typeof v === 'function') {
		thiz._state = STATE_DIRTY;

		thiz._val = undefined;
		thiz._deriver = v as TObsDeriveFunc<T>;

		// thiz._initialized = false;
	} else {
		thiz._state = STATE_RESOLVED;

		thiz._val = v as T;
		thiz._deriver = undefined;

		// thiz._initialized = true;
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

	if (that._state !== STATE_RESOLVED && that._updateID !== _lastUpdateID) {
		// STATE_DIRTY || STATE_DIRTY_CHILDREN
		_deriveDeep(that);
	}

	if (_currentDerive && _currentDerive !== that) {
		if (!_currentDerive._children) {
			_currentDerive._children = [that];
		} else if (!inArray(_currentDerive._children, thiz) && _currentDerive._children) {
			_currentDerive._children.push(that);
		}
	}

	if (that._error) {
		throw that._error;
	}

	// guaranteed defined, because _deriveDeep(that) sets thiz._val or sets thiz._error (which bails out in the conditional above)
	return that._val as T;
};

export const peek = <T>(thiz: TObs<T>): T | undefined => {
	const that = thiz as IObsInternal<T>;

	if (that._error) {
		throw that._error;
	}
	return that._val;
};

export const set = <T>(thiz: TObs<T>, val: T | ((currentValue: T | undefined) => T)): void => {
	const that = thiz as IObsInternal<T>;

	if (that._deriver) {
		throw Error(ERROR_MSG_SET_CALLED_WITH_DERIVE_FUNC);
	}
	// if (!that._initialized && that._deriver) {
	// 	_derive(that);
	// }

	if (typeof val === 'function') {
		// eslint-disable-next-line @typescript-eslint/ban-types
		_setVal(that, (val as Function)(that._val));
	} else {
		_setVal(that, val);
	}
};

export const off = <T>(thiz: TObs<T>) => {
	const that = thiz as IObsInternal<T>;

	_off(that);

	for (
		let parents = that._parents, i = parents ? parents.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= parents!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		off(parents![--i]);
	}
};

export const onChange = <T>(thiz: TObs<T>, listener: TObsEventListenerChange<T>): (() => void) => {
	return _on(thiz as IObsInternal<T>, EVT_CHANGE, listener);
};

export const onError = <T>(thiz: TObs<T>, listener: TObsEventListenerError): (() => void) => {
	return _on(thiz as IObsInternal<T>, EVT_ERROR, listener);
};

export const run = <T>(thiz: TObs<T>): void => {
	const that = thiz as IObsInternal<T>;

	if (that._children) {
		_deriveDeep(that);
	}

	_activate(that, true);

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

const _activate = <T>(thiz: IObsInternal<T>, resolved: boolean) => {
	thiz._wired = true;
	_link(thiz, resolved);
};

const _deactivate = <T>(thiz: IObsInternal<T>) => {
	if (thiz._wired && (!thiz._parents || thiz._parents.length === 0) && !thiz._hasEvents) {
		thiz._wired = false;
		_unlink(thiz);
	}
};

const _on = <T>(thiz: IObsInternal<T>, key: TObsEventTypes, listener: TObsEventListener<T>): (() => void) => {
	if (thiz._children) {
		_deriveDeep(thiz);
	}
	const listeners = thiz._events[key];
	if (!listeners) {
		// @ts-expect-error TS2322
		thiz._events[key] = listener;
	} else if (Array.isArray(listeners)) {
		if (!inArray(listeners, listener)) {
			// @ts-expect-error TS2345
			listeners.push(listener);
		}
	} else if (listeners !== listener) {
		// @ts-expect-error TS2322
		thiz._events[key] = [listeners, listener];
	}
	thiz._hasEvents = true;

	_activate(thiz, true);

	return () => {
		_off(thiz, key, listener);
	};
};

const _off = <T>(thiz: IObsInternal<T>, key?: TObsEventTypes, listener?: TObsEventListener<T>) => {
	if (thiz._children) {
		_deriveDeep(thiz);
	}

	if (listener && key) {
		const listeners = thiz._events[key];
		if (listeners) {
			if (!Array.isArray(listeners)) {
				if (listeners === listener) {
					thiz._events[key] = undefined;
				}
			} else {
				let i = listeners.length;
				if (i === 1) {
					if (listeners[0] === listener) {
						thiz._events[key] = undefined;
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
		thiz._events[key] = undefined;
	} else {
		thiz._events[EVT_CHANGE] = undefined;
		thiz._events[EVT_ERROR] = undefined;
	}

	thiz._hasEvents = !!(thiz._events[EVT_CHANGE] || thiz._events[EVT_ERROR]);

	_deactivate(thiz);
};

const _emit = <T>(
	thiz: IObsInternal<T>,
	key: TObsEventTypes,
	current: T | undefined,
	previous: T | undefined,
	error: Error | undefined,
) => {
	const listeners = thiz._events[key];
	if (!listeners) {
		return;
	}

	const tryEmit = (listener: TObsEventListener<T>) => {
		try {
			if (key === EVT_CHANGE) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				(listener as TObsEventListenerChange<T>)(current!, previous);
			} else {
				// key === EVT_ERROR
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				(listener as TObsEventListenerError)(error!);
			}
		} catch (_err) {
			// noop (ignore)
			// _errorHandler(mkError(err), ERROR_MSG_EVENT_LISTENER_THROW);
		}
	};

	if (Array.isArray(listeners)) {
		let i = listeners.length;
		if (i === 1) {
			tryEmit(listeners[0]);
		} else {
			for (; i !== 0; ) {
				tryEmit(listeners[--i]);
			}
		}
	} else {
		tryEmit(listeners);
	}
};

const _linkDeep = <T>(
	thiz: IObsInternal<T>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	parent: IObsInternal<any>,
	resolved: boolean,
) => {
	if (thiz !== parent) {
		if (thiz._parents) {
			thiz._parents.push(parent);
		} else {
			thiz._parents = [parent];
		}
	}

	_activate(thiz, resolved);
};

const _link = <T>(thiz: IObsInternal<T>, resolved: boolean) => {
	if (thiz._active || !thiz._deriver || !thiz._children) {
		return;
	}

	for (let children = thiz._children, i = children ? children.length : 0; i !== 0 && i <= children.length; ) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_linkDeep(children![--i], thiz, resolved);
	}

	if (resolved) {
		thiz._state = STATE_RESOLVED;
	}

	thiz._active = true;
};

const _unlinkDeep = <T>(thiz: IObsInternal<T>, parent: TObs<T>) => {
	const parents = thiz._parents;
	if (!parents) {
		return;
	}
	let i = parents ? parents.length : 0;
	if (i === 1) {
		thiz._parents = undefined;
	} else {
		for (; i !== 0 && i <= parents.length; ) {
			if (parents[--i] === parent) {
				parents.splice(i, 1);
				break;
			}
		}
	}

	_deactivate(thiz);
};

const _unlink = <T>(thiz: IObsInternal<T>) => {
	if (!thiz._active) {
		return;
	}

	for (
		let children = thiz._children, i = children ? children.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= children!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_unlinkDeep(thiz, children![--i]);
	}

	thiz._state = STATE_DIRTY;

	thiz._active = false;
};

const _feedQ = <T>(thiz: IObsInternal<T>, dirty: boolean) => {
	thiz._state = dirty ? STATE_DIRTY : STATE_DIRTY_CHILDREN;
	const parents = thiz._parents;
	if (parents) {
		for (let i = parents.length; i !== 0 && i <= parents.length; ) {
			const parent = parents[--i];
			if (parent._state === STATE_RESOLVED) {
				_feedQ(parent, false);
			}
		}
		// !inArray(_Q, thiz)
	} else if (!thiz._inQ) {
		thiz._inQ = true;
		const i = _Q.push(thiz);
		if (i === 1) {
			ticker(_flushQ);
		}
	}
};

const _deriveDeep = <T>(thiz: IObsInternal<T>) => {
	if (thiz._state === STATE_RESOLVED) {
		return;
	}

	if (thiz._state === STATE_DIRTY) {
		if (thiz._deriver) {
			_derive(thiz);
		}
		return;
	}

	// STATE_DIRTY_CHILDREN

	for (
		let children = thiz._children, i = children ? children.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= children!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_deriveDeep(children![--i]);

		if ((thiz._state as IObsInternal<T>['_state']) === STATE_DIRTY) {
			if (thiz._deriver) {
				_derive(thiz);
			}
			return;
		}
	}

	thiz._state = STATE_RESOLVED;
};

const _derive = <T>(thiz: IObsInternal<T>) => {
	if (!thiz._deriver) {
		return;
	}

	if (thiz._deriving) {
		throw Error(ERROR_MSG_DERIVE_FUNC_CALLED_CIRCULAR);
	}
	thiz._deriving = true;

	const previousDerive = _currentDerive;
	// eslint-disable-next-line @typescript-eslint/no-this-alias
	_currentDerive = thiz;

	const previousChildren = thiz._children;
	thiz._children = undefined as IObsInternal<T>['_children'];

	let derivedValue: T | undefined;
	let deriveError: Error | undefined;
	try {
		derivedValue = thiz._deriver(thiz._val); // peek(thiz, ) without the possible previous error
	} catch (err) {
		deriveError = _currentError = mkError(err);
	}

	_currentDerive = previousDerive;

	thiz._deriving = false;

	if (thiz._wired) {
		let count = 0;

		const children = thiz._children;
		const l = children ? children.length : 0;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		for (let i = l; i !== 0 && i <= children!.length; ) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const childDependency = children![--i];

			if (!inArray(previousChildren, childDependency)) {
				_linkDeep(childDependency, thiz, false);
				count++;
			}
		}

		let k = previousChildren ? previousChildren.length : 0;
		if (k !== 0 && (l === 0 || l - count < k)) {
			for (; k !== 0; ) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const previousChildDependency = previousChildren![--k];

				if (l === 0 || !inArray(children, previousChildDependency)) {
					_unlinkDeep(previousChildDependency, thiz);
				}
			}
		}

		if (l !== 0) {
			thiz._active = true;
		} else {
			thiz._active = false;
			thiz._state = STATE_RESOLVED;
		}
	} else {
		thiz._state = thiz._children ? STATE_DIRTY : STATE_RESOLVED;
	}

	if (typeof derivedValue !== 'undefined') {
		_setVal(thiz, derivedValue);
		return;
	}

	if (!deriveError) {
		return;
	}

	// thiz._initialized = true;

	_emitError(thiz, _currentError);
	// if (_currentError) {
	// 	_errorHandler(_currentError);
	// }

	if (thiz._active) {
		thiz._state = STATE_RESOLVED;
	}
};

const _setVal = <T>(thiz: IObsInternal<T>, newValue: T) => {
	// thiz._initialized = true;

	if (thiz._error) {
		_emitError(thiz, undefined);
	}

	if (thiz._active) {
		thiz._state = STATE_RESOLVED;
	}

	thiz._updateID = ++_lastUpdateID;

	const previousValue = thiz._val;
	// const changed = thiz._eq ? !thiz._eq(newValue, previousValue) : newValue !== previousValue;
	if (newValue === previousValue) {
		return;
	}

	thiz._val = newValue;

	for (
		let parents = thiz._parents, i = parents ? parents.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= parents!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_feedQ(parents![--i], true);
	}

	_emit(thiz, EVT_CHANGE, newValue, previousValue, undefined);
};

const _emitError = <T>(thiz: IObsInternal<T>, error: Error | undefined) => {
	if (thiz._error === error) {
		return;
	}
	thiz._error = error;

	thiz._updateID = ++_lastUpdateID;

	if (error) {
		_emit(thiz, EVT_ERROR, undefined, undefined, error);
	}

	for (
		let parents = thiz._parents, i = parents ? parents.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= parents!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_emitError(parents![--i], error);
	}
};

// ----------------
// <TYPES>
// ----------------

export type TObsEventListenerChange<T> = (current: T, previous: T | undefined) => void;
export type TObsEventListenerError = (error: Error) => void;
export type TObsEventListener<T> = TObsEventListenerChange<T> | TObsEventListenerError;
export type TObsEventListeners<T> = TObsEventListener<T> | TObsEventListener<T>[] | undefined;
export type TObsEventListenersChange<T> = TObsEventListenerChange<T> | TObsEventListenerChange<T>[] | undefined;
export type TObsEventListenersError = TObsEventListenerError | TObsEventListenerError[] | undefined;
export type TObsEventTypes = typeof EVT_CHANGE | typeof EVT_ERROR;
export type TObsEventListenersMap<T> = {
	[EVT_CHANGE]: TObsEventListenersChange<T>;
	[EVT_ERROR]: TObsEventListenersError;
};

export type TObsPrimitive = null | number | string | boolean;
export type TObserved = TObsPrimitive | Array<TObsPrimitive> | Record<string, unknown>;
export type TObsDeriveFunc<T> = (currentValue: T | undefined) => T;

export type TObs<_T> = {
	// noop
};

interface IObsInternal<T> {
	_events: TObsEventListenersMap<T>;
	_hasEvents: boolean;

	// _eq?: (val1: T | undefined, val2: T | undefined) => boolean;

	_val?: T;

	_state: typeof STATE_RESOLVED | typeof STATE_DIRTY | typeof STATE_DIRTY_CHILDREN;
	// _initialized: boolean;

	_inQ: boolean;

	_deriver?: TObsDeriveFunc<T>;
	_deriving: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_parents?: Array<IObsInternal<any>>;

	_wired: boolean;

	_active: boolean;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	_children?: Array<IObsInternal<any>>;

	_updateID: number;

	_error?: Error;
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
