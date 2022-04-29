/* eslint-disable jest/no-commented-out-tests */

import { afterEach, beforeEach, expect, test } from 'vitest';

import { type TObsEventListenerChange, obs, onError } from './index.js';

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

	onError(defaultErrorHandler);
});
afterEach(() => {
	// if ('onunhandledrejection' in window) {
	// 	window.removeEventListener('unhandledrejection', onUnhandledRejection);
	// 	if (_unhandledEvents.length) {
	// 		throw _unhandledEvents[0].reason ?? _unhandledEvents[0];
	// 	}
	// }

	onError(defaultErrorHandler);
});

test('test1', () => {
	const a = obs(1);
	expect(a.get()).toBe(1);

	// const b = new Obs(2);
	// expect(b.get()).toBe(2);

	// const c = Obs(3);
	// expect(c.get()).toBe(3);
});

test('test2', () => {
	const a = obs(1);
	a.set(2);
	expect(a.get()).toBe(2);

	// const b = new Obs(2);
	// b.set(3);
	// expect(b.get()).toBe(3);

	// const c = Obs(3);
	// c.set(4);
	// expect(c.get()).toBe(4);
});

test('test3b', () => {
	let order = '0';
	// forwards the expect() assertions to Vitest
	onError((err) => {
		throw err;
	});
	const a = obs(1);
	a.onChange((current, previous) => {
		order += '2';
		expect(a.get()).toBe(2);
		expect(current).toBe(2);
		expect(previous).toBe(1);
	});
	order += '1';
	expect(a.get()).toBe(1);
	a.set(2);
	order += '3';
	expect(order).toBe('0123');
});

// test('test4', () => {
// 	const a = obs(1);
// 	expect(a).instanceOf(Obs);
// });

test('test5', () => {
	// forwards the expect() assertions to Vitest
	onError((err) => {
		throw err;
	});

	const a = obs(1);

	a.onChange((current, previous) => {
		expect(current).toEqual(2);
		expect(previous).toEqual(1);
	});

	a.set(2);
});

test('test6', () => {
	const a = obs(1);

	let count = 0;
	const listener: TObsEventListenerChange<number> = () => {
		count++;
	};
	const off = a.onChange(listener);
	expect(count).toBe(0);
	off();
	a.set(2);
	expect(count).toBe(0);
});

test('test7', () => {
	const a = obs(1);

	let count = 0;
	const listener: TObsEventListenerChange<number> = () => {
		count++;
	};
	a.onChange(listener);
	const off = a.onChange(listener);
	expect(count).toBe(0);
	a.set(2);
	expect(count).toBe(1);
	off();
	a.set(3);
	expect(count).toBe(1);
});

test('test8a', () => {
	let order = '0';

	// forwards the expect() assertions to Vitest
	onError((err) => {
		if (!(err instanceof TypeError)) {
			throw err;
		}
	});
	const a = obs(
		1,
		// 	{
		// 	name: '_A_',
		// }
	);
	const b = obs(
		() => {
			if (a.get() === 2) {
				order += '4';
				throw new TypeError('!!');
			}
			order += '1';
			return a.get() + 1;
		},
		// {
		// 	name: '_B_',
		// },
	);

	b.onError((error) => {
		order += '5';
		expect(error).instanceOf(TypeError);
		expect(error?.message).toBe('!!');
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

test('test9', () => {
	// forwards the expect() assertions to Vitest
	onError((err) => {
		throw err;
	});
	const a = obs(
		'A',
		// {
		// 	name: '_A_',
		// }
	);
	const b = obs(
		() => {
			return `B+${a.get()}`;
		},
		// {
		// 	name: '_B_',
		// },
	);
	const c = obs(
		() => {
			return `C+${b.get()}`;
		},
		// {
		// 	name: '_C_',
		// },
	);
	const d = obs(
		() => {
			return `D+${b.get()}`;
		},
		// {
		// 	name: '_D_',
		// },
	);

	let stage = 0;
	a.onChange((current, previous) => {
		// expect(evt.target._name).toBe('_A_');
		expect(previous).toBe('A');
		expect(current).toBe('a');
	});
	b.onChange((current, previous) => {
		// expect(evt.target._name).toBe('_B_');
		expect(previous).toBe(stage ? 'B+A' : undefined);
		expect(current).toBe(stage ? 'B+a' : 'B+A');
	});
	c.onChange((current, previous) => {
		// expect(evt.target._name).toBe('_C_');
		expect(previous).toBe(stage ? 'C+B+A' : undefined);
		expect(current).toBe(stage ? 'C+B+a' : 'C+B+A');
	});
	d.onChange((_evt) => {
		expect(true).toBe(false);
		// expect(evt.target._name).toBe('_D_');
		// expect(previous).toBe(stage ? 'D+B+A' : undefined);
		// expect(current).toBe(stage ? 'D+B+a' : 'D+B+A');
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
	onError((err) => {
		throw err;
	});
	const a = obs(
		'A',
		// {
		// 	name: '_A_',
		// }
	);
	const b = obs(
		() => ({
			b: a.get(),
		}),
		// {
		// 	name: '_B_',
		// },
	);

	let stage = 0;
	a.onChange((current, previous) => {
		// expect(evt.target._name).toBe('_A_');
		expect(previous).toBe('A');
		expect(current).toBe('a');
	});
	b.onChange((current, previous) => {
		// expect(evt.target._name).toBe('_B_');
		expect(previous).toEqual(
			stage === 0
				? undefined
				: {
						b: 'A',
				  },
		);
		expect(current).toEqual(
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

test('test11', () => {
	let check = '';
	let toggle = 0;
	const leaf = obs('foo');
	leaf.onChange((current, previous) => {
		check += `||LEAF_${previous}->${current}`;
	});
	const sub = obs(() => {
		return `${leaf.get()}-bar`;
	});
	sub.onChange((current, previous) => {
		check += `||SUB_${previous}->${current}`;
	});
	const root = obs(() => {
		sub.get();
		toggle++;
		return toggle !== 1;
	});
	root.onChange((current, previous) => {
		check += `||ROOT_${previous}->${current}`;
	});
	expect(root.get()).toBe(false);
	expect(sub.get()).toBe('foo-bar');
	expect(check).toBe('||SUB_undefined->foo-bar||ROOT_undefined->false');
	check = '';
	leaf.set('one');
	expect(root.get()).toBe(true);
	expect(sub.get()).toBe('one-bar');
	expect(check).toBe('||LEAF_foo->one||SUB_foo-bar->one-bar||ROOT_false->true');
	check = '';
	leaf.set('two');
	expect(root.get()).toBe(true);
	expect(sub.get()).toBe('two-bar');
	expect(check).toBe('||LEAF_one->two||SUB_one-bar->two-bar');
});
