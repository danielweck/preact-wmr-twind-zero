// SIZE LIMIT :) [./dist/observant.terser-rollup.js] (2995 <= 2995)
// SIZE LIMIT :) [./dist/observant.terser-rollup.js.gz] (1336 <= 1336)
// SIZE LIMIT :) [./dist/observant.terser-rollup.js.br] (1217 <= 1217)
// SIZE LIMIT :) [./dist/observant.esbuild.js] (4051 <= 4051)
// SIZE LIMIT :) [./dist/observant.esbuild.js.gz] (1697 <= 1697)
// SIZE LIMIT :) [./dist/observant.esbuild.js.br] (1538 <= 1538)

const isNode = typeof globalThis.process !== 'undefined';

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

// const inArray = <T>(arr: T[] | undefined, v: T): boolean | void => {
// 	for (let i = arr ? arr.length : 0; i !== 0; ) {
// 		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
// 		if (arr![--i] === v) {
// 			return true;
// 		}
// 	}
// };

// // faster (?) Array.concat()
// // https://github.com/stardazed/stardazed/blob/0d0f3935a7679bf5819277feaf2c8e0e971db00a/src/core/buffer.ts#L75
// const MAX_BLOCK_SIZE = 65535; // max parameter array size for use in Webkit
// function appendArrayInPlace(dest, source) {
// 	let offset = 0;
// 	let itemsLeft = source.length;

// 	if (itemsLeft <= MAX_BLOCK_SIZE) {
// 		dest.push.apply(dest, source);
// 	} else {
// 		while (itemsLeft > 0) {
// 			const pushCount = Math.min(MAX_BLOCK_SIZE, itemsLeft);
// 			const subSource = source.slice(offset, offset + pushCount);
// 			dest.push.apply(dest, subSource);
// 			itemsLeft -= pushCount;
// 			offset += pushCount;
// 		}
// 	}
// 	return dest;
// }

// ----------------
// </FAST ARRAY UTILS>
// ----------------

// ----------------
// <GLOBAL STATE>
// ----------------

let _curComp: IObs<TObsKind> | undefined;

let _curErr: Error | undefined;

let _lastUpdateID = 0;

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
const _childsPrev = Symbol();
const _childsI = Symbol();
const _inComp: unique symbol = Symbol();
const _updateID: unique symbol = Symbol();
const _err: unique symbol = Symbol();
const _dirty: unique symbol = Symbol();
const _v: unique symbol = Symbol();
const _compFn: unique symbol = Symbol();

const OO = {
	// prototype: null,
	[_evts]: undefined,
	[_pars]: undefined,
	[_childsPrev]: undefined,
	[_childsI]: -1,
	[_childs]: undefined,
	[_inComp]: false,
	[_updateID]: -1,
	[_err]: undefined,
	[_dirty]: true,
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
		// thiz[_dirty] = true;
		// thiz[_v] = undefined;

		thiz[_compFn] = v as TObsCompFn<T>;
	} else {
		thiz[_dirty] = false;
		thiz[_v] = v as T;

		// thiz[_compFn] = undefined;
	}

	if (opts && opts.run) {
		get(thiz);
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
	if ((thiz as IObs<T>)[_dirty] && (thiz as IObs<T>)[_compFn]) {
		_comp(thiz as IObs<T>);
	}

	if (_curComp && _curComp !== thiz) {
		if (_curComp[_childs]) {
			if (
				!(thiz as IObs<T>)[_pars] ||
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				(_curComp[_childs].length < (thiz as IObs<T>)[_pars]!.length
					? // @ts-expect-error TS2345
					  !_curComp[_childs].includes(thiz)
					: // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					  !((thiz as IObs<T>)[_pars]! as Array<IObs<TObsKind>>).includes(_curComp))
			) {
				let inc = false;
				if (_curComp[_childsPrev]) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					for (let i = 0; i <= _curComp[_childsI]!; i++) {
						if (_curComp[_childsPrev][i] === thiz) {
							inc = true;
							break;
						}
					}
				}
				if (!inc) {
					// @ts-expect-error TS2345
					_curComp[_childs].push(thiz);

					if (!(thiz as IObs<T>)[_pars]) {
						// @ts-expect-error TS2322
						(thiz as IObs<T>)[_pars] = [_curComp];
					} else {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						((thiz as IObs<T>)[_pars]! as Array<IObs<TObsKind>>).push(_curComp);
					}
				}
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const i = _curComp[_childsI]! + 1;
			if (_curComp[_childsPrev] && i < _curComp[_childsPrev].length && _curComp[_childsPrev][i] === thiz) {
				_curComp[_childsI] = i;
			} else {
				// @ts-expect-error TS2322
				_curComp[_childs] = [thiz];

				if (!(thiz as IObs<T>)[_pars]) {
					// @ts-expect-error TS2322
					(thiz as IObs<T>)[_pars] = [_curComp];
				} else {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					((thiz as IObs<T>)[_pars]! as Array<IObs<TObsKind>>).push(_curComp);
				}
			}
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

	(thiz as IObs<T>)[_updateID] = ++_lastUpdateID;

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
	const evtCBs = (thiz as IObs<T>)[_evts];
	// if (!evtCBs) {
	// 	(thiz as IObs<T>)[_evts] = [evtCB];
	// } else if (!inArray(evtCBs, evtCB)) {
	// 	evtCBs.push(evtCB);
	// }
	if (!evtCBs) {
		(thiz as IObs<T>)[_evts] = evtCB;
	} else if (Array.isArray(evtCBs)) {
		if (!evtCBs.includes(evtCB)) {
			evtCBs.push(evtCB);
		}
	} else if (evtCBs !== evtCB) {
		(thiz as IObs<T>)[_evts] = [evtCBs, evtCB];
	}

	return () => {
		_off(thiz as IObs<T>, evtCB);
	};
};

// ----------------
// </OBSERVANT PUBLICS>
// ----------------

// ----------------
// <OBSERVANT INTERNALS>
// ----------------

const _off = <T = TObsKind>(thiz: IObs<T>, evtCB?: TObsEventCallback<T>) => {
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

const _unlink = <T = TObsKind>(thiz: IObs<T>, par: TObs<T>) => {
	const pars = thiz[_pars];
	if (pars) {
		let i = pars ? pars.length : 0;
		if (i === 1) {
			if (pars[0] === par) {
				thiz[_pars] = undefined;
			}
		} else {
			for (; i !== 0 && i <= pars.length; ) {
				if (pars[--i] === par) {
					pars.splice(i, 1);
					break;
				}
			}
		}
	}
};

let _compParenting = false;

const _compPars = <T = TObsKind>(thiz: IObs<T>) => {
	_compParenting = true;

	for (let pars = thiz[_pars] ? thiz[_pars].slice() : undefined, i = 0, l = pars ? pars.length : -1; i < l; i++) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (pars![i][_compFn]) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_comp(pars![i]);
		}
	}

	_compParenting = false;

	for (let pars = thiz[_pars], i = 0, l = pars ? pars.length : -1; i < l; i++) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (pars![i][_dirty]) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			pars![i][_dirty] = false;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_compPars(pars![i]);
		}
	}
};

