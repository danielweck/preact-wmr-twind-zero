/* eslint-disable jest/no-commented-out-tests */

import { afterEach, beforeEach, expect, test } from 'vitest';

import { type TObsEventListener, get, obs, on, set } from './index.js';

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
});
afterEach(() => {
	// if ('onunhandledrejection' in window) {
	// 	window.removeEventListener('unhandledrejection', onUnhandledRejection);
	// 	if (_unhandledEvents.length) {
	// 		throw _unhandledEvents[0].reason ?? _unhandledEvents[0];
	// 	}
	// }
});

test('test1', () => {
	const a = obs(1);
	expect(get(a)).toBe(1);

	// const b = new Obs(2);
	// expect(get(b)).toBe(2);

	// const c = Obs(3);
	// expect(get(c)).toBe(3);
});

test('test2', () => {
	const a = obs(1);
	set(a, 2);
	expect(get(a)).toBe(2);

	// const b = new Obs(2);
	// set(b,3);
	// expect(get(b)).toBe(3);

	// const c = Obs(3);
	// set(c,4);
	// expect(get(c)).toBe(4);
});

test('test3b', () => {
	let order = '0';
	const a = obs(1);
	on(a, (_error, current, previous) => {
		order += '2';
		expect(get(a)).toBe(2);
		expect(current).toBe(2);
		expect(previous).toBe(1);
	});
	order += '1';
	expect(get(a)).toBe(1);
	set(a, 2);
	order += '3';
	expect(order).toBe('0123');
});

// test('test4', () => {
// 	const a = obs(1);
// 	expect(a).instanceOf(Obs);
// });

test('test5', () => {
	const a = obs(1);

	on(a, (_error, current, previous) => {
		expect(current).toEqual(2);
		expect(previous).toEqual(1);
	});

	set(a, 2);
});

test('test6', () => {
	const a = obs(1);

	let count = 0;
	const listener: TObsEventListener<number> = (error) => {
		if (error) {
			return;
		}
		count++;
	};
	const off = on(a, listener);
	expect(count).toBe(0);
	off();
	set(a, 2);
	expect(count).toBe(0);
});

test('test7', () => {
	const a = obs(1);

	let count = 0;
	const listener: TObsEventListener<number> = (error) => {
		if (error) {
			return;
		}
		count++;
	};
	on(a, listener);
	const off = on(a, listener);
	expect(count).toBe(0);
	set(a, 2);
	expect(count).toBe(1);
	off();
	set(a, 3);
	expect(count).toBe(1);
});

test('test8a', () => {
	let order = '0';

	const a = obs(
		1,
		// 	{
		// 	name: '_A_',
		// }
	);
	const b = obs(
		() => {
			if (get(a) === 2) {
				order += '4';
				throw new TypeError('!!');
			}
			order += '1';
			return get(a) + 1;
		},
		// {
		// 	name: '_B_',
		// },
	);

	on(b, (error) => {
		if (!error) {
			return;
		}
		order += '5';
		expect(error).instanceOf(TypeError);
		expect(error.message).toBe('!!');
	});
	expect(get(b)).toBe(2);
	order += '2';
	set(a, 2);
	order += '3';
	let err: Error | undefined;
	try {
		get(b);
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
	const a = obs(
		'A',
		// {
		// 	name: '_A_',
		// }
	);
	const b = obs(
		() => {
			return `B+${get(a)}`;
		},
		// {
		// 	name: '_B_',
		// },
	);
	const c = obs(
		() => {
			return `C+${get(b)}`;
		},
		// {
		// 	name: '_C_',
		// },
	);
	const d = obs(
		() => {
			return `D+${get(b)}`;
		},
		// {
		// 	name: '_D_',
		// },
	);

	let stage = 0;
	on(a, (_error, current, previous) => {
		// expect(evt.target._name).toBe('_A_');
		expect(previous).toBe('A');
		expect(current).toBe('a');
	});
	on(b, (_error, current, previous) => {
		// expect(evt.target._name).toBe('_B_');
		expect(previous).toBe(stage ? 'B+A' : undefined);
		expect(current).toBe(stage ? 'B+a' : 'B+A');
	});
	on(c, (_error, current, previous) => {
		// expect(evt.target._name).toBe('_C_');
		expect(previous).toBe(stage ? 'C+B+A' : undefined);
		expect(current).toBe(stage ? 'C+B+a' : 'C+B+A');
	});
	on(d, (_error, current, previous) => {
		// expect(true).toBe(false);
		// expect(evt.target._name).toBe('_D_');
		expect(previous).toBe(stage ? 'D+B+A' : undefined);
		expect(current).toBe(stage ? 'D+B+a' : 'D+B+A');
	});
	expect(get(b)).toBe('B+A');
	expect(get(c)).toBe('C+B+A');
	expect(get(d)).toBe('D+B+A');
	stage++;
	set(a, 'a');
	expect(get(b)).toBe('B+a');
	expect(get(c)).toBe('C+B+a');
	expect(get(d)).toBe('D+B+a');
});

test('test10', () => {
	const a = obs(
		'A',
		// {
		// 	name: '_A_',
		// }
	);
	const b = obs(
		() => ({
			b: get(a),
		}),
		// {
		// 	name: '_B_',
		// },
	);

	let stage = 0;
	on(a, (_error, current, previous) => {
		// expect(evt.target._name).toBe('_A_');
		expect(previous).toBe('A');
		expect(current).toBe('a');
	});
	on(b, (_error, current, previous) => {
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
	expect(get(b)).toEqual({
		b: 'A',
	});
	stage++;
	set(a, 'a');
	expect(get(b)).toEqual({
		b: 'a',
	});
});

test('test11', () => {
	let check = '';
	let toggle = 0;
	const leaf = obs('foo');
	on(leaf, (_error, current, previous) => {
		check += `||LEAF_${previous}->${current}`;
	});
	const sub = obs(() => {
		return `${get(leaf)}-bar`;
	});
	on(sub, (_error, current, previous) => {
		check += `||SUB_${previous}->${current}`;
	});
	const root = obs(() => {
		get(sub);
		toggle++;
		return toggle !== 1;
	});
	on(root, (_error, current, previous) => {
		check += `||ROOT_${previous}->${current}`;
	});
	expect(get(root)).toBe(false);
	expect(get(sub)).toBe('foo-bar');
	expect(check).toBe('||SUB_undefined->foo-bar||ROOT_undefined->false');
	check = '';
	set(leaf, 'one');
	expect(get(root)).toBe(true);
	expect(get(sub)).toBe('one-bar');
	expect(check).toBe('||LEAF_foo->one||SUB_foo-bar->one-bar||ROOT_false->true');
	check = '';
	set(leaf, 'two');
	expect(get(root)).toBe(true);
	expect(get(sub)).toBe('two-bar');
	expect(check).toBe('||LEAF_one->two||SUB_one-bar->two-bar');
});
