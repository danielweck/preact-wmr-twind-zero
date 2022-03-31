/* eslint-disable @typescript-eslint/no-explicit-any */

import { hasPendingObservers, registerDependencyForCurrentObserver, triggerObserversForDependency } from './core.js';
import type { PreactiveSignal } from './types.js';

let _strictSignalMustChangeInsideAction = true;
export const setStrictSignalMustChangeInsideAction = (value: boolean) => {
	_strictSignalMustChangeInsideAction = value;
};

export const preactiveSignal = <T>(reactiveValue: T): PreactiveSignal<T> => {
	function preactiveSignalFunction_(value?: T) {
		// typeof value !=== 'undefined' wouldn't work as can be valid value to write()
		// so must use 'arguments' which requires named 'function' (not arrow function)!
		return arguments.length ? write(value as T) : read();
	}
	const preactiveSignalFunction = preactiveSignalFunction_ as PreactiveSignal<T>; // because Function.length must be 'never' (to prevent misuse of Array.length etc.)

	preactiveSignalFunction.reactiveValue = reactiveValue;
	preactiveSignalFunction.onReactiveValueChanged = () => {
		if (_strictSignalMustChangeInsideAction && !hasPendingObservers()) {
			console.log('signal changed outside action');
		}
		triggerObserversForDependency(preactiveSignalFunction);
	};
	preactiveSignalFunction.editReactiveValue = (editor: (value: T) => T) => {
		const written = write(editor(read()));
		// assume value changed even if referrentially equal (e.g. array.push())
		if (!written) {
			preactiveSignalFunction.onReactiveValueChanged();
		}
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
