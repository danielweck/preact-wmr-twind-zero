// The algorithm implemented in this single-file lib was copied from Cellx:
// https://github.com/Riim/cellx
// Many thanks to the original developer for designing a fast and memory-efficient runtime for fine-grain reactivity / observables!
//
// This lib betters Cellx's performance in all 3 major web browsers (Safari, Chrome, Firefox),
// as demonstrated by Cellx's own "5000 layers" synthetic benchmark.
// Although the core logic was copied from Cellx, the implementation here is completely different:
// - Minimalistic API surface (observable factory/constructor, get/set, on-changed/on-error, disposal, ... that's it!)
// - Inlined internal event emmitter
// - Improved TypeScript typings (no 'any's!)
// - Many micro-optimisations techniques to avoid de-opt in JS runtimes (e.g. monomorphic object shapes, class vs. prototype usage, array vs. set, for vs. while / forward vs. reverse loops, property symbols, etc. etc.)

// https://mermaid-js.github.io/mermaid/#/flowchart
// https://mermaid.live/edit#pako:eNp9lF1r2zAUhv-KERRcaIflxPkwtBdrCx27Ciu7sUcQ1nEsastBsTtG0_--o0S2FNskN0me8x6dj1f2J8lqDiQmeVn_zQqmGu_teyo9_NzcCB74SdYqBbJ5UapWr0zyEtSf27NCcOonbz-efsZeXraHYmMDoZ9sOSjxAc8Ae8tnfrKDxnt49A74lRWi5F6de3umaxysbu4nKLD_o_48naugz8Y8q1qgCiO_WdkxPcTST-o8d8kKdQO0RpF8KpjcgYtpoKXyAlEtPe3jAuPIqnWaoTjrlmWN-GANOBhH25ZCvjvoPN2EVg_USld9KoUTbaESzn7oypyq192td7RVuu7Pu6oL9dQ5AN90Eu2yt3GbCKlp4mITWMN7wByM95ZfAp07Nyjq7TZg4bhm0MpF99_uH4-m3SMGl46BRk8D16opGI4b6hmdTcCZtbSTza13HVq4t2aiRDBRYjXWdYhGruEGBtbvwWm6J42O3VNxPKms84NjdcNj_bq_AedVu8HQxgbuRVcKR1eKRGPXOxTSMXM8XAxkhrhXI5yQ06W94aO75CaEdJBh4CiHugdiTD8npyHJHalAVUxwfLl-alVKmgIqSEmMPzlT7ylJ5Rfq2j3Hp_6Fi6ZWJM5ZeYA7wtqm_vVPZiRuVAud6FmwnWKVUX39B0Cvo00
// https://mermaid.live/view#pako:eNp9lF1r2zAUhv-KERRcaIflxPmC9mJtoWNXYWU39gjCkmNRWw6K3TGa_vcdxbJ1YpvkJvFz3qPz8cr5JGnFBdmQrKj-pjnTtff2PVEefG5uJA_8OG20Fqp-0brSr0zxQug_t61CcurHbz-efm68rGiO-dYFQj_ecaHlh3gW4uD4zI_3ovYeHr0jfKW5LLhXZd6BmRpHp5v7MQjcc9SfZ3K16LMhz6kWoILIb1Z0zAyx9OMqyzBZgW6A1iBSTzlTe4ExDYxUXSBqpOd9XGAYWTeoGQqz7lhayw9WC4RhtF0h1TtC7XQTWjNQo7D6XAom2olSov3QlT3VrLtb72irdN2fd1UXmqkzIfi2kxiXvS1uIqS2iYtNQA3vAXIg3lt-CUzu3KKot9uCBXLNohVG99_uH0-23RMEl8hAq6cBtmoKhuOGekZnE3DmLO1kc-ddhxb41kyUCCZKrMa6DtEIG25h4PwenGZ6MujUvRWns8o5PzjWNDzWr_sb0K4aB0MXG7gXXSkcXSkSjV3vUEjHDHm4GMgswVcjnJDTpbvho7uEE0I6yLBwlEPxgRAz78l5SHJHSqFLJjn8uX4aVULqXJQiIRv4yZl-T0iivkDXHDi89S9c1pUmm1o34o6wpq5-_VNp99xqniXba1a28Os__g-itw

