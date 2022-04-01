import { useRef } from 'preact/hooks';

// (P)React hook for creating a value exactly once (useMemo doesn't guarantee this)
// https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily

// SOURCE:
// https://github.com/Andarist/use-constant/blob/81f9ab2944719115d422e69e290bf0f722efd0b7/src/index.ts#L1-L13

export type ResultBox<T> = { v: T };

export const useConstant = <T>(fn: () => T): T => {
	const ref = useRef<ResultBox<T>>();

	if (!ref.current) {
		ref.current = { v: fn() };
	}

	return ref.current.v;
};
