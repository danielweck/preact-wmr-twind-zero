/* eslint-disable @typescript-eslint/no-explicit-any */

import { preactiveBulkEffects } from './core.js';
import { pauseTracking } from './tracking.js';
import type { PreactiveFunction } from './types.js';

export const preactiveAction = <T>(actionFunction: PreactiveFunction<T>): T => {
	return pauseTracking(() => {
		return preactiveBulkEffects(actionFunction, (exception) => {
			throw exception;
		});
	});
};

export const createPreactiveAction = <T, Args extends any[]>(func: (...args: Args) => T) => {
	return (...args: Args) => {
		return preactiveAction(() => {
			return func(...args);
		});
	};
};