const _comp = <T = TObsKind>(thiz: IObs<T>) => {
	if (thiz[_updateID] === _lastUpdateID) {
		return;
	}
	if (thiz[_compFn]) {
		if (thiz[_inComp]) {
			throw Error(ERR_CIRCULAR);
		}
		thiz[_inComp] = true;

		const prevComp = _curComp;
		_curComp = thiz as unknown as IObs<TObsKind>;

		thiz[_childsPrev] = thiz[_childs];
		thiz[_childsI] = -1;

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

		if (!thiz[_childs]) {
			if (thiz[_childsPrev]) {
				if (thiz[_childsI] === thiz[_childsPrev].length - 1) {
					thiz[_childs] = thiz[_childsPrev];
				} else {
					let i = thiz[_childsI] + 1;
					thiz[_childs] = thiz[_childsPrev].slice(0, i);

					for (; i < thiz[_childsPrev].length; i++) {
						const child = thiz[_childsPrev][i];
						_unlink(child, thiz);
					}
				}
			}
		} else if (thiz[_childsPrev]) {
			if (thiz[_childsI] === thiz[_childsPrev].length - 1) {
				thiz[_childs] = thiz[_childsPrev].concat(thiz[_childs]);
			} else {
				let i = thiz[_childsI] + 1;

				for (; i < thiz[_childsPrev].length; i++) {
					const child = thiz[_childsPrev][i];
					_unlink(child, thiz);
				}

				i = thiz[_childsI] + 1;

				thiz[_childsPrev].length = i;
				// thiz[_childsPrev] = thiz[_childsPrev].slice(0, i);
				thiz[_childs] = thiz[_childsPrev].concat(thiz[_childs]);
			}
		}

		thiz[_childsPrev] = undefined;
		thiz[_childsI] = -1;

		const childs = thiz[_childs];
		const l = childs ? childs.length : 0;

		if (l === 0) {
			thiz[_dirty] = false;
		}

		if (typeof compVal !== 'undefined') {
			_val(thiz, compVal);
			return;
		}

		if (compErr) {
			_emitErr(thiz, _curErr);

			thiz[_dirty] = false;
		}
	}
};

const _val = <T = TObsKind>(thiz: IObs<T>, newV: T) => {
	if (thiz[_err]) {
		_emitErr(thiz, undefined);
	}
	thiz[_dirty] = false;

	thiz[_updateID] = _lastUpdateID;

	const prevV = thiz[_v];
	if (newV !== prevV) {
		thiz[_v] = newV;

		if (_compParenting) {
			thiz[_dirty] = true;
		} else {
			_compPars(thiz);
		}

		if (thiz[_evts]) {
			_emit(thiz, newV, prevV, undefined);
		}
	}
};

const _emitErr = <T = TObsKind>(thiz: IObs<T>, error: Error | undefined) => {
	if (thiz[_err] !== error) {
		thiz[_err] = error;

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

type TObsEventCallbacks<T> = TObsEventCallback<T> | TObsEventCallback<T>[] | undefined;
// type TObsEventCallbacks<T> = TObsEventCallback<T>[] | undefined;

interface IObs<T = TObsKind> {
	[_evts]: TObsEventCallbacks<T>;

	[_v]?: T;

	[_dirty]: boolean;

	[_compFn]?: TObsCompFn<T>;
	[_inComp]: boolean;

	[_pars]?: Array<IObs<T>>;

	[_childs]?: Array<IObs<T>>;
	[_childsPrev]?: Array<IObs<T>>;
	[_childsI]?: number;

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