// SIZE LIMIT :) [./dist/observant.terser-rollup.js] (2995 <= 2995)
// SIZE LIMIT :) [./dist/observant.terser-rollup.js.gz] (1336 <= 1336)
// SIZE LIMIT :) [./dist/observant.terser-rollup.js.br] (1217 <= 1217)
// SIZE LIMIT :) [./dist/observant.esbuild.js] (4051 <= 4051)
// SIZE LIMIT :) [./dist/observant.esbuild.js.gz] (1697 <= 1697)
// SIZE LIMIT :) [./dist/observant.esbuild.js.br] (1538 <= 1538)

// ----------------
// <ERROR HANDLING>
// ----------------

const mkError = (err: unknown) => (err instanceof Error ? err : Error(String(err)));

const ERR_CIRCULAR = 'Error1';
const ERR_SET_COMP = 'Error2';

// ----------------
// </ERROR HANDLING>
// ----------------

// ----------------
// <FAST ARRAY UTILS>
// ----------------

const inArray = <T>(arr: T[] | undefined, v: T): boolean | void => {
	for (let i = arr ? arr.length : 0; i !== 0; ) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (arr![--i] === v) {
			return true;
		}
	}
};

// ----------------
// </FAST ARRAY UTILS>
// ----------------

// ----------------
// <TICK MICROTASK DEFER>
// ----------------

const tickNext = typeof globalThis !== 'undefined' && globalThis.process?.nextTick;

const tickQMicrotask = typeof self !== 'undefined' && self.queueMicrotask;

const tickPromise_ = Promise.resolve();
const tickPromise: TObsTick = (func) => {
	// eslint-disable-next-line promise/catch-or-return,promise/always-return
	tickPromise_.then(() => {
		func();
	});
};

const isNode = tickNext && !tickQMicrotask;
const ticker: TObsTick = tickQMicrotask ? tickQMicrotask : tickNext ? tickNext : tickPromise;

// ----------------
// </TICK MICROTASK DEFER>
// ----------------

// ----------------
// <TICK QUEUE PROCESS>
// ----------------

