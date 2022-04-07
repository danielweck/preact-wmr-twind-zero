/* eslint-disable jest/no-commented-out-tests */

import { afterEach, beforeEach, expect, test } from 'vitest';

import { type TObsListener, fallbackTick, Obs, obs, setErrorHandler, setTick, tick } from './index.js';

const defaultErrorHandler = (err: Error, msg?: string) => {
	console.log(`VITEST: (${msg})`, err);
};

const syncTick = () => {
	// sync! (no process tick / microtask)
	setTick((func, ...args) => {
		func(...args);
	});
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

	// the default NodeJS process tick works fine when tests are executed in isolation,
	// but causes failure when sequenced within the same Vitest launch
	// ... so we use the Promise -based tick
	if (fallbackTick) {
		setTick(fallbackTick);
	} else {
		setTick(tick);
	}
	setErrorHandler(defaultErrorHandler);
});
afterEach(() => {
	// if ('onunhandledrejection' in window) {
	// 	window.removeEventListener('unhandledrejection', onUnhandledRejection);
	// 	if (_unhandledEvents.length) {
	// 		throw _unhandledEvents[0].reason ?? _unhandledEvents[0];
	// 	}
	// }

	// the default NodeJS process tick works fine when tests are executed in isolation,
	// but causes failure when sequenced within the same Vitest launch
	// ... so we use the Promise -based tick
	if (fallbackTick) {
		setTick(fallbackTick);
	} else {
		setTick(tick);
	}
	setErrorHandler(defaultErrorHandler);
});

test('test1', () => {
	const a = obs(1);
	expect(a.get()).toBe(1);

	const b = new Obs(2);
	expect(b.get()).toBe(2);
});

test('test2', () => {
	const a = obs(1);
	a.set(2);
	expect(a.get()).toBe(2);

	const b = new Obs(2);
	b.set(3);
	expect(b.get()).toBe(3);
});

test('test3a', () => {
	syncTick();
	let order = '0';
	// forwards the expect() assertions to Vitest
	setErrorHandler((err) => {
		throw err;
	});
	const a = obs(1);
	a.on('change', (evt) => {
		order += '2';
		expect(a.get()).toBe(2);
		expect(evt.data.current).toBe(2);
		expect(evt.data.previous).toBe(1);
	});
	order += '1';
	expect(a.get()).toBe(1);
	a.set(2);
	order += '3';
	expect(order).toBe('0123');
});
test('test3b', () => {
	let order = '0';
	// forwards the expect() assertions to Vitest
	setErrorHandler((err) => {
		throw err;
	});
	const a = obs(1);
	a.on('change', (evt) => {
		order += '2';
		expect(a.get()).toBe(2);
		expect(evt.data.current).toBe(2);
		expect(evt.data.previous).toBe(1);
	});
	order += '1';
	expect(a.get()).toBe(1);
	a.set(2);
	order += '3';
	expect(order).toBe('0123');
});

test('test4', () => {
	const a = obs(1);
	expect(a).instanceOf(Obs);
});

test('test5', () => {
	// forwards the expect() assertions to Vitest
	setErrorHandler((err) => {
		throw err;
	});

	const a = obs(1);

	a.on('change', (evt) => {
		expect(evt).toEqual({
			target: a,
			name: 'change',
			data: {
				previous: 1,
				current: 2,
			},
		});
	});

	a.set(2);
});

test('test6', () => {
	const a = obs(1);

	let count = 0;
	const listener: TObsListener<number> = (_evt) => {
		count++;
	};
	a.on('change', listener);
	expect(count).toBe(0);
	a.off('change', listener);
	a.set(2);
	expect(count).toBe(0);
});

test('test7', () => {
	const a = obs(1);

	let count = 0;
	const listener: TObsListener<number> = (_evt) => {
		count++;
	};
	a.on('change', listener);
	a.on('change', listener);
	expect(count).toBe(0);
	a.set(2);
	expect(count).toBe(2);
	a.off('change', listener);
	a.set(3);
	expect(count).toBe(2);
});

test('test8a', () => {
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
				order += '4';
				throw new TypeError('!!');
			}
			order += '1';
			return a.get() + 1;
		},
		{
			name: '_B_',
		},
	);

	b.on('error', (evt) => {
		order += '5';
		expect(evt.data.error).instanceOf(TypeError);
		expect(evt.data.error?.message).toBe('!!');
	});
	expect(b.get()).toBe(2);
	order += '2';
	a.set(2);
	order += '3';
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

test('test8b', () => {
	syncTick();

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

	b.on('error', (evt) => {
		order += '4';
		expect(evt.data.error).instanceOf(TypeError);
		expect(evt.data.error?.message).toBe('!!');
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

test('test9', () => {
	// forwards the expect() assertions to Vitest
	setErrorHandler((err) => {
		throw err;
	});
	const a = obs('A', {
		name: '_A_',
	});
	const b = obs(
		() => {
			return `B+${a.get()}`;
		},
		{
			name: '_B_',
		},
	);
	const c = obs(
		() => {
			return `C+${b.get()}`;
		},
		{
			name: '_C_',
		},
	);
	const d = obs(
		() => {
			return `D+${b.get()}`;
		},
		{
			name: '_D_',
		},
	);

	let stage = 0;
	a.on('change', (evt) => {
		expect(evt.target._name).toBe('_A_');
		expect(evt.data.previous).toBe('A');
		expect(evt.data.current).toBe('a');
	});
	b.on('change', (evt) => {
		expect(evt.target._name).toBe('_B_');
		expect(evt.data.previous).toBe(stage ? 'B+A' : undefined);
		expect(evt.data.current).toBe(stage ? 'B+a' : 'B+A');
	});
	c.on('change', (evt) => {
		expect(evt.target._name).toBe('_C_');
		expect(evt.data.previous).toBe(stage ? 'C+B+A' : undefined);
		expect(evt.data.current).toBe(stage ? 'C+B+a' : 'C+B+A');
	});
	d.on('change', (_evt) => {
		expect(true).toBe(false);
		// expect(evt.target._name).toBe('_D_');
		// expect(evt.data.previous).toBe(stage ? 'D+B+A' : undefined);
		// expect(evt.data.current).toBe(stage ? 'D+B+a' : 'D+B+A');
	});
	expect(b.get()).toBe('B+A');
	expect(c.get()).toBe('C+B+A');
	// expect(d.get()).toBe('D+B+A');
	stage++;
	a.set('a');
	expect(b.get()).toBe('B+a');
	expect(c.get()).toBe('C+B+a');
	// expect(d.get()).toBe('D+B+a');
});

test('test10', () => {
	// forwards the expect() assertions to Vitest
	setErrorHandler((err) => {
		throw err;
	});
	const a = obs('A', {
		name: '_A_',
	});
	const b = obs(
		() => ({
			b: a.get(),
		}),
		{
			name: '_B_',
		},
	);

	let stage = 0;
	a.on('change', (evt) => {
		expect(evt.target._name).toBe('_A_');
		expect(evt.data.previous).toBe('A');
		expect(evt.data.current).toBe('a');
	});
	b.on('change', (evt) => {
		expect(evt.target._name).toBe('_B_');
		expect(evt.data.previous).toEqual(
			stage === 0
				? undefined
				: {
						b: 'A',
				  },
		);
		expect(evt.data.current).toEqual(
			stage === 0
				? {
						b: 'A',
				  }
				: {
						b: 'a',
				  },
		);
	});
	expect(b.get()).toEqual({
		b: 'A',
	});
	stage++;
	a.set('a');
	expect(b.get()).toEqual({
		b: 'a',
	});
});
