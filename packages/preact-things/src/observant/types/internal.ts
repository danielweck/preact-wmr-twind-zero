import type { TObsCompFn, TObsEventCallback, TObsKind, TObsOptions } from './public.js';

// ----------------
// <TYPES>
// ----------------

// --- internal API

type TObsEventCallbacks<T> = TObsEventCallback<T> | TObsEventCallback<T>[] | null;

export interface IObs<T = TObsKind> {
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