const _Q: IObs<TObsKind>[] = [];
let _iQ = 0;
const _flushQ = () => {
	for (let obs: IObs<TObsKind> | undefined; _iQ < _Q.length && (obs = _Q[_iQ++]); ) {
		if (obs[_active]) {
			obs[_inQ] = false;
			_compDeep(obs);
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

let _curComp: IObs<TObsKind> | undefined;

let _curErr: Error | undefined;

let _lastUpdateID = 0;

// perf code golf! (interned single-char string memory alloc less than number / boolean)
// // const STATE_UNKNOWN = 0;
// const RESOLVED = 1 << 0; // 1
// const DIRTY = 1 << 1; // 2
// const DIRTY_CHILDS = 1 << 2; // 4
const RESOLVED = '0';
const DIRTY = '1';
const DIRTY_CHILDS = '2';

// ----------------
// </GLOBAL STATE>
// ----------------

// ----------------
// <OBSERVANT COMP CONSTRUCTOR>
// ----------------

// perf code golf! Object.freeze() causes major positive impact in Chrome
// (same in Firefox and Safari) ... but kills perf in NodeJS V8! (thus the isNode check)

const _evts: unique symbol = Symbol();
const _pars: unique symbol = Symbol();
const _childs: unique symbol = Symbol();
const _wired: unique symbol = Symbol();
const _active: unique symbol = Symbol();
const _inQ: unique symbol = Symbol();
const _inComp: unique symbol = Symbol();
const _updateID: unique symbol = Symbol();
const _err: unique symbol = Symbol();
const _state: unique symbol = Symbol();
const _v: unique symbol = Symbol();
const _compFn: unique symbol = Symbol();

const OO = {
	// prototype: null,
	[_evts]: undefined,
	[_pars]: undefined,
	[_childs]: undefined,
	[_wired]: false,
	[_active]: false,
	[_inQ]: false,
	[_inComp]: false,
	[_updateID]: -1,
	[_err]: undefined,
	[_state]: DIRTY,
	[_v]: undefined,
	[_compFn]: undefined,
};
const O = isNode ? OO : Object.freeze(Object.assign(Object.create(null), OO));

export const obs = <T = TObsKind>(v: T | TObsCompFn<T>, opts?: TObsOptions<T>): TObs<T> => {
	// perf code golf! (object spread works best in Chrome, Safari and Firefox ... and NodeJS)
	// Object.create(null) kills perf in Chrome!
	// const thiz = {} as IObs<T>;
	// const thiz = Object.create(null) as IObs<T>;
	// const thiz = Object.create(Object.prototype) as IObs<T>;
	// const thiz = Object.assign( .... , O);
	// const thiz = {...O} as IObs<T>;
	// const thiz = Object.seal( ...... ) as IObs<T>;
	// const thiz = Object.seal(Object.assign({}, O)) as IObs<T>;
	// const thiz = Object.seal({ ...O }) as IObs<T>;
	const thiz = (isNode ? { ...O } : Object.assign({}, O)) as IObs<T>;
	// const thiz = { ...O } as IObs<T>;
	// thiz.prototype = null;
	// Object.setPrototypeOf(thiz, null);

	if (typeof v === 'function') {
		// thiz[_state] = DIRTY;
		// thiz[_v] = undefined;

		thiz[_compFn] = v as TObsCompFn<T>;
	} else {
		thiz[_state] = RESOLVED;
		thiz[_v] = v as T;

		// thiz[_compFn] = undefined;
	}

	if (opts && opts.run) {
		run(thiz);
	}

	return thiz;
};

// ----------------
// </OBSERVANT COMP CONSTRUCTOR>
// ----------------

// ----------------
// <OBSERVANT PUBLICS>
// ----------------

export const get = <T = TObsKind>(thiz: TObs<T>): T => {
	if ((thiz as IObs<T>)[_state] !== RESOLVED && (thiz as IObs<T>)[_updateID] !== _lastUpdateID) {
		// DIRTY || DIRTY_CHILDS
		_compDeep(thiz as IObs<T>);
	}

	if (_curComp && _curComp !== (thiz as unknown as IObs<TObsKind>)) {
		if (!_curComp[_childs]) {
			_curComp[_childs] = [thiz as unknown as IObs<TObsKind>];
		} else if (!inArray(_curComp[_childs], thiz) && _curComp[_childs]) {
			_curComp[_childs].push(thiz as unknown as IObs<TObsKind>);
		}
	}

	if ((thiz as IObs<T>)[_err]) {
		throw (thiz as IObs<T>)[_err];
	}

	// guaranteed defined, because _compDeep((thiz as IObs<T>)) sets thiz[_v] or sets thiz[_err] (which bails out in the conditional above)
	return (thiz as IObs<T>)[_v] as T;
};

export const peek = <T = TObsKind>(thiz: TObs<T>): T | undefined => {
	if ((thiz as IObs<T>)[_err]) {
		throw (thiz as IObs<T>)[_err];
	}
	return (thiz as IObs<T>)[_v];
};

export const set = <T = TObsKind>(thiz: TObs<T>, val: T | ((curV: T | undefined) => T)): void => {
	if ((thiz as IObs<T>)[_compFn]) {
		throw Error(ERR_SET_COMP);
	}

	if (typeof val === 'function') {
		// eslint-disable-next-line @typescript-eslint/ban-types
		_val(thiz as IObs<T>, (val as Function)((thiz as IObs<T>)[_v]));
	} else {
		_val(thiz as IObs<T>, val);
	}
};

export const off = <T = TObsKind>(thiz: TObs<T>) => {
	_off(thiz as IObs<T>);

	for (
		let pars = (thiz as IObs<T>)[_pars], i = pars ? pars.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= pars!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		off(pars![--i]);
	}
};

export const on = <T = TObsKind>(thiz: TObs<T>, evtCB: TObsEventCallback<T>): (() => void) => {
	if ((thiz as IObs<T>)[_childs]) {
		_compDeep(thiz as IObs<T>);
	}

	const evtCBs = (thiz as IObs<T>)[_evts];
	// if (!evtCBs) {
	// 	(thiz as IObs<T>)[_evts] = [evtCB];
	// } else if (!inArray(evtCBs, evtCB)) {
	// 	evtCBs.push(evtCB);
	// }
	if (!evtCBs) {
		(thiz as IObs<T>)[_evts] = evtCB;
	} else if (Array.isArray(evtCBs)) {
		if (!inArray(evtCBs, evtCB)) {
			evtCBs.push(evtCB);
		}
	} else if (evtCBs !== evtCB) {
		(thiz as IObs<T>)[_evts] = [evtCBs, evtCB];
	}

	_act(thiz as IObs<T>, true);

	return () => {
		_off(thiz as IObs<T>, evtCB);
	};
};

export const run = <T = TObsKind>(thiz: TObs<T>): void => {
	if ((thiz as IObs<T>)[_childs]) {
		_compDeep(thiz as IObs<T>);
	}

	_act(thiz as IObs<T>, true);

	get(thiz as IObs<T>);
};

// ----------------
// </OBSERVANT PUBLICS>
// ----------------

// ----------------
// <OBSERVANT INTERNALS>
// ----------------

const _act = <T = TObsKind>(thiz: IObs<T>, solved: boolean) => {
	thiz[_wired] = true;
	_lnk(thiz, solved);
};

const _deact = <T = TObsKind>(thiz: IObs<T>) => {
	if (thiz[_wired] && !thiz[_pars] && !thiz[_evts]) {
		thiz[_wired] = false;
		_unlnk(thiz);
	}
};

const _off = <T = TObsKind>(thiz: IObs<T>, evtCB?: TObsEventCallback<T>) => {
	if (thiz[_childs]) {
		_compDeep(thiz);
	}

	if (evtCB) {
		const evtCBs = thiz[_evts];
		if (evtCBs) {
			// let i = evtCBs.length;
			// if (i === 1) {
			// 	if (evtCBs[0] === evtCB) {
			// 		thiz[_evts] = undefined;
			// 	}
			// } else {
			// 	for (; i !== 0; ) {
			// 		if (evtCBs[--i] === evtCB) {
			// 			evtCBs.splice(i, 1);
			// 			break;
			// 		}
			// 	}
			// }
			if (!Array.isArray(evtCBs)) {
				if (evtCBs === evtCB) {
					thiz[_evts] = undefined;
				}
			} else {
				let i = evtCBs.length;
				if (i === 1) {
					if (evtCBs[0] === evtCB) {
						thiz[_evts] = undefined;
					}
				} else {
					for (; i !== 0; ) {
						if (evtCBs[--i] === evtCB) {
							evtCBs.splice(i, 1);
							break;
						}
					}
				}
			}
		}
	} else {
		thiz[_evts] = undefined;
	}

	_deact(thiz);
};

const _tryEmit = <T = TObsKind>(
	evtCB: TObsEventCallback<T>,
	curV: T | undefined,
	prevV: T | undefined,
	err: Error | undefined,
) => {
	try {
		evtCB(err, curV, prevV);
	} catch (_ex) {
		// noop (ignore)
	}
};

const _emit = <T = TObsKind>(thiz: IObs<T>, curV: T | undefined, prevV: T | undefined, err: Error | undefined) => {
	const evtCBs = thiz[_evts];
	if (evtCBs) {
		// for (let i = evtCBs.length; i !== 0; ) {
		// 	_tryEmit(evtCBs[--i], curV, prevV, err);
		// }
		if (Array.isArray(evtCBs)) {
			let i = evtCBs.length;
			if (i === 1) {
				_tryEmit(evtCBs[0], curV, prevV, err);
			} else {
				for (; i !== 0; ) {
					_tryEmit(evtCBs[--i], curV, prevV, err);
				}
			}
		} else {
			_tryEmit(evtCBs, curV, prevV, err);
		}
	}
};

const _lnkDeep = <T = TObsKind>(thiz: IObs<T>, par: IObs<T>, solved: boolean) => {
	if (thiz !== par) {
		if (thiz[_pars]) {
			thiz[_pars].push(par);
		} else {
			thiz[_pars] = [par];
		}
	}

	_act(thiz, solved);
};

const _lnk = <T = TObsKind>(thiz: IObs<T>, solved: boolean) => {
	if (!thiz[_active] && thiz[_compFn] && thiz[_childs]) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		for (let childs = thiz[_childs], i = childs ? childs.length : 0; i !== 0 && i <= childs!.length; ) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_lnkDeep(childs![--i], thiz, solved);
		}

		if (solved) {
			thiz[_state] = RESOLVED;
		}

		thiz[_active] = true;
	}
};

const _unlnkDeep = <T = TObsKind>(thiz: IObs<T>, par: TObs<T>) => {
	const pars = thiz[_pars];
	if (pars) {
		let i = pars ? pars.length : 0;
		if (i === 1) {
			thiz[_pars] = undefined;
		} else {
			for (; i !== 0 && i <= pars.length; ) {
				if (pars[--i] === par) {
					pars.splice(i, 1);
					break;
				}
			}
		}

		_deact(thiz);
	}
};

const _unlnk = <T = TObsKind>(thiz: IObs<T>) => {
	if (thiz[_active]) {
		for (
			let childs = thiz[_childs], i = childs ? childs.length : 0;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			i !== 0 && i <= childs!.length;

		) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_unlnkDeep(thiz, childs![--i]);
		}

		thiz[_state] = DIRTY;

		thiz[_active] = false;
	}
};

