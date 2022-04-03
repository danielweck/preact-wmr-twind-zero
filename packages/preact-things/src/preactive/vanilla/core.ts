import { isTrackingPaused } from './tracking.js';
import type { IsComputed, OnError, PreactiveDependency, PreactiveFunction } from './types.js';

let _currentEffect: PreactiveFunction<unknown> | undefined;

const _weakMapObserverToDependencies = new WeakMap<PreactiveFunction<void>, Set<PreactiveDependency<unknown>>>();
const _weakMapDependencyToObservers = new WeakMap<PreactiveDependency<unknown>, Set<PreactiveFunction<void>>>();

// queue
let _setObservers: Set<PreactiveFunction<void>> | undefined;

export const hasPendingObservers = (): boolean => {
	return !!_setObservers;
};

// stack (push pop)
const _arrayObservers: PreactiveFunction<void>[] = [];

export const pushObserver = (func: PreactiveFunction<void>) => {
	_arrayObservers.push(func);
};
export const popObserver = () => {
	_arrayObservers.pop();
};
export const peekObserver = () => {
	return _arrayObservers[_arrayObservers.length - 1];
};

// export const toJS = (preactiveValue: any) => {
// 	const str = JSON.stringify(preactiveValue);
// 	return !str ? str : JSON.parse(str);
// };

const MAX_REACTION_DEPTH = 100;
const _mapObserverToDepth: Map<PreactiveFunction<void>, number> = new Map();

export const updatePreactiveObserverDepth = (observer: PreactiveFunction<void>) => {
	const currentDepth = _mapObserverToDepth.get(observer) || 0;

	if (currentDepth > MAX_REACTION_DEPTH) {
		throw new Error(`MAX_REACTION_DEPTH!! (${MAX_REACTION_DEPTH})`);
	}

	_mapObserverToDepth.set(observer, currentDepth + 1);
};

export const registerDependencyForCurrentObserver = <T>(dependency: PreactiveDependency<T>) => {
	if (isTrackingPaused()) {
		return;
	}

	const observer = peekObserver();
	if (!observer) {
		return;
	}

	let observers = _weakMapDependencyToObservers.get(dependency);
	if (!observers) {
		observers = new Set<PreactiveFunction<void>>();
		_weakMapDependencyToObservers.set(dependency, observers);
	}
	observers.add(observer);

	let dependencies = _weakMapObserverToDependencies.get(observer);
	if (!dependencies) {
		dependencies = new Set<PreactiveDependency<unknown>>();
		_weakMapObserverToDependencies.set(observer, dependencies);
	}
	dependencies.add(dependency);
};

export const clearDependenciesForObserver = (observer: PreactiveFunction<void>) => {
	const dependencies = _weakMapObserverToDependencies.get(observer);
	if (!dependencies) {
		return;
	}
	_weakMapObserverToDependencies.delete(observer);

	for (const dependency of dependencies) {
		const observers = _weakMapDependencyToObservers.get(dependency);
		if (!observers) {
			continue;
		}
		observers.delete(observer);
		if (observers.size === 0) {
			_weakMapDependencyToObservers.delete(dependency);
		}
	}
};

export const triggerObserversForDependency = (dependency: PreactiveDependency<unknown>) => {
	const observers = _weakMapDependencyToObservers.get(dependency);
	if (!observers) {
		return;
	}

	const currentObserver = peekObserver();

	for (const observer of [...observers]) {
		if (observer === currentObserver) {
			return;
		}

		if (_setObservers && !(observer as Partial<IsComputed>).isComputed) {
			_setObservers.add(observer);
		} else {
			observer();
		}
	}
};

export const preactiveBulkEffects = <T>(effect: PreactiveFunction<T>, onError?: OnError['onError']): T => {
	let isRootEffect = false;
	if (!_setObservers) {
		isRootEffect = true;
		_setObservers = new Set();
		_mapObserverToDepth.clear();
	}

	let result: T | undefined;

	const parentEffect = _currentEffect;
	_currentEffect = effect;

	// const _currentEffectDisplayName = _currentEffect.displayName || _currentEffect.name || '$';
	try {
		result = effect();
	} catch (exception) {
		// _currentEffectDisplayName
		if (onError) {
			onError(exception);
			// try {
			// 	onError(exception);
			// } catch (exception2) {
			// 	console.log(exception);
			// 	console.log('onError => ', exception2);
			// }
		} else {
			console.log(exception);
		}
	} finally {
		if (isRootEffect) {
			while (_setObservers.size > 0) {
				const observers = _setObservers;
				_setObservers = new Set();
				for (const observer of observers) {
					observer();
				}
			}

			_mapObserverToDepth.clear();
			_setObservers = undefined;
		}

		_currentEffect = parentEffect;
	}

	return result as T;
};
