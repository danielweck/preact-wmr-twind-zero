/* eslint-disable jest/no-commented-out-tests */

import { afterEach, beforeEach, expect, test } from 'vitest';

import { get, logError, obs, set } from './index.js';

const defaultErrorHandler = (err: Error, msg?: string) => {
	console.log(`VITEST: (${msg})`, err);
};

// let _unhandledEvents: PromiseRejectionEvent[] = [];
// function onUnhandledRejection(event: PromiseRejectionEvent) {
// 	console.log('onUnhandledRejection', event);
// 	_unhandledEvents.push(event);
// }

beforeEach(() => {
	// _unhandledEvents = [];
	// if ('onunhandledrejection' in window) {
	// 	window.addEventListener('unhandledrejection', onUnhandledRejection);
	// }

	logError(defaultErrorHandler);
});
afterEach(() => {
	// if ('onunhandledrejection' in window) {
	// 	window.removeEventListener('unhandledrejection', onUnhandledRejection);
	// 	if (_unhandledEvents.length) {
	// 		throw _unhandledEvents[0].reason ?? _unhandledEvents[0];
	// 	}
	// }

	logError(defaultErrorHandler);
});

test('perf NodeJS 5000', () => {
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
				prop1: obs(
					function () {
						return get(m.prop2);
					},
					{ run: true },
				),
				prop2: obs(
					function () {
						return get(m.prop1) - get(m.prop3);
					},
					{ run: true },
				),
				prop3: obs(
					function () {
						return get(m.prop2) + get(m.prop4);
					},
					{ run: true },
				),
				prop4: obs(
					function () {
						return get(m.prop3);
					},
					{ run: true },
				),
			};

			// onChange(s.prop1, () => {
			// 	// noop
			// });
			// onChange(s.prop2, () => {
			// 	// noop
			// });
			// onChange(s.prop3, () => {
			// 	// noop
			// });
			// onChange(s.prop4, () => {
			// 	// noop
			// });

			// get(s.prop1);
			// get(s.prop2);
			// get(s.prop3);
			// get(s.prop4);

			return s;
		})(layer);
	}

	const end = layer;

	expect(get(end.prop1)).toBe(2);
	expect(get(end.prop2)).toBe(4);
	expect(get(end.prop3)).toBe(-1);
	expect(get(end.prop4)).toBe(-6);

	const timeStart = performance.now();

	set(start.prop1, 4);
	set(start.prop2, 3);
	set(start.prop3, 2);
	set(start.prop4, 1);

	expect(get(end.prop1)).toBe(-2);
	expect(get(end.prop2)).toBe(1);
	expect(get(end.prop3)).toBe(-4);
	expect(get(end.prop4)).toBe(-4);

	const duration = performance.now() - timeStart;

	expect(duration).toBeGreaterThanOrEqual(10);
	expect(duration).toBeLessThanOrEqual(200);

	console.log(`PERF duration (NodeJS) 5000: ${duration}`);
});

test('perf NodeJS 10', () => {
	const start = {
		prop1: obs(1),
		prop2: obs(2),
		prop3: obs(3),
		prop4: obs(4),
	};

	let layer = start;
	for (let i = 10; i > 0; i--) {
		layer = (function (m) {
			const s = {
				prop1: obs(
					function () {
						return get(m.prop2);
					},
					{ run: true },
				),
				prop2: obs(
					function () {
						return get(m.prop1) - get(m.prop3);
					},
					{ run: true },
				),
				prop3: obs(
					function () {
						return get(m.prop2) + get(m.prop4);
					},
					{ run: true },
				),
				prop4: obs(
					function () {
						return get(m.prop3);
					},
					{ run: true },
				),
			};

			// onChange(s.prop1, () => {
			// 	// noop
			// });
			// onChange(s.prop2, () => {
			// 	// noop
			// });
			// onChange(s.prop3, () => {
			// 	// noop
			// });
			// onChange(s.prop4, () => {
			// 	// noop
			// });

			// get(s.prop1);
			// get(s.prop2);
			// get(s.prop3);
			// get(s.prop4);

			return s;
		})(layer);
	}

	const end = layer;

	expect(get(end.prop1)).toBe(3);
	expect(get(end.prop2)).toBe(6);
	expect(get(end.prop3)).toBe(2);
	expect(get(end.prop4)).toBe(-2);

	const timeStart = performance.now();

	set(start.prop1, 4);
	set(start.prop2, 3);
	set(start.prop3, 2);
	set(start.prop4, 1);

	expect(get(end.prop1)).toBe(2);
	expect(get(end.prop2)).toBe(4);
	expect(get(end.prop3)).toBe(-2);
	expect(get(end.prop4)).toBe(-3);

	const duration = performance.now() - timeStart;

	expect(duration).toBeGreaterThanOrEqual(0);
	expect(duration).toBeLessThanOrEqual(20);

	console.log(`PERF duration (NodeJS) 10: ${duration}`);
});

test('perf NodeJS 1000', () => {
	const start = {
		prop1: obs(1),
		prop2: obs(2),
		prop3: obs(3),
		prop4: obs(4),
	};

	let layer = start;
	for (let i = 1000; i > 0; i--) {
		layer = (function (m) {
			const s = {
				prop1: obs(
					function () {
						return get(m.prop2);
					},
					{ run: true },
				),
				prop2: obs(
					function () {
						return get(m.prop1) - get(m.prop3);
					},
					{ run: true },
				),
				prop3: obs(
					function () {
						return get(m.prop2) + get(m.prop4);
					},
					{ run: true },
				),
				prop4: obs(
					function () {
						return get(m.prop3);
					},
					{ run: true },
				),
			};

			// onChange(s.prop1, () => {
			// 	// noop
			// });
			// onChange(s.prop2, () => {
			// 	// noop
			// });
			// onChange(s.prop3, () => {
			// 	// noop
			// });
			// onChange(s.prop4, () => {
			// 	// noop
			// });

			// get(s.prop1);
			// get(s.prop2);
			// get(s.prop3);
			// get(s.prop4);

			return s;
		})(layer);
	}

	const end = layer;

	expect(get(end.prop1)).toBe(-3);
	expect(get(end.prop2)).toBe(-6);
	expect(get(end.prop3)).toBe(-2);
	expect(get(end.prop4)).toBe(2);

	const timeStart = performance.now();

	set(start.prop1, 4);
	set(start.prop2, 3);
	set(start.prop3, 2);
	set(start.prop4, 1);

	expect(get(end.prop1)).toBe(-2);
	expect(get(end.prop2)).toBe(-4);
	expect(get(end.prop3)).toBe(2);
	expect(get(end.prop4)).toBe(3);

	const duration = performance.now() - timeStart;

	expect(duration).toBeGreaterThanOrEqual(0);
	expect(duration).toBeLessThanOrEqual(20);

	console.log(`PERF duration (NodeJS) 1000: ${duration}`);
});