const _feedQ = <T = TObsKind>(thiz: IObs<T>, dirty: boolean) => {
	thiz[_state] = dirty ? DIRTY : DIRTY_CHILDS;
	const pars = thiz[_pars];
	if (pars) {
		for (let i = pars.length; i !== 0 && i <= pars.length; ) {
			const par = pars[--i];
			if (par[_state] === RESOLVED) {
				_feedQ(par, false);
			}
		}
	} else if (!thiz[_inQ]) {
		thiz[_inQ] = true;
		const i = _Q.push(thiz as unknown as IObs<TObsKind>);
		if (i === 1) {
			ticker(_flushQ);
		}
	}
};

const _compDeep = <T = TObsKind>(thiz: IObs<T>) => {
	if (thiz[_state] !== RESOLVED) {
		if (thiz[_state] === DIRTY) {
			if (thiz[_compFn]) {
				_comp(thiz);
			}
			return;
		}

		// DIRTY_CHILDS

		for (
			let childs = thiz[_childs], i = childs ? childs.length : 0;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			i !== 0 && i <= childs!.length;

		) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_compDeep(childs![--i]);

			// @ts-expect-error TS2367
			if (thiz[_state] === DIRTY) {
				if (thiz[_compFn]) {
					_comp(thiz);
				}
				return;
			}
		}

		thiz[_state] = RESOLVED;
	}
};

