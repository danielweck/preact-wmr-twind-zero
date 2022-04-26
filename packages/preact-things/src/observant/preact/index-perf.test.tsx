// @vitest-environment happy-dom

/* eslint-disable jest/no-commented-out-tests */

// CJS vs. ESM woes :(
// https://github.com/vitest-dev/vitest/issues/747#issuecomment-1085860826
// import { cleanup, render, waitFor } from '@testing-library/preact';
// ... so we use our local preact-testing-library.js file instead (copy-paste, including .d.ts typings)

import { afterEach, beforeEach, expect, test } from 'vitest';

import { cleanup } from '../../../preact-testing-library.js';
import { obs, setErrorHandler } from '../index.js';

const defaultErrorHandler = (err: Error, msg?: string) => {
	console.log(`VITEST: (${msg})`, err);
};

let _unhandledEvents: PromiseRejectionEvent[] = [];
function onUnhandledRejection(event: PromiseRejectionEvent) {
	console.log('onUnhandledRejection', event);
	_unhandledEvents.push(event);
}

// let scratch;
// let rerender: () => void;
beforeEach(() => {
	// scratch = setupScratch();
	// rerender = setupRerender();

	_unhandledEvents = [];
	if ('onunhandledrejection' in window) {
		window.addEventListener('unhandledrejection', onUnhandledRejection);
	}

	setErrorHandler(defaultErrorHandler);
});
afterEach(() => {
	cleanup();
	// teardown(scratch);

	if ('onunhandledrejection' in window) {
		window.removeEventListener('unhandledrejection', onUnhandledRejection);

		if (_unhandledEvents.length) {
			throw _unhandledEvents[0].reason ?? _unhandledEvents[0];
		}
	}

	setErrorHandler(defaultErrorHandler);
});

// async function waitFor<T extends () => any>(
// 	fn: T,
// 	{ timeout = 500, interval = 30 }: { timeout?: number; interval?: number } = {},
// ): Promise<ReturnType<T>> {
// 	const timeoutTime = Date.now() + timeout;
// 	let lastError: unknown;

// 	while (Date.now() < timeoutTime) {
// 		await new Promise((resolve) => {
// 			return setTimeout(resolve, interval);
// 		});
// 		try {
// 			return fn();
// 		} catch (error) {
// 			lastError = error;
// 		}
// 	}

// 	throw lastError;
// }

test('perf DOM', () => {
	const start = {
		prop1: obs(1),
		prop2: obs(2),
		prop3: obs(3),
		prop4: obs(4),
	};

	let layer = start;
	for (let i = 5000; i > 0; i--) {
		layer = (function (m) {
			const s = {
				prop1: obs(function () {
					return m.prop2.get();
				}),
				prop2: obs(function () {
					return m.prop1.get() - m.prop3.get();
				}),
				prop3: obs(function () {
					return m.prop2.get() + m.prop4.get();
				}),
				prop4: obs(function () {
					return m.prop3.get();
				}),
			};

			s.prop1.on('change', () => {
				// noop
			});
			s.prop2.on('change', () => {
				// noop
			});
			s.prop3.on('change', () => {
				// noop
			});
			s.prop4.on('change', () => {
				// noop
			});

			s.prop1.get();
			s.prop2.get();
			s.prop3.get();
			s.prop4.get();

			return s;
		})(layer);
	}

	const end = layer;

	expect(end.prop1.get()).toBe(2);
	expect(end.prop2.get()).toBe(4);
	expect(end.prop3.get()).toBe(-1);
	expect(end.prop4.get()).toBe(-6);

	const timeStart = performance.now();

	start.prop1.set(4);
	start.prop2.set(3);
	start.prop3.set(2);
	start.prop4.set(1);

	expect(end.prop1.get()).toBe(-2);
	expect(end.prop2.get()).toBe(1);
	expect(end.prop3.get()).toBe(-4);
	expect(end.prop4.get()).toBe(-4);

	const duration = performance.now() - timeStart;

	expect(duration).toBeGreaterThanOrEqual(10);
	expect(duration).toBeLessThanOrEqual(60);

	console.log(`PERF duration (DOM): ${duration}`);
});
