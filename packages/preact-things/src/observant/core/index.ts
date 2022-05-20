// SIZE LIMIT :| [./dist/observant.terser-rollup.js] (2328)
// SIZE LIMIT :| [./dist/observant.terser-rollup.js.gz] (1006)
// SIZE LIMIT :| [./dist/observant.terser-rollup.js.br] (921)
// SIZE LIMIT :| [./dist/observant.esbuild.js] (3428)
// SIZE LIMIT :| [./dist/observant.esbuild.js.gz] (1347)
// SIZE LIMIT :| [./dist/observant.esbuild.js.br] (1241)

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
// <GLOBAL STATE>
// ----------------

let _curComp: IObs<TObsKind> | undefined;

let _curErr: Error | undefined;

let _lastUpdateID = 0;

let _inCompPars = false;

// ----------------
// </GLOBAL STATE>
// ----------------

// ----------------
// <OBSERVANT CONSTRUCTOR>
// ----------------

export const obs = <T = TObsKind>(v: T | TObsCompFn<T>, run?: boolean): TObs<T> => {
	const fn = typeof v === 'function';

	const thiz = {
		_evts: undefined,
		_pars: undefined,
		_childsPrev: undefined,
		_childsI: -1,
		_childs: undefined,
		_inComp: false,
		_updateID: -1,
		_err: undefined,
		_compFn: fn ? v : undefined,
		_dirty: !!fn,
		_v: fn ? undefined : v,
	};

	if (run) {
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

				if (!(thiz as IObs<T>)._pars) {
					// @ts-expect-error TS2322
					(thiz as IObs<T>)._pars = [_curComp];
				} else {
					// TODO??
					// if (!thiz._pars.includes(_curComp))

					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					((thiz as IObs<T>)._pars! as Array<IObs<TObsKind>>).push(_curComp);
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

				if (!(thiz as IObs<T>)._pars) {
					// @ts-expect-error TS2322
					(thiz as IObs<T>)._pars = [_curComp];
				} else {
					// TODO??
					// if (!thiz._pars.includes(_curComp))

					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					((thiz as IObs<T>)._pars! as Array<IObs<TObsKind>>).push(_curComp);
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

export const set = <T = TObsKind>(thiz: TObs<T>, val: T | ((curV: T | undefined) => T)): void => {
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
	// if (!evtCBs) {
	// 	(thiz as IObs<T>)._evts = [evtCB];
	// } else if (!inArray(evtCBs, evtCB)) {
	// 	evtCBs.push(evtCB);
	// }
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
			// let i = evtCBs.length;
			// if (i === 1) {
			// 	if (evtCBs[0] === evtCB) {
			// 		thiz._evts = undefined;
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
					thiz._evts = undefined;
				}
			} else {
				let i = evtCBs.length;
				if (i === 1) {
					if (evtCBs[0] === evtCB) {
						thiz._evts = undefined;
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
		thiz._evts = undefined;
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
				thiz._pars = undefined;
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

	for (let pars = thiz._pars ? thiz._pars.slice() : undefined, i = 0, l = pars ? pars.length : -1; i < l; i++) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (pars![i]._compFn) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_comp(pars![i]);
		}
	}

	_inCompPars = false;

	for (let pars = thiz._pars, i = 0, l = pars ? pars.length : -1; i < l; i++) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (pars![i]._dirty) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			pars![i]._dirty = false;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			_compPars(pars![i]);
		}
	}
};

const _comp = <T = TObsKind>(thiz: IObs<T>) => {
	if (thiz._updateID === _lastUpdateID) {
		return;
	}
	if (thiz._compFn) {
		if (thiz._inComp) {
			throw Error(ERR_CIRCULAR);
		}
		thiz._inComp = true;

		const prevComp = _curComp;
		_curComp = thiz as unknown as IObs<TObsKind>;

		thiz._childsPrev = thiz._childs;
		thiz._childsI = -1;

		thiz._childs = undefined;

		let compVal: T | undefined;
		let compErr: Error | undefined;
		try {
			compVal = thiz._compFn(thiz._v);
		} catch (err) {
			compErr = _curErr = mkError(err);
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

		thiz._childsPrev = undefined;
		thiz._childsI = -1;

		const childs = thiz._childs;
		const l = childs ? childs.length : 0;

		if (l === 0) {
			thiz._dirty = false;
		}

		if (typeof compVal !== 'undefined') {
			_val(thiz, compVal);
			return;
		}

		if (compErr) {
			_emitErr(thiz, _curErr);

			thiz._dirty = false;
		}
	}
};

const _val = <T = TObsKind>(thiz: IObs<T>, newV: T) => {
	if (thiz._err) {
		_emitErr(thiz, undefined);
	}
	thiz._dirty = false;

	thiz._updateID = _lastUpdateID;

	const prevV = thiz._v;
	if (newV !== prevV) {
		thiz._v = newV;

		if (_inCompPars) {
			thiz._dirty = true;
		} else {
			_compPars(thiz);
		}

		if (thiz._evts) {
			_emit(thiz, newV, prevV, undefined);
		}
	}
};

const _emitErr = <T = TObsKind>(thiz: IObs<T>, error: Error | undefined) => {
	if (thiz._err !== error) {
		thiz._err = error;

		if (error) {
			_emit(thiz, undefined, undefined, error);
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

export type TObsEventCallback<T> = (error: Error | undefined, curV: T | undefined, prevV: T | undefined) => void;

export type TObsPrimitive = null | number | string | boolean;
export type TObsKind = TObsPrimitive | Array<TObsPrimitive> | Record<string, unknown>;
export type TObsCompFn<T> = (curV: T | undefined) => T;

export type TObs<_T = TObsKind> = {
	// noop
};

// export type TObsOptions<_T = TObsKind> = {
// 	run?: boolean;
// };

// --- internal API

type TObsEventCallbacks<T> = TObsEventCallback<T> | TObsEventCallback<T>[] | undefined;
// type TObsEventCallbacks<T> = TObsEventCallback<T>[] | undefined;

interface IObs<T = TObsKind> {
	_evts: TObsEventCallbacks<T>;

	_v?: T;

	_dirty: boolean;

	_compFn?: TObsCompFn<T>;
	_inComp: boolean;

	_pars?: Array<IObs<T>>;

	_childs?: Array<IObs<T>>;
	_childsPrev?: Array<IObs<T>>;
	_childsI?: number;

	_updateID: number;

	_err?: Error;
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

// ------------------------------
// BENCH.HTML
// ------------------------------
// <!DOCTYPE html>
// <html>
// <head>
// 	<meta charset="UTF-8">
// 	<title></title>
// 	<script type="text/javascript">
// 		window.exports = {};
// 	</script>

// <script src="./packages/preact-things/dist/observant.rollup.js"></script>

// <script src="../solid/packages/solid/dist/solid.cjs"></script>

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
// 	<button id="btnRunTest" class="-btn -btn-high -btn-success">Run CellX Bench</button>
// </p>
// <p>
// 	<button id="btnRunTestSolidObs" class="-btn -btn-high -btn-success">Run Solid Bench</button>
// </p>
// <p>
// 	<button id="btnRunTestSolid" class="-btn -btn-high -btn-success">Run Solid Bench (with Solid)</button>
// </p>

// <hr>

// <p>
// 	Output
// 	<pre><output id="tfOutput">&nbsp;</output></pre>
// </p>

// <script src="../solid/packages/solid/bench/bench.js"></script>

// <!-- <script src="./perf.js"></script> -->

// <script>

// document.querySelectorAll('#bSetLayerCount button').forEach((b) => {
// 	b.addEventListener('click', function() {
// 	document.querySelector('#tfLayerCount').value = this.innerHTML;
// })});

// document.querySelector('#btnRunTest').addEventListener('click', function() {
// 	runTest(document.querySelector('#bSelectLibrary input:checked').value, parseInt(document.querySelector('#tfLayerCount').value, 10));
// });
// document.querySelector('#btnRunTestSolid').addEventListener('click', function() {
// 	runSolid(false);
// });
// document.querySelector('#btnRunTestSolidObs').addEventListener('click', function() {
// 	runSolid(true);
// });

// function runSolid(useObs) {
// 	const log = console.log;
// 	let msgs = [];
// 	console.log = (...args) => {
// 		msgs = msgs.concat(args);
// 	}
// 	window.solidbench(useObs);
// 	console.log = log;
// 	for (const msg of msgs) {
// 		console.log(msg);
// 	}
// 	document.querySelector('#tfOutput').innerHTML = msgs.join('<br>');
// }
// function runTest(lib, layerCount) {

// 	document.querySelector('#btnRunTest').disabled = true;

// 	// console.log(lib, layerCount);

// 	// setTimeout(() => {
// 		let report = {};

// 		function onDone() {
// 			// setTimeout(() => {
// 			document.querySelector('#tfOutput').innerHTML =
// 			// document.querySelector('#tfOutput').innerHTML + '<br>' + '<br>' +
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
// 					prop1: observant.obs(() => observant.get(prev.prop2), true),
// 					prop2: observant.obs(() => observant.get(prev.prop1) - observant.get(prev.prop3), true),
// 					prop3: observant.obs(() => observant.get(prev.prop2) + observant.get(prev.prop4), true),
// 					prop4: observant.obs(() => observant.get(prev.prop3), true)
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
// ------------------------------
// BENCH.JS
// ------------------------------
// function createSignal_(val) {
// 	const o = observant.obs(val);
// 	return [() => observant.get(o), v => observant.set(o, v)];
//   }
//   function createRoot_(fn) {
// 	return fn();
//   }
//   function createComputed_(fn) {
// 	return observant.obs(fn, true);
//   }
//   function createMemo_(fn) {
// 	const o = observant.obs(fn, true);
// 	return () => observant.get(o);
//   }

//   var now = typeof process === 'undefined' ? browserNow : nodeNow;

//   var COUNT = 1e5;

//   window.solidbench = function main(useObs) {
// 	if (useObs) {
// 	  if (!window.createSignal_SOLID) window.createSignal_SOLID = window.createSignal;
// 	  if (!window.createRoot_SOLID) window.createRoot_SOLID = window.createRoot;
// 	  if (!window.createComputed_SOLID) window.createComputed_SOLID = window.createComputed;
// 	  if (!window.createMemo_SOLID) window.createMemo_SOLID = window.createMemo;

// 	  window.createSignal = createSignal_;
// 	  window.createRoot = createRoot_;
// 	  window.createComputed = createComputed_;
// 	  window.createMemo = createMemo_;
// 	} else {
// 	  if (window.createSignal_SOLID) window.createSignal = window.createSignal_SOLID;
// 	  if (window.createRoot_SOLID) window.createRoot = window.createRoot_SOLID;
// 	  if (window.createComputed_SOLID) window.createComputed = window.createComputed_SOLID;
// 	  if (window.createMemo_SOLID) window.createMemo = window.createMemo_SOLID;
// 	}

// 	var createTotal = 0;
// 	createTotal += bench(createDataSignals, COUNT, COUNT);
// 	createTotal += bench(createComputations0to1, COUNT, 0);
// 	createTotal += bench(createComputations1to1, COUNT, COUNT);
// 	createTotal += bench(createComputations2to1, COUNT / 2, COUNT);
// 	createTotal += bench(createComputations4to1, COUNT / 4, COUNT);
// 	createTotal += bench(createComputations1000to1, COUNT / 1000, COUNT);
// 	//total += bench1(createComputations8, COUNT, 8 * COUNT);
// 	createTotal += bench(createComputations1to2, COUNT, COUNT / 2);
// 	createTotal += bench(createComputations1to4, COUNT, COUNT / 4);
// 	createTotal += bench(createComputations1to8, COUNT, COUNT / 8);
// 	createTotal += bench(createComputations1to1000, COUNT, COUNT / 1000);
// 	console.log(`create total: ${createTotal.toFixed(0)}`);
// 	console.log('---');
// 	var updateTotal = 0;
// 	updateTotal += bench(updateComputations1to1, COUNT * 4, 1);
// 	updateTotal += bench(updateComputations2to1, COUNT * 2, 2);
// 	updateTotal += bench(updateComputations4to1, COUNT, 4);
// 	updateTotal += bench(updateComputations1000to1, COUNT / 100, 1000);
// 	updateTotal += bench(updateComputations1to2, COUNT * 4, 1);
// 	updateTotal += bench(updateComputations1to4, COUNT * 4, 1);
// 	updateTotal += bench(updateComputations1to1000, COUNT * 4, 1);
// 	console.log(`update total: ${updateTotal.toFixed(0)}`);
// 	console.log('---');
// 	console.log(`total: ${(createTotal + updateTotal).toFixed(0)}`);

// 	console.log('---');
// 	// console.log(window.createMemo.toString());
//   }

//   function bench(fn, count, scount) {
// 	var time = run(fn, count, scount);
// 	console.log(`${fn.name}: ${time.toFixed(0)}`);
// 	return time;
//   }

//   function run(fn, n, scount) {
// 	// prep n * arity sources
// 	var start,
// 	  end;

// 	createRoot(function () {
// 	  // run 3 times to warm up
// 	  var sources = createDataSignals(scount, []);
// 	  fn(n / 100, sources);
// 	  sources = createDataSignals(scount, []);
// 	  fn(n / 100, sources);
// 	  sources = createDataSignals(scount, []);
// 		  // % OptimizeFunctionOnNextCall(fn);
// 	  fn(n / 100, sources);
// 	  sources = createDataSignals(scount, []);
// 	  for (var i = 0; i < scount; i++) {
// 		sources[i][0]();
// 		sources[i][0]();
// 		//%OptimizeFunctionOnNextCall(sources[i]);
// 		sources[i][0]();
// 	  }

// 		  // start GC clean
// 		  // % CollectGarbage(null);

// 	  start = now();

// 	  fn(n, sources);

// 	  // end GC clean
// 	  sources = null;
// 		  // % CollectGarbage(null);

// 	  end = now();
// 	});

// 	return end - start;
//   }

//   function createDataSignals(n, sources) {
// 	for (var i = 0; i < n; i++) {
// 	  sources[i] = createSignal(i);
// 	}
// 	return sources;
//   }

//   function createComputations0to1(n, sources) {
// 	for (var i = 0; i < n; i++) {
// 	  createComputation0(i);
// 	}
//   }

//   function createComputations1to1000(n, sources) {
// 	for (var i = 0; i < n / 1000; i++) {
// 	  const [get] = sources[i];
// 	  for (var j = 0; j < 1000; j++) {
// 		createComputation1(get);
// 	  }
// 	  //sources[i] = null;
// 	}
//   }

//   function createComputations1to8(n, sources) {
// 	for (var i = 0; i < n / 8; i++) {
// 	  const [get] = sources[i];
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  //sources[i] = null;
// 	}
//   }

//   function createComputations1to4(n, sources) {
// 	for (var i = 0; i < n / 4; i++) {
// 	  const [get] = sources[i];
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  //sources[i] = null;
// 	}
//   }

//   function createComputations1to2(n, sources) {
// 	for (var i = 0; i < n / 2; i++) {
// 	  const [get] = sources[i];
// 	  createComputation1(get);
// 	  createComputation1(get);
// 	  //sources[i] = null;
// 	}
//   }

//   function createComputations1to1(n, sources) {
// 	for (var i = 0; i < n; i++) {
// 	  const [get] = sources[i]
// 	  createComputation1(get);
// 	  //sources[i] = null;
// 	}
//   }

//   function createComputations2to1(n, sources) {
// 	for (var i = 0; i < n; i++) {
// 	  createComputation2(
// 		sources[i * 2][0],
// 		sources[i * 2 + 1][0]
// 	  );
// 	  //sources[i * 2] = null;
// 	  //sources[i * 2 + 1] = null;
// 	}
//   }

//   function createComputations4to1(n, sources) {
// 	for (var i = 0; i < n; i++) {
// 	  createComputation4(
// 		sources[i * 4][0],
// 		sources[i * 4 + 1][0],
// 		sources[i * 4 + 2][0],
// 		sources[i * 4 + 3][0]
// 	  );
// 	  //sources[i * 4] = null;
// 	  //sources[i * 4 + 1] = null;
// 	  //sources[i * 4 + 2] = null;
// 	  //sources[i * 4 + 3] = null;
// 	}
//   }

//   function createComputations8(n, sources) {
// 	for (var i = 0; i < n; i++) {
// 	  createComputation8(
// 		sources[i * 8][0],
// 		sources[i * 8 + 1][0],
// 		sources[i * 8 + 2][0],
// 		sources[i * 8 + 3][0],
// 		sources[i * 8 + 4][0],
// 		sources[i * 8 + 5][0],
// 		sources[i * 8 + 6][0],
// 		sources[i * 8 + 7][0]
// 	  );
// 	  sources[i * 8] = null;
// 	  sources[i * 8 + 1] = null;
// 	  sources[i * 8 + 2] = null;
// 	  sources[i * 8 + 3] = null;
// 	  sources[i * 8 + 4] = null;
// 	  sources[i * 8 + 5] = null;
// 	  sources[i * 8 + 6] = null;
// 	  sources[i * 8 + 7] = null;
// 	}
//   }

//   // only create n / 100 computations, as otherwise takes too long
//   function createComputations1000to1(n, sources) {
// 	for (var i = 0; i < n; i++) {
// 	  createComputation1000(sources, i * 1000);
// 	}
//   }

//   function createComputation0(i) {
// 	createComputed(function () { return i; });
//   }

//   function createComputation1(s1) {
// 	createComputed(function () { return s1(); });
//   }

//   function createComputation2(s1, s2) {
// 	createComputed(function () { return s1() + s2(); });
//   }

//   function createComputation4(s1, s2, s3, s4) {
// 	createComputed(function () { return s1() + s2() + s3() + s4(); });
//   }

//   function createComputation8(s1, s2, s3, s4, s5, s6, s7, s8) {
// 	createComputed(function () { return s1() + s2() + s3() + s4() + s5() + s6() + s7() + s8(); });
//   }

//   function createComputation1000(ss, offset) {
// 	createComputed(function () {
// 	  var sum = 0;
// 	  for (var i = 0; i < 1000; i++) {
// 		sum += ss[offset + i][0]();
// 	  }
// 	  return sum;
// 	});
//   }

//   function updateComputations1to1(n, sources) {
// 	var [get1, set1] = sources[0];
// 	createComputed(function () { return get1(); });
// 	for (var i = 0; i < n; i++) {
// 	  set1(i);
// 	}
//   }

//   function updateComputations2to1(n, sources) {
// 	var [get1, set1] = sources[0],
// 	  [get2] = sources[1];
// 	createComputed(function () { return get1() + get2(); });
// 	for (var i = 0; i < n; i++) {
// 	  set1(i);
// 	}
//   }

//   function updateComputations4to1(n, sources) {
// 	var [get1, set1] = sources[0],
// 	  [get2] = sources[1];
// 	  [get3] = sources[2],
// 	  [get4] = sources[3];
// 	createComputed(function () { return get1() + get2() + get3() + get4(); });
// 	for (var i = 0; i < n; i++) {
// 	  set1(i);
// 	}
//   }

//   function updateComputations1000to1(n, sources) {
// 	var [get1, set1] = sources[0];
// 	createComputed(function () {
// 	  var sum = 0;
// 	  for (var i = 0; i < 1000; i++) {
// 		sum += sources[i][0]();
// 	  }
// 	  return sum;
// 	});
// 	for (var i = 0; i < n; i++) {
// 	  set1(i);
// 	}
//   }

//   function updateComputations1to2(n, sources) {
// 	var [get1, set1] = sources[0];
// 	createComputed(function () { return get1(); });
// 	createComputed(function () { return get1(); });
// 	for (var i = 0; i < n / 2; i++) {
// 	  set1(i);
// 	}
//   }

//   function updateComputations1to4(n, sources) {
// 	var [get1, set1] = sources[0];
// 	createComputed(function () { return get1(); });
// 	createComputed(function () { return get1(); });
// 	createComputed(function () { return get1(); });
// 	createComputed(function () { return get1(); });
// 	for (var i = 0; i < n / 4; i++) {
// 	  set1(i);
// 	}
//   }

//   function updateComputations1to1000(n, sources) {
// 	var [get1, set1] = sources[0];
// 	for (var i = 0; i < 1000; i++) {
// 	  createComputed(function () { return get1(); });
// 	}
// 	for (var i = 0; i < n / 1000; i++) {
// 	  set1(i);
// 	}
//   }

//   function browserNow() {
// 	return performance.now();
//   }

//   function nodeNow() {
// 	var hrt = process.hrtime();
// 	return hrt[0] * 1000 + hrt[1] / 1e6;
//   }