const _comp = <T = TObsKind>(thiz: IObs<T>) => {
	if (thiz[_compFn]) {
		if (thiz[_inComp]) {
			throw Error(ERR_CIRCULAR);
		}
		thiz[_inComp] = true;

		const prevComp = _curComp;
		_curComp = thiz as unknown as IObs<TObsKind>;

		const prevChilds = thiz[_childs];
		thiz[_childs] = undefined;

		let compVal: T | undefined;
		let compErr: Error | undefined;
		try {
			compVal = thiz[_compFn](thiz[_v]);
		} catch (err) {
			compErr = _curErr = mkError(err);
		}

		_curComp = prevComp;

		thiz[_inComp] = false;

		if (thiz[_wired]) {
			let count = 0;

			const childs = thiz[_childs] as IObs<T>[typeof _childs];

			const l = childs ? childs.length : 0;

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			for (let i = l; i !== 0 && i <= childs!.length; ) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const child = childs![--i];

				if (!inArray(prevChilds, child)) {
					_lnkDeep(child, thiz, false);
					count++;
				}
			}

			let k = prevChilds ? prevChilds.length : 0;
			if (k !== 0 && (l === 0 || l - count < k)) {
				for (; k !== 0; ) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const prevChild = prevChilds![--k];
					if (l === 0 || !inArray(childs, prevChild)) {
						_unlnkDeep(prevChild, thiz);
					}
				}
			}

			if (l !== 0) {
				thiz[_active] = true;
			} else {
				thiz[_active] = false;
				thiz[_state] = RESOLVED;
			}
		} else {
			thiz[_state] = thiz[_childs] ? DIRTY : RESOLVED;
		}

		if (typeof compVal !== 'undefined') {
			_val(thiz, compVal);
			return;
		}

		if (compErr) {
			_emitErr(thiz, _curErr);

			if (thiz[_active]) {
				thiz[_state] = RESOLVED;
			}
		}
	}
};

