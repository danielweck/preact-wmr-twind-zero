import {
	clearDependenciesForObserver,
	popObserver,
	pushObserver,
	registerDependencyForCurrentObserver,
	triggerObserversForDependency,
} from './core.js';
import { resumeTracking } from './tracking.js';
import type { IsComputed, PreactiveComputedSignal, PreactiveFunction } from './types.js';

export const preactiveComputedSignal = <T>(computeFunction: PreactiveFunction<T>): PreactiveComputedSignal<T> => {
	let reactiveComputedValue: T | undefined;
	let hasChanges = true;
	let computeFunctionException: unknown | undefined;

	const computeDisplayName = computeFunction.displayName || computeFunction.name || '$';
	const computeObserver: PreactiveFunction<void> & IsComputed = () => {
		reactiveComputedValue = undefined;
		computeFunctionException = undefined;
		hasChanges = true;
		clearDependenciesForObserver(computeObserver);
		triggerObserversForDependency(computeObserver);
	};
	// computeObserver.displayName = computeDisplayName;
	computeObserver.isComputed = true;

	const preactiveComputedSignalFunction: PreactiveComputedSignal<T> & {
		observer?: typeof computeObserver;
	} = (() => {
		registerDependencyForCurrentObserver(computeObserver);

		if (hasChanges) {
			pushObserver(computeObserver);
			try {
				computeFunctionException = undefined;
				resumeTracking(() => {
					reactiveComputedValue = computeFunction();
				});
			} catch (exception) {
				computeFunctionException = exception;
			} finally {
				hasChanges = false;
				popObserver();
			}
		}

		if (computeFunctionException) {
			const error = computeFunctionException instanceof Error ? computeFunctionException : new Error('');
			error.message = `preactiveComputedSignal.computeFunction [${computeDisplayName}] --- ${error.message}`;

			throw error;
		}

		return reactiveComputedValue;
	}) as unknown as PreactiveComputedSignal<T>; // because Function.length must be 'never' (to prevent misuse of Array.length etc.)

	// preactiveComputedSignalFunction.toJSON = () => {
	// 	const res = getFunction() as T | ToJson<T>;
	// 	return (res as ToJson<T>).toJSON ? (res as ToJson<T>).toJSON() : (res as T);
	// };

	// prevents garbage collection
	preactiveComputedSignalFunction.observer = computeObserver;

	return preactiveComputedSignalFunction;
};
