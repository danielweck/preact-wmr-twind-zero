// SIZE LIMIT :| [./dist/observant.terser-rollup.js] (2343)
// SIZE LIMIT :| [./dist/observant.terser-rollup.js.gz] (1091)
// SIZE LIMIT :| [./dist/observant.terser-rollup.js.br] (1006)
// SIZE LIMIT :| [./dist/observant.esbuild.js] (2799)
// SIZE LIMIT :| [./dist/observant.esbuild.js.gz] (1336)
// SIZE LIMIT :| [./dist/observant.esbuild.js.br] (1220)

import type { IObs } from '../types/internal.js';
import type { TObs, TObsCompFn, TObsEventCallback, TObsKind, TObsOptions } from '../types/public.js';

// ----------------
// <ERROR HANDLING>
// ----------------

const mkError = (err: unknown) => (err instanceof Error ? err : Error(String(err)));

const ERR_CIRCULAR = 'ErRoR1';
// const ERR_SET_COMP = 'ErRoR2';

// ----------------
// </ERROR HANDLING>
// ----------------

// ----------------
// <GLOBAL STATE>
// ----------------

let _curComp: IObs<TObsKind> | null = null;

let _lastUpdateID = 0;

let _inCompPars = false;
let _inCompParsQ: IObs<TObsKind>[] | null = null;

let _skip = false;

