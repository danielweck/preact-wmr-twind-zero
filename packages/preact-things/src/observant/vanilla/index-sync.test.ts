/* eslint-disable jest/no-commented-out-tests */

import { afterEach, beforeEach, expect, test } from 'vitest';

import { obs, setErrorHandler, setTick } from './index.js';

const defaultErrorHandler = (err: Error, msg?: string) => {
	console.log(`VITEST: (${msg})`, err);
};

// sync! (no process tick / microtask)
setTick(undefined);
// setTick((func, ...args) => {
// 	func(...args);
// });

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

	setErrorHandler(defaultErrorHandler);
});
afterEach(() => {
	// if ('onunhandledrejection' in window) {
	// 	window.removeEventListener('unhandledrejection', onUnhandledRejection);
	// 	if (_unhandledEvents.length) {
	// 		throw _unhandledEvents[0].reason ?? _unhandledEvents[0];
	// 	}
	// }

	setErrorHandler(defaultErrorHandler);
});

test('test3a', () => {
	let order = '0';
	// forwards the expect() assertions to Vitest
	setErrorHandler((err) => {
		throw err;
	});
	const a = obs(1);
	a.onChange((evt) => {
		order += '2';
		expect(a.get()).toBe(2);
		expect(evt.current).toBe(2);
		expect(evt.previous).toBe(1);
	});
	order += '1';
	expect(a.get()).toBe(1);
	a.set(2);
	order += '3';
	expect(order).toBe('0123');
});

test('test8b', () => {
	let order = '0';

	// forwards the expect() assertions to Vitest
	setErrorHandler((err) => {
		if (!(err instanceof TypeError)) {
			throw err;
		}
	});
	const a = obs(1, {
		name: '_A_',
	});
	const b = obs(
		() => {
			if (a.get() === 2) {
				order += '3';
				throw new TypeError('!!');
			}
			order += '1';
			return a.get() + 1;
		},
		{
			name: '_B_',
		},
	);

	b.onError((evt) => {
		order += '4';
		expect(evt.error).instanceOf(TypeError);
		expect(evt.error?.message).toBe('!!');
	});
	expect(b.get()).toBe(2);
	order += '2';
	a.set(2);
	order += '5';
	let err: Error | undefined;
	try {
		b.get();
		expect(false).toBe(true);
	} catch (e) {
		err = e as Error;
		order += '6';
	}
	expect(err).instanceOf(TypeError);
	expect(err?.message).toBe('!!');
	order += '7';
	expect(order).toBe('01234567');
});

// test('perf NodeJS 10 SYNC', () => {
// 	const start = {
// 		prop1: obs(1),
// 		prop2: obs(2),
// 		prop3: obs(3),
// 		prop4: obs(4),
// 	};

// 	let layer = start;
// 	for (let i = 10; i > 0; i--) {
// 		layer = (function (m) {
// 			const s = {
// 				prop1: obs(function () {
// 					return m.prop2.get();
// 				}),
// 				prop2: obs(function () {
// 					return m.prop1.get() - m.prop3.get();
// 				}),
// 				prop3: obs(function () {
// 					return m.prop2.get() + m.prop4.get();
// 				}),
// 				prop4: obs(function () {
// 					return m.prop3.get();
// 				}),
// 			};

// 			s.prop1.onChange(() => {
// 				// noop
// 			});
// 			s.prop2.onChange(() => {
// 				// noop
// 			});
// 			s.prop3.onChange(() => {
// 				// noop
// 			});
// 			s.prop4.onChange(() => {
// 				// noop
// 			});

// 			s.prop1.get();
// 			s.prop2.get();
// 			s.prop3.get();
// 			s.prop4.get();

// 			return s;
// 		})(layer);
// 	}

// 	const end = layer;

// 	expect(end.prop1.get()).toBe(3);
// 	expect(end.prop2.get()).toBe(6);
// 	expect(end.prop3.get()).toBe(2);
// 	expect(end.prop4.get()).toBe(-2);

// 	const timeStart = performance.now();

// 	start.prop1.set(4);
// 	start.prop2.set(3);
// 	start.prop3.set(2);
// 	start.prop4.set(1);

// 	expect(end.prop1.get()).toBe(2);
// 	expect(end.prop2.get()).toBe(4);
// 	expect(end.prop3.get()).toBe(-2);
// 	expect(end.prop4.get()).toBe(-3);

// 	const duration = performance.now() - timeStart;

// 	expect(duration).toBeGreaterThanOrEqual(0);
// 	expect(duration).toBeLessThanOrEqual(10);

// 	console.log(`PERF duration (NodeJS) 10 SYNC: ${duration}`);
// });