const _val = <T = TObsKind>(thiz: IObs<T>, newV: T) => {
	if (thiz[_err]) {
		_emitErr(thiz, undefined);
	}

	if (thiz[_active]) {
		thiz[_state] = RESOLVED;
	}

	thiz[_updateID] = ++_lastUpdateID;

	const prevV = thiz[_v];
	if (newV !== prevV) {
		thiz[_v] = newV;

		for (
			let pars = thiz[_pars], i = pars ? pars.length : 0;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			i !== 0 && i <= pars!.length;

		) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_feedQ(pars![--i], true);
		}

		if (thiz[_evts]) {
			_emit(thiz, newV, prevV, undefined);
		}
	}
};

const _emitErr = <T = TObsKind>(thiz: IObs<T>, error: Error | undefined) => {
	if (thiz[_err] !== error) {
		thiz[_err] = error;

		thiz[_updateID] = ++_lastUpdateID;

		if (error) {
			_emit(thiz, undefined, undefined, error);
		}

		for (
			let pars = thiz[_pars], i = pars ? pars.length : 0;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			i !== 0 && i <= pars!.length;

		) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_emitErr(pars![--i], error);
		}
	}
};

// ----------------
// </OBSERVANT INTERNALS>
// ----------------

// ----------------
// <TYPES>
// ----------------

// --- external API

export type TObsEventCallback<T> = (error: Error | undefined, curV: T | undefined, prevV: T | undefined) => void;

export type TObsPrimitive = null | number | string | boolean;
export type TObsKind = TObsPrimitive | Array<TObsPrimitive> | Record<string, unknown>;
export type TObsCompFn<T> = (curV: T | undefined) => T;

export type TObs<_T = TObsKind> = {
	// noop
};

export type TObsOptions<_T = TObsKind> = {
	run?: boolean;
};

// --- internal API

type TObsTick = (func: () => void) => void;

type TObsEventCallbacks<T> = TObsEventCallback<T> | TObsEventCallback<T>[] | undefined;
// type TObsEventCallbacks<T> = TObsEventCallback<T>[] | undefined;

interface IObs<T = TObsKind> {
	[_evts]: TObsEventCallbacks<T>;

	[_v]?: T;

	[_state]: typeof RESOLVED | typeof DIRTY | typeof DIRTY_CHILDS;

	[_inQ]: boolean;

	[_compFn]?: TObsCompFn<T>;
	[_inComp]: boolean;

	[_pars]?: Array<IObs<T>>;

	[_wired]: boolean;

	[_active]: boolean;

	[_childs]?: Array<IObs<T>>;

	[_updateID]: number;

	[_err]?: Error;
}

// ----------------
// </TYPES>
// ----------------

// // ----------------
// // <OBSERVANT CLASS>
// // ----------------

// // interface IObsConstructor<T> extends TObs<T> {
// // 	new (v: T | TObsCompFn<T>, opts?: TObsOptions<T>): TObs<T>;
// // 	(v: T | TObsCompFn<T>, opts?: TObsOptions<T>): TObs<T>;
// // }

// export interface IObs<T> {
// 	get: () => T;
// 	peek: () => T | undefined;
// 	set: (val: T | ((curV: T | undefined) => T)) => this;

// 	off: () => this;

// 	onChange: (evtCB: TObsEventCallbackChange<T>) => () => this;
// 	onError: (evtCB: TObsEventCallbackError) => () => this;

// 	run: () => void;
// }

// export const makeObs = <T = TObsKind>(v: T | TObsCompFn<T>, opts?: TObsOptions<T>): TObs<T> =>
// 	// new (Obs as IObsConstructor<T>)(v, opts);
// 	new Obs(v, opts);

