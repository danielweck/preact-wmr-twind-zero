import { hasPendingObservers, registerDependencyForCurrentObserver, triggerObserversForDependency } from './core.js';
import type { PreactiveSignal } from './types.js';

let _strictSignalMustChangeInsideAction = true;
export const setStrictSignalMustChangeInsideAction = (strict: boolean) => {
	_strictSignalMustChangeInsideAction = strict;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stringifiable = (v: any): any => {
	if (typeof v === 'function' && typeof v.reactiveValue !== 'undefined') {
		if (typeof v.reactiveValue !== 'undefined') {
			return v.reactiveValue;
		}
		if (v.observer?.isComputed) {
			return v();
		}
		return v;
	}
	if (typeof v === 'string' || typeof v === 'number' || v === undefined || v === null) {
		return v;
	}
	if (Array.isArray(v)) {
		for (let i = 0; i < v.length; i++) {
			v[i] = stringifiable(v[i]);
		}
		return v;
	}
	if (typeof v === 'object') {
		Object.keys(v).forEach((k) => {
			v[k] = stringifiable(v[k]);
		});
		return v;
	}
	return v;
};

export const preactiveSignal = <T>(reactiveValue: T): PreactiveSignal<T> => {
	function preactiveSignalFunction_(value?: T) {
		// typeof value !=== 'undefined' wouldn't work as can be valid value to write()
		// so must use 'arguments' which requires named 'function' (not arrow function)!
		if (arguments.length) {
			write(value as T);
			return preactiveSignalFunction.reactiveValue;
		}
		return read();
	}
	const preactiveSignalFunction = preactiveSignalFunction_ as PreactiveSignal<T>; // because Function.length must be 'never' (to prevent misuse of Array.length etc.)

	preactiveSignalFunction.reactiveValue = reactiveValue;
	preactiveSignalFunction.onReactiveValueChanged = () => {
		if (_strictSignalMustChangeInsideAction && !hasPendingObservers()) {
			console.log('Preactive signal changed outside action! (strict)');
		}
		triggerObserversForDependency(preactiveSignalFunction);
	};
	preactiveSignalFunction.editReactiveValue = (editor: (value: T) => T) => {
		const written = write(editor(preactiveSignalFunction.reactiveValue));
		// const written = write(editor(read()));

		// assume value changed even if referrentially equal (e.g. array.push())
		if (!written) {
			preactiveSignalFunction.onReactiveValueChanged();
		}
		return preactiveSignalFunction.reactiveValue;
	};

	preactiveSignalFunction.stringifiable = () => {
		return stringifiable(preactiveSignalFunction());
	};

	// preactiveSignalFunction.toJSON = () => {
	// 	const res = read() as T | ToJson<T>;
	// 	return (res as ToJson<T>).toJSON ? (res as ToJson<T>).toJSON() : (res as T);
	// };

	const read = () => {
		registerDependencyForCurrentObserver(preactiveSignalFunction);
		return preactiveSignalFunction.reactiveValue;
	};

	const write = (value: T) => {
		if (value !== preactiveSignalFunction.reactiveValue) {
			preactiveSignalFunction.reactiveValue = value;
			preactiveSignalFunction.onReactiveValueChanged();
			return true;
		}
		return false;
	};

	return preactiveSignalFunction;
};