export const reset = () => {
	_curComp = null;
	_lastUpdateID = 0;
	_inCompPars = false;
	_inCompParsQ = null;
	_skip = false;
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

	// if (!opts || !opts.lazy) {
	if (fn) {
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
	if ((thiz as IObs<T>)._dirty && (thiz as IObs<T>)._compFn && (thiz as IObs<T>)._updateID !== _lastUpdateID) {
		_comp(thiz as IObs<T>);
	}

	if (!_skip && _curComp) {
		const childs = _curComp._childs;
		const childsPrev = _curComp._childsPrev;
		let addToPars = false;
		if (childs) {
			if (
				// @ts-expect-error TS2345
				!childs.includes(thiz) &&
				(!childsPrev || !_childsPrevInclude(thiz as IObs<T>))
			) {
				// @ts-expect-error TS2345
				childs.push(thiz);
				addToPars = true;
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const i = _curComp._childsI! + 1;
			if (childsPrev && i < childsPrev.length && childsPrev[i] === thiz) {
				_curComp._childsI = i;
			} else if (!childsPrev || !_childsPrevInclude(thiz as IObs<T>)) {
				// @ts-expect-error TS2322
				_curComp._childs = [thiz];
				addToPars = true;
			}
		}
		if (addToPars) {
			if ((thiz as IObs<T>)._pars) {
				// // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				// if (((thiz as IObs<T>)._pars! as Array<IObs<TObsKind>>).includes(_curComp)) {
				// 	throw new Error('WTF?! 2');
				// }

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				((thiz as IObs<T>)._pars! as Array<IObs<TObsKind>>).push(_curComp);
			} else {
				// @ts-expect-error TS2322
				(thiz as IObs<T>)._pars = [_curComp];
			}
		}
	}

	if ((thiz as IObs<T>)._err) {
		throw (thiz as IObs<T>)._err;
	}

	// guaranteed defined, because _compDeep((thiz as IObs<T>)) sets thiz._v or sets thiz._err (which bails out in the conditional above)
	return (thiz as IObs<T>)._v as T;
};

export const skip = <T = unknown>(fn: () => T): T => {
	_skip = true;
	let v: T;
	try {
		v = fn();
	} finally {
		_skip = false;
	}
	return v;
};

export const set = <T = TObsKind>(thiz: TObs<T>, val: T | TObsCompFn<T>): void => {
	if ((thiz as IObs<T>)._compFn) {
		// throw Error(ERR_SET_COMP);
		return;
	}

	(thiz as IObs<T>)._updateID = ++_lastUpdateID;

	// eslint-disable-next-line @typescript-eslint/ban-types
	_val(thiz as IObs<T>, typeof val === 'function' ? (val as Function)((thiz as IObs<T>)._v) : val);
};

export const stop = <T = TObsKind>(thiz: TObs<T>): void => {
	_off(thiz as IObs<T>);

	for (let childs = (thiz as IObs<T>)._childs, i = childs ? childs.length : 0; i !== 0; ) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		_rmPar(childs![--i], thiz as IObs<T>);
	}
	(thiz as IObs<T>)._childs = null;

	// 	for (let pars = (thiz as IObs<T>)._pars, i = pars ? pars.length : 0; i !== 0; ) {
	// 		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	// 		stop(pars![--i]);
	// 	}
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

const _rmPar = <T = TObsKind>(thiz: IObs<T>, par: TObs<T>) => {
	const pars = thiz._pars;
	let i = pars ? pars.length : 0;
	if (i === 1) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (pars![0] === par) {
			thiz._pars = null;
		}
	} else {
		for (; i !== 0; ) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			if (pars![--i] === par) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				pars!.splice(i, 1);
				break;
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
		if (p._updateID !== _lastUpdateID) {
			_comp(p);
		}
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
	// if (thiz._updateID === _lastUpdateID) {
	// 	return;
	// }

	if (thiz._inComp) {
		throw Error(ERR_CIRCULAR);
	}
	thiz._inComp = true;

	const prevComp = _curComp;
	_curComp = thiz as unknown as IObs<TObsKind>;

	thiz._childsPrev = thiz._childs;
	thiz._childsI = -1;

	thiz._childs = null;

	let childsPrev: IObs<T>[] | null = null;
	let childsI = -1;

	let compVal: T | undefined;
	let compErr: Error | undefined;
	try {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		compVal = thiz._compFn!(thiz._v);
	} catch (err) {
		compErr = mkError(err);
		if (compErr.message === ERR_CIRCULAR) {
			// thiz._childsPrev = null;
			// thiz._childsI = -1;
			thiz._dirty = false;
			thiz._updateID = _lastUpdateID;
			throw compErr;
		}
	} finally {
		_curComp = prevComp;
		thiz._inComp = false;

		childsPrev = thiz._childsPrev;
		childsI = thiz._childsI;
		thiz._childsPrev = null;
		thiz._childsI = -1;
	}

	let i = childsI + 1;
	if (!thiz._childs) {
		if (childsPrev) {
			if (childsI === childsPrev.length - 1) {
				thiz._childs = childsPrev;
			} else {
				thiz._childs = childsPrev.slice(0, i);

				for (; i < childsPrev.length; i++) {
					const child = childsPrev[i];
					_rmPar(child, thiz);
				}
			}
		}
	} else if (childsPrev) {
		if (childsI !== childsPrev.length - 1) {
			for (; i < childsPrev.length; i++) {
				const child = childsPrev[i];
				if (!(thiz._childs as IObs<T>[]).includes(child)) {
					_rmPar(child, thiz);
				}
			}

			childsPrev.length = childsI + 1;
			// childsPrev = childsPrev.slice(0, childsI + 1);
		}
		thiz._childs = childsPrev.concat(thiz._childs);
	}

	if (compErr) {
		// console.log(compErr); // TODO: default error handler?
		thiz._dirty = false;
		thiz._updateID = _lastUpdateID;
		_emitErr(thiz, compErr);
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

		// for (let pars = thiz._pars, i = pars ? pars.length : 0; i !== 0; ) {
		// 	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		// 	_emitErr(pars![--i], error);
		// }
	}
};
const _childsPrevInclude = <T = TObsKind>(thiz: IObs<T>) => {
	// if (_curComp && _curComp._childsPrev) {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	for (let i = 0; i <= _curComp!._childsI!; i++) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (_curComp!._childsPrev![i] === thiz) {
			return true;
		}
	}
	// }
	return false;
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

export type { TObs, TObsCompFn, TObsEventCallback, TObsKind, TObsOptions, TObsPrimitive } from '../types/public.js';
