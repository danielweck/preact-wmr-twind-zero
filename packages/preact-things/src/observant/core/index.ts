// SIZE LIMIT :| [./dist/observant.terser-rollup.js] (2479)
// SIZE LIMIT :| [./dist/observant.terser-rollup.js.gz] (1078)
// SIZE LIMIT :| [./dist/observant.terser-rollup.js.br] (1002)
// SIZE LIMIT :| [./dist/observant.esbuild.js] (3567)
// SIZE LIMIT :| [./dist/observant.esbuild.js.gz] (1429)
// SIZE LIMIT :| [./dist/observant.esbuild.js.br] (1320)

// ----------------
// <ERROR HANDLING>
// ----------------

const mkError = (err: unknown) => (err instanceof Error ? err : Error(String(err)));

const ERR_CIRCULAR = 'ErRoR1';
const ERR_SET_COMP = 'ErRoR2';

// ----------------
// </ERROR HANDLING>
// ----------------

// ----------------
// <GLOBAL STATE>
// ----------------

let _curComp: IObs<TObsKind> | null = null;

let _curErr: Error | null = null;

let _lastUpdateID = 0;

let _inCompPars = false;
let _inCompParsQ: IObs<TObsKind>[] | null = null;

export const reset = () => {
	_curComp = null;
	_curErr = null;
	_lastUpdateID = 0;
	_inCompPars = false;
	_inCompParsQ = null;
};

// ----------------
// </GLOBAL STATE>
// ----------------

// ----------------
// <OBSERVANT CONSTRUCTOR>
// ----------------

export const obs = <T = TObsKind>(v: T | TObsCompFn<T>, opts?: TObsOptions<T>): TObs<T> => {
	const fn = typeof v === 'function';

	const thiz = {
		_evts: null,
		_pars: null,
		_childsPrev: null,
		_childsI: -1,
		_childs: null,
		_inComp: false,
		_updateID: -1,
		_err: null,
		_compFn: fn ? v : null,
		_eq: opts ? opts.equals : null,
		_dirty: fn,
		_v: fn ? undefined : v,
	} as IObs<T>;

	if (opts && opts.run) {
		get(thiz);
	}

	return thiz;
};

// ----------------
// </OBSERVANT CONSTRUCTOR>
// ----------------

// ----------------
// <OBSERVANT PUBLICS>
// ----------------

