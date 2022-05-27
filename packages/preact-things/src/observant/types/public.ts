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
	// lazy?: boolean;
};

// ----------------
// </TYPES>
// ----------------