// export class Obs<T = TObsKind> {
// 	declare readonly _thiz: IObs<T>;

// 	constructor(v: T | TObsCompFn<T>, opts?: TObsOptions<T>) {
// 		this._thiz = obs(v, opts) as IObs<T>;
// 	}

// 	get(): T {
// 		return get(this._thiz);
// 	}

// 	peek(): T | undefined {
// 		return peek(this._thiz);
// 	}

// 	set(v: T | ((curV: T | undefined) => T)): void {
// 		set(this._thiz, v);
// 	}

// 	off() {
// 		off(this._thiz);
// 	}

// 	onChange(evtCB: TObsEventCallbackChange<T>): () => TObs<T> {
// 		return onChange(this._thiz, evtCB);
// 	}

// 	onError(evtCB: TObsEventCallbackError): () => TObs<T> {
// 		return onError(this._thiz, evtCB);
// 	}

// 	run(): void {
// 		run(this._thiz);
// 	}
// }

// Object.freeze(Obs.prototype);

// class Obs {
//     constructor(v, opts) {
//         this.thiz = obs(v, opts);
//     }
//     get() {
//         return get(this.thiz);
//     }
//     set(val) {
//         return set(this.thiz, val);
//     }
// }

// function Obs (v, opts) {
//     if (!this) {
//         return new Obs(v, opts);
//     }
//     this.thiz = obs(v, opts);
// }
// // const proto = Object.create(null);
// // proto.get = function () {
// //     return get(this.thiz);
// // }
// // proto.set = function (val) {
// //     return set(this.thiz, val);
// // }
// const obj = {
//     get: function () {
//         return get(this.thiz);
//     },
//     set: function (val) {
//         return set(this.thiz, val);
//     }
// };
// // obj.prototype = null;
// Object.setPrototypeOf(obj, null);
// const proto = Object.create(obj);
// Obs.prototype = Object.freeze(proto);

// // ----------------
// // </OBSERVANT CLASS>
// // ----------------

// const start = {
//     prop1: observant.obs(1),
//     prop2: observant.obs(2),
//     prop3: observant.obs(3),
//     prop4: observant.obs(4),
// };

// let onC = 0;

// let layer = start;
// for (let i = 5000; i > 0; i--) {
//     layer = (function (m) {
//         const s = {
//             prop1: observant.obs(
//                 function () {
//                     return observant.get(m.prop2);
//                 },
//                 { run: true },
//             ),
//             prop2: observant.obs(
//                 function () {
//                     return observant.get(m.prop1) - observant.get(m.prop3);
//                 },
//                 { run: true },
//             ),
//             prop3: observant.obs(
//                 function () {
//                     return observant.get(m.prop2) + observant.get(m.prop4);
//                 },
//                 { run: true },
//             ),
//             prop4: observant.obs(
//                 function () {
//                     return observant.get(m.prop3);
//                 },
//                 { run: true },
//             ),
//         };

//         observant.on(s.prop1, () => {onC++});
//         observant.on(s.prop2, () => {onC++});
//         observant.on(s.prop3, () => {onC++});
//         observant.on(s.prop4, () => {onC++});

//         return s;
//     })(layer);
// }

// const end = layer;

// console.log(observant.get(end.prop1) === 2);
// console.log(observant.get(end.prop2) === 4);
// console.log(observant.get(end.prop3) === -1);
// console.log(observant.get(end.prop4) === -6);

// const timeStart = performance.now();

// observant.set(start.prop1, 4);
// observant.set(start.prop2, 3);
// observant.set(start.prop3, 2);
// observant.set(start.prop4, 1);

// console.log(observant.get(end.prop1) === -2);
// console.log(observant.get(end.prop2) === 1);
// console.log(observant.get(end.prop3) === -4);
// console.log(observant.get(end.prop4) === -4);

// const duration = performance.now() - timeStart;

// console.log(duration);

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

// 	let onC = 0;
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

// 				observant.on(next.prop1, () => {onC++});
// 				observant.on(next.prop2, () => {onC++});
// 				observant.on(next.prop3, () => {onC++});
// 				observant.on(next.prop4, () => {onC++});

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