export const get = <T = TObsKind>(thiz: TObs<T>): T => {
	if ((thiz as IObs<T>)._dirty && (thiz as IObs<T>)._compFn) {
		_comp(thiz as IObs<T>);
	}

	if (_curComp && _curComp !== thiz) {
		if (_curComp._childs) {
			if (
				// @ts-expect-error TS2345
				!_curComp._childs.includes(thiz) &&
				!_childsPrevInclude(thiz as IObs<T>)
			) {
				// @ts-expect-error TS2345
				_curComp._childs.push(thiz);

				if ((thiz as IObs<T>)._pars) {
					// TODO??
					// if (!thiz._pars.includes(_curComp))

					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					((thiz as IObs<T>)._pars! as Array<IObs<TObsKind>>).push(_curComp);
				} else {
					// @ts-expect-error TS2322
					(thiz as IObs<T>)._pars = [_curComp];
				}
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const i = _curComp._childsI! + 1;
			if (_curComp._childsPrev && i < _curComp._childsPrev.length && _curComp._childsPrev[i] === thiz) {
				_curComp._childsI = i;
			} else if (!_childsPrevInclude(thiz as IObs<T>)) {
				// @ts-expect-error TS2322
				_curComp._childs = [thiz];

				if ((thiz as IObs<T>)._pars) {
					// TODO??
					// if (!thiz._pars.includes(_curComp))

					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					((thiz as IObs<T>)._pars! as Array<IObs<TObsKind>>).push(_curComp);
				} else {
					// @ts-expect-error TS2322
					(thiz as IObs<T>)._pars = [_curComp];
				}
			}
		}
	}

	if ((thiz as IObs<T>)._err) {
		throw (thiz as IObs<T>)._err;
	}

	// guaranteed defined, because _compDeep((thiz as IObs<T>)) sets thiz._v or sets thiz._err (which bails out in the conditional above)
	return (thiz as IObs<T>)._v as T;
};

export const peek = <T = TObsKind>(thiz: TObs<T>): T | undefined => {
	if ((thiz as IObs<T>)._err) {
		throw (thiz as IObs<T>)._err;
	}
	return (thiz as IObs<T>)._v;
};

export const set = <T = TObsKind>(thiz: TObs<T>, val: T | TObsCompFn<T>): void => {
	if ((thiz as IObs<T>)._compFn) {
		throw Error(ERR_SET_COMP);
	}

	(thiz as IObs<T>)._updateID = ++_lastUpdateID;

	if (typeof val === 'function') {
		// eslint-disable-next-line @typescript-eslint/ban-types
		_val(thiz as IObs<T>, (val as Function)((thiz as IObs<T>)._v));
	} else {
		_val(thiz as IObs<T>, val);
	}
};

export const off = <T = TObsKind>(thiz: TObs<T>) => {
	_off(thiz as IObs<T>);

	for (
		let pars = (thiz as IObs<T>)._pars, i = pars ? pars.length : 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		i !== 0 && i <= pars!.length;

	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		off(pars![--i]);
	}
};

export const on = <T = TObsKind>(thiz: TObs<T>, evtCB: TObsEventCallback<T>): (() => void) => {
	const evtCBs = (thiz as IObs<T>)._evts;
	if (!evtCBs) {
		(thiz as IObs<T>)._evts = evtCB;
	} else if (Array.isArray(evtCBs)) {
		if (!evtCBs.includes(evtCB)) {
			evtCBs.push(evtCB);
		}
	} else if (evtCBs !== evtCB) {
		(thiz as IObs<T>)._evts = [evtCBs, evtCB];
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
		const evtCBs = thiz._evts;
		if (evtCBs) {
			if (Array.isArray(evtCBs)) {
				let i = evtCBs.length;
				if (i === 1) {
					if (evtCBs[0] === evtCB) {
						thiz._evts = null;
					}
				} else {
					for (; i !== 0; ) {
						if (evtCBs[--i] === evtCB) {
							evtCBs.splice(i, 1);
							break;
						}
					}
				}
			} else if (evtCBs === evtCB) {
				thiz._evts = null;
			}
		}
	} else {
		thiz._evts = null;
	}
};

const _tryEmit = <T = TObsKind>(
	evtCB: TObsEventCallback<T>,
	curV: T | null,
	prevV: T | undefined | null,
	err: Error | null,
) => {
	try {
		evtCB(err, curV, prevV);
	} catch (_ex) {
		// noop (ignore)
	}
};

const _emit = <T = TObsKind>(thiz: IObs<T>, curV: T | null, prevV: T | undefined | null, err: Error | null) => {
	const evtCBs = thiz._evts;
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
	const pars = thiz._pars;
	if (pars) {
		let i = pars ? pars.length : 0;
		if (i === 1) {
			if (pars[0] === par) {
				thiz._pars = null;
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

const _compPars = <T = TObsKind>(thiz: IObs<T>) => {
	_inCompPars = true;
	_inCompParsQ = null;

	for (let pars = thiz._pars ? thiz._pars.slice() : null, i = 0, l = pars ? pars.length : -1; i < l; i++) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const p = pars![i];
		p._dirty = true;
		// thiz._compFn guaranteed NOT null (because parent link)
		_comp(p);
	}

	_inCompPars = false;

	if (_inCompParsQ) {
		const q = (_inCompParsQ as IObs<T>[]).slice();
		// _inCompParsQ = null;
		for (let i = 0, l = q.length; i < l; i++) {
			_compPars(q[i]);
		}
	}
};

const _comp = <T = TObsKind>(thiz: IObs<T>) => {
	// thiz._compFn guaranteed NOT null (call sites)
	if (thiz._updateID === _lastUpdateID) {
		return;
	}

	if (thiz._inComp) {
		throw Error(ERR_CIRCULAR);
	}
	thiz._inComp = true;

	const prevComp = _curComp;
	_curComp = thiz as unknown as IObs<TObsKind>;

	thiz._childsPrev = thiz._childs;
	thiz._childsI = -1;

	thiz._childs = null;

	let compVal: T | undefined;
	let compErr: Error | undefined;
	try {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		compVal = thiz._compFn!(thiz._v);
	} catch (err) {
		compErr = _curErr = mkError(err);
		if (compErr.message === ERR_CIRCULAR) {
			throw compErr;
		}
	}

	_curComp = prevComp;

	thiz._inComp = false;

	if (!thiz._childs) {
		if (thiz._childsPrev) {
			if (thiz._childsI === thiz._childsPrev.length - 1) {
				thiz._childs = thiz._childsPrev;
			} else {
				let i = thiz._childsI + 1;
				thiz._childs = thiz._childsPrev.slice(0, i);

				for (; i < thiz._childsPrev.length; i++) {
					const child = thiz._childsPrev[i];
					_unlink(child, thiz);
				}
			}
		}
	} else if (thiz._childsPrev) {
		if (thiz._childsI === thiz._childsPrev.length - 1) {
			thiz._childs = thiz._childsPrev.concat(thiz._childs);
		} else {
			let i = thiz._childsI + 1;

			for (; i < thiz._childsPrev.length; i++) {
				const child = thiz._childsPrev[i];
				_unlink(child, thiz);
			}

			i = thiz._childsI + 1;

			thiz._childsPrev.length = i;
			// thiz._childsPrev = thiz._childsPrev.slice(0, i);
			thiz._childs = thiz._childsPrev.concat(thiz._childs);
		}
	}

	thiz._childsPrev = null;
	thiz._childsI = -1;

	if (compErr) {
		// console.log(compErr); // TODO: default error handler?
		thiz._dirty = false;
		thiz._updateID = _lastUpdateID;
		_emitErr(thiz, _curErr);
		return;
	}

	_val(thiz, compVal as T);
};

const _val = <T = TObsKind>(thiz: IObs<T>, newV: T) => {
	thiz._dirty = false;
	thiz._updateID = _lastUpdateID;

	if (thiz._err) {
		_emitErr(thiz, null);
	}

	const prevV = thiz._v;
	if (thiz._eq === false ? true : thiz._eq ? !thiz._eq(prevV as TObsKind, newV as TObsKind) : newV !== prevV) {
		thiz._v = newV;

		if (_inCompPars) {
			if (_inCompParsQ) {
				_inCompParsQ.push(thiz as IObs<TObsKind>);
			} else {
				_inCompParsQ = [thiz as IObs<TObsKind>];
			}

			for (let pars = thiz._pars ? thiz._pars : null, i = 0, l = pars ? pars.length : -1; i < l; i++) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				pars![i]._dirty = true;
			}
		} else {
			_compPars(thiz);
		}

		if (thiz._evts) {
			_emit(thiz, newV, prevV, null);
		}
	}
};

const _emitErr = <T = TObsKind>(thiz: IObs<T>, error: Error | null) => {
	if (thiz._err !== error) {
		thiz._err = error;

		if (error) {
			_emit(thiz, null, null, error);
		}

		for (
			let pars = thiz._pars, i = pars ? pars.length : 0;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			i !== 0 && i <= pars!.length;

		) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_emitErr(pars![--i], error);
		}
	}
};
const _childsPrevInclude = <T = TObsKind>(thiz: IObs<T>) => {
	let inc = false;
	if (_curComp && _curComp._childsPrev) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		for (let i = 0; i <= _curComp._childsI!; i++) {
			if (_curComp._childsPrev[i] === thiz) {
				inc = true;
				break;
			}
		}
	}
	return inc;
};

// ----------------
// </OBSERVANT INTERNALS>
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
// <TYPES>
// ----------------

// --- external API

export type TObsEventCallback<T> = (error: Error | null, curV: T | null, prevV: T | undefined | null) => void;

export type TObsPrimitive = null | number | string | boolean;
export type TObsKind = TObsPrimitive | Array<TObsPrimitive> | Record<string, unknown>;
export type TObsCompFn<T> = (curV: T | undefined) => T;

export type TObs<_T = TObsKind> = {
	// noop
};

export type TObsOptions<T = TObsKind> = {
	equals?: false | ((v1: T | undefined, v2: T | undefined) => boolean);
	run?: boolean;
};

// --- internal API

type TObsEventCallbacks<T> = TObsEventCallback<T> | TObsEventCallback<T>[] | null;

interface IObs<T = TObsKind> {
	_evts: TObsEventCallbacks<T>;

	_v?: T;

	_dirty: boolean;

	_compFn: TObsCompFn<T> | null;
	_inComp: boolean;

	_pars: Array<IObs<T>> | null;

	_childs: Array<IObs<T>> | null;
	_childsPrev: Array<IObs<T>> | null;
	_childsI: number;

	_updateID: number;

	_err: Error | null;

	_eq: TObsOptions['equals'] | null;
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
