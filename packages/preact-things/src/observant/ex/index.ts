import { get, obs, type TObs, type TObsKind, type TObsOptions } from '../core/index.js';
import type { IObs } from '../types/internal.js';

// ----------------
// <OBSERVANT PUBLICS>
// ----------------

export const memo = <T = TObsKind>(fn: () => T, opts?: TObsOptions<T>): (() => T) => {
	const o = opts ? obs(fn, opts /* { ...opts, lazy: false } */) : obs(fn);
	return () => get(o);
};

export const peek = <T = TObsKind>(thiz: TObs<T>): T | undefined => {
	if ((thiz as IObs<T>)._err) {
		throw (thiz as IObs<T>)._err;
	}
	return (thiz as IObs<T>)._v;
};

// ----------------
// </OBSERVANT PUBLICS>
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
