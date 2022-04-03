import {
	clearDependenciesForObserver,
	popObserver,
	preactiveBulkEffects,
	pushObserver,
	updatePreactiveObserverDepth,
} from './core.js';
import { resumeTracking } from './tracking.js';
import type {
	OnErrorWithDisposer,
	PreactiveFunction,
	PreactiveReactionAction,
	PreactiveReactionEffect,
	PreactiveReactionOptions,
} from './types.js';

export const preactiveReaction = <T>(
	action: PreactiveReactionAction<T>,
	effect?: PreactiveReactionEffect<T>,
	options?: PreactiveReactionOptions,
): PreactiveFunction<void> => {
	let actionReturnValue: T;
	let onceDisposer: PreactiveFunction<void> | undefined;

	const { immediateEffect, onErrorWithDisposer } = options || {};

	const disposer = () => {
		if (onceDisposer) {
			onceDisposer();
		}
	};

	const actionWrapDisplayName = `actionWrap_${action.displayName || action.name || '$'}`;
	const actionWrap: PreactiveReactionAction<T> = (dispose) => {
		actionReturnValue = action(dispose);
		return actionReturnValue;
	};
	actionWrap.displayName = actionWrapDisplayName;

	const actionDisplayName = `${action.displayName || action.name || 'preactiveReaction(action.displayName)'}`;
	const effectDisplayName = `${effect?.displayName || effect?.name || 'preactiveReaction(effect.displayName)'}`;

	const effectWrapDisplayName = `effectWrap_${effect?.displayName || effect?.name || '$'}`;
	let effectWrap: PreactiveFunction<void> | undefined;
	if (effect) {
		effectWrap = () => {
			try {
				effect(actionReturnValue, disposer);
			} catch (exception) {
				const error = exception instanceof Error ? exception : new Error('');
				error.message = `preactiveReaction.effectWrap [${actionDisplayName}] ==> [${effectDisplayName}] --- ${error.message}`;

				if (onErrorWithDisposer) {
					try {
						onErrorWithDisposer(error, disposer);
					} catch (exception2) {
						console.log(error);
						console.log('onErrorWithDisposer => ', exception2);
					}
				} else {
					console.log(error);
				}
			}
		};
		effectWrap.displayName = effectWrapDisplayName;
	}

	const onceEffectDisplayName = `onceEffect_${effectWrapDisplayName}`;
	const onceEffect: PreactiveFunction<void> = () => {
		updatePreactiveObserverDepth(onceEffect);

		createOnceLoop();

		if (effectWrap) {
			effectWrap();
		}
	};
	onceEffect.displayName = onceEffectDisplayName;

	const createOnceLoop = () => {
		onceDisposer = preactiveOnceReaction(actionWrap, onceEffect, (exception, errorDisposer) => {
			onceDisposer = errorDisposer;
			const error = exception instanceof Error ? exception : new Error('');
			error.message = `preactiveReaction.createOnceLoop.preactiveOnceReaction [${actionDisplayName}] ==> [${effectDisplayName}] --- ${error.message}`;

			if (onErrorWithDisposer) {
				try {
					onErrorWithDisposer(error, disposer);
				} catch (exception2) {
					console.log(error);
					console.log('onErrorWithDisposer => ', exception2);
				}
			} else {
				console.log(error);
			}
		});
	};

	createOnceLoop();

	if (immediateEffect && effectWrap) {
		effectWrap();
	}

	return disposer;
};

export const preactiveOnceReaction = (
	action: PreactiveReactionAction<void>,
	effect: PreactiveFunction<void>,
	onErrorWithDisposer?: OnErrorWithDisposer['onErrorWithDisposer'],
): PreactiveFunction<void> => {
	const disposer = () => {
		clearDependenciesForObserver(observer);
	};

	const actionDisplayName = `${action.displayName || action.name || 'preactiveOnceReaction(action.displayName)'}`;
	const effectDisplayName = `${effect.displayName || effect.name || 'preactiveOnceReaction(effect.displayName)'}`;

	// const effectDisplayName = effect.displayName || effect.name || '$';
	const observer: PreactiveFunction<void> = () => {
		disposer();
		preactiveBulkEffects(effect, (exception) => {
			const error = exception instanceof Error ? exception : new Error('');
			error.message = `preactiveOnceReaction.observer.preactiveBulkEffects [${actionDisplayName}] ==> [${effectDisplayName}] --- ${error.message}`;

			if (onErrorWithDisposer) {
				try {
					onErrorWithDisposer(error, disposer);
				} catch (exception2) {
					console.log(error);
					console.log('onErrorWithDisposer => ', exception2);
				}
			} else {
				console.log(error);
			}
		});
	};

	pushObserver(observer);

	// const observerDisplayName = action.displayName || action.name || '$';
	try {
		let internalDisposerCalled = false;
		const internalDisposer = () => {
			internalDisposerCalled = true;
		};
		resumeTracking(() => {
			action(internalDisposer);
		});
		if (internalDisposerCalled) {
			disposer();
		}
	} catch (exception) {
		const error = exception instanceof Error ? exception : new Error('');
		error.message = `preactiveOnceReaction [${actionDisplayName}] ==> [${effectDisplayName}] --- ${error.message}`;

		if (onErrorWithDisposer) {
			try {
				onErrorWithDisposer(exception, disposer);
			} catch (exception2) {
				console.log(exception);
				console.log('onErrorWithDisposer => ', exception2);
			}
		} else {
			console.log(exception);
		}
	} finally {
		popObserver();
	}

	return disposer;
};
