/* eslint-disable jest/no-commented-out-tests */

// This code was shamelessly adapted from Statin, for educational / learning purposes (lots of renaming, type re-organisation, etc. ... but otherwise same logic):
// https://github.com/tomasklaen/statin/blob/d9d35e3def67b60a663a3afc4d6f2ab8f8b9c5ff/test.ts#L1

import { expect, test } from 'vitest';

import { createPreactiveAction, preactiveAction } from './action.js';
import { preactiveComputedSignal } from './computed.js';
import { preactiveOnceReaction, preactiveReaction } from './reaction.js';
import { preactiveSignal, setStrictSignalMustChangeInsideAction } from './signal.js';
import type { PreactiveDisposerFunction } from './types.js';

setStrictSignalMustChangeInsideAction(false);

// NOTE that console.log() does not work in shell when deep inside Promise callbacks (Vitest problem?)
// ... in this case use this to trigger the trace of console outputs:
// process.stdout.write('...');

// NOTE that expect() statements throw exceptions that get swallowed in the default onError handlers!

test('signal.editReactiveValue(val) does not read() the reactive signal (which causes dependency registration), uses the raw value directly', () => {
	let testPlan = 0;
	const s = preactiveSignal('foo');

	let v: string | undefined;
	let e = 0;
	preactiveReaction(
		(_dispose) => {
			v = s.editReactiveValue((_value) => {
				return 'bar';
			});
		},
		(_preactiveValue, _dispose) => {
			e++;
		},
		{
			immediateEffect: true,
		},
	);

	expect(e).toBe(1);
	testPlan++;

	expect(v).toBe('bar');
	testPlan++;

	s('123');

	expect(s.reactiveValue).toBe('123');
	testPlan++;

	expect(e).toBe(1);
	testPlan++;

	expect(v).toBe('bar');
	testPlan++;

	expect(testPlan).toBe(5);
});

test('signal(val) does not read() the reactive signal (which causes dependency registration), uses the raw value directly', () => {
	let testPlan = 0;
	const s = preactiveSignal('foo');

	let v: string | undefined;
	let e = 0;
	preactiveReaction(
		(_dispose) => {
			v = s('bar');
		},
		(_preactiveValue, _dispose) => {
			e++;
		},
		{
			immediateEffect: true,
		},
	);

	expect(e).toBe(1);
	testPlan++;

	expect(v).toBe('bar');
	testPlan++;

	s('123');

	expect(s.reactiveValue).toBe('123');
	testPlan++;

	expect(e).toBe(1);
	testPlan++;

	expect(v).toBe('bar');
	testPlan++;

	expect(testPlan).toBe(5);
});

test('signal.editReactiveValue() returns the reactive value', () => {
	let testPlan = 0;
	const s = preactiveSignal('foo');
	const v = s.editReactiveValue((value) => {
		expect(value).toBe('foo');
		testPlan++;
		return 'bar';
	});
	expect(v).toBe('bar');
	testPlan++;
	expect(testPlan).toBe(2);
});

test('signal.write() returns the reactive value (like signal.read(), for chaining)', () => {
	let testPlan = 0;
	const s = preactiveSignal('foo');
	expect(s()).toBe('foo');
	testPlan++;
	expect(s('bar')).toBe('bar');
	testPlan++;
	expect(testPlan).toBe(2);
});

test('signal.editReactiveValue() returns the reactive value (array new)', () => {
	let testPlan = 0;
	const arr = ['foo'];
	const arr2 = ['foo', 'bar'];
	const s = preactiveSignal(arr);
	const v = s.editReactiveValue((value) => {
		expect(value).toBe(arr);
		testPlan++;
		expect(value).toEqual(['foo']);
		testPlan++;
		return arr2;
	});
	expect(v).not.toBe(arr);
	testPlan++;
	expect(v).toBe(arr2);
	testPlan++;
	expect(v).toEqual(['foo', 'bar']);
	testPlan++;
	const ret = s();
	expect(ret).not.toBe(arr);
	testPlan++;
	expect(ret).toBe(arr2);
	testPlan++;
	expect(ret).toEqual(['foo', 'bar']);
	testPlan++;
	expect(testPlan).toBe(8);
});

test('signal.editReactiveValue() returns the reactive value (array push)', () => {
	let testPlan = 0;
	const arr = ['foo'];
	const s = preactiveSignal(arr);
	const v = s.editReactiveValue((value) => {
		expect(value).toBe(arr);
		testPlan++;
		expect(value).toEqual(['foo']);
		testPlan++;
		value.push('bar');
		return value;
	});
	expect(v).toBe(arr);
	testPlan++;
	expect(v).toEqual(['foo', 'bar']);
	testPlan++;
	const ret = s();
	expect(ret).toBe(arr);
	testPlan++;
	expect(ret).toEqual(['foo', 'bar']);
	testPlan++;
	expect(testPlan).toBe(6);
});

test('signal.write() returns the reactive value (like signal.read(), for chaining) (array new)', () => {
	let testPlan = 0;
	const arr = ['foo'];
	const arr2 = ['foo', 'bar'];
	const s = preactiveSignal(arr);
	expect(s()).toBe(arr);
	testPlan++;
	expect(s()).toEqual(['foo']);
	testPlan++;
	const ret = s(arr2);
	expect(ret).not.toBe(arr);
	testPlan++;
	expect(ret).toBe(arr2);
	testPlan++;
	expect(ret).toEqual(['foo', 'bar']);
	testPlan++;
	expect(testPlan).toBe(5);
});

test('signal.write() returns the reactive value (like signal.read(), for chaining) (array push)', () => {
	let testPlan = 0;
	const arr = ['foo'];
	const s = preactiveSignal(arr);
	expect(s()).toBe(arr);
	testPlan++;
	expect(s()).toEqual(['foo']);
	testPlan++;
	const v = s();
	v.push('bar');
	const ret = s(v);
	expect(ret).toBe(v);
	testPlan++;
	expect(ret).toEqual(['foo', 'bar']);
	testPlan++;
	expect(testPlan).toBe(4);
});

test('calling a signal with no argument reads it', () => {
	const s = preactiveSignal('foo');
	expect(s()).toBe('foo');
});

test('calling a signal with one argument sets it', () => {
	const s = preactiveSignal('foo');
	s('bar');
	expect(s()).toBe('bar');
});

test('signal.reactiveValue points to the current value', () => {
	const obj = {};
	const s = preactiveSignal(obj);
	expect(s.reactiveValue).toBe(obj);
	s('foo');
	expect(s.reactiveValue).toBe('foo');
});

// test('signal.toJSON() returns current value', () => {
// 	const obj = {};
// 	const s = preactiveSignal(obj);
// 	expect(s.toJSON()).toBe( obj);
// });

// test('JSON.stringify() serializes a signal', () => {
// 	const s = preactiveSignal('foo');
// 	expect(JSON.stringify(s)).toBe( '"foo"');
// });

// test('JSON.stringify() serializes a signal deeply', () => {
// 	const s = preactiveSignal({
// 		foo: preactiveSignal('foo'),
// 		bar: preactiveSignal([preactiveSignal(1), preactiveSignal(2)]),
// 	});
// 	expect(JSON.stringify(s), '{"foo":"foo","bar":[1).toBe(2]}');
// });

// test('toJS() unwraps a signal', () => {
// 	const s = preactiveSignal('foo');
// 	expect(toJS(s)).toBe( 'foo');
// });

// test('toJS() unwraps a signal deeply', () => {
// 	const s = preactiveSignal({
// 		foo: preactiveSignal('foo'),
// 		bar: preactiveSignal([preactiveSignal(1), preactiveSignal(2)]),
// 	});
// 	expect(toJS(s)).toEqual({foo: 'foo', bar: [1, 2]});
// });

// test('nameFn() attaches displayName to functions', () => {
// 	function rawFunction() {}
// 	const arrowFunction = () => {};
// 	expect(nameFn('FOO', rawFunction).displayName).toBe( 'FOO');
// 	expect(nameFn('FOO', arrowFunction).displayName).toBe( 'FOO');
// 	expect(nameFn('FOO', function () {}).displayName).toBe( 'FOO');
// 	expect(nameFn('FOO', function bar() {}).displayName).toBe( 'FOO');
// 	expect(nameFn('FOO', () => {}).displayName).toBe( 'FOO');
// });

test('preactiveOnceReaction() listens and execute effect once', () => {
	const s = preactiveSignal('foo');
	let count = 0;
	preactiveOnceReaction(
		(_dispose) => {
			s();
		},
		() => {
			count++;
		},
	);
	expect(count).toBe(0);
	s('bar');
	expect(count).toBe(1);
	s('baz');
	expect(count).toBe(1);
});

test('preactiveOnceReaction() passes a disposer to action as 1st argument', () => {
	const s = preactiveSignal('foo');
	let count = 0;
	preactiveOnceReaction(
		(dispose) => {
			s();
			dispose();
		},
		() => {
			count++;
		},
	);
	s('bar');
	expect(count).toBe(0);
});

test('preactiveOnceReaction() internal disposer clears even dependencies created after its been called', () => {
	const a = preactiveSignal('foo');
	const b = preactiveSignal('foo');
	let count = 0;
	preactiveOnceReaction(
		(dispose) => {
			a();
			dispose();
			b();
		},
		() => {
			count++;
		},
	);
	a('bar');
	b('bar');
	expect(count).toBe(0);
});

test('signal.editReactiveValue() runs immediately, and passes the current value as 1st argument', () => {
	const s = preactiveSignal('foo');
	let testPlan = 0;
	s.editReactiveValue((value) => {
		expect(value).toBe('foo');
		testPlan++;
		return value;
	});
	expect(testPlan).toBe(1);
});

test('signal.editReactiveValue() sends a changed signal after editor finishes', () => {
	const s = preactiveSignal(['foo', 'bar']);
	let testPlan = 0;
	let c: string[] | undefined;
	preactiveOnceReaction(
		(_dispose) => {
			s();
		},
		() => {
			c = s();
		},
	);
	s.editReactiveValue((v) => {
		v.pop();
		return v;
	});

	expect(c).toEqual(['foo']);
	testPlan++;

	expect(testPlan).toBe(1);
});

test('preactiveReaction(action) continually executes action as dependencies change', () => {
	const foo = preactiveSignal('foo');
	const bar = preactiveSignal('bar');
	const results: string[] = [];
	preactiveReaction((_dispose) => {
		results.push(foo());
		results.push(bar());
		return 0;
	});
	foo('fam');
	expect(results).toEqual(['foo', 'bar', 'fam', 'bar']);
	bar('baz');
	expect(results).toEqual(['foo', 'bar', 'fam', 'bar', 'fam', 'baz']);
});

test('preactiveReaction(action) returns its disposer', () => {
	const foo = preactiveSignal('foo');
	const bar = preactiveSignal('bar');
	const results: string[] = [];
	const dispose = preactiveReaction((_dispose) => {
		results.push(foo());
		results.push(bar());
		return 0;
	});
	bar('baz');
	expect(results).toEqual(['foo', 'bar', 'foo', 'baz']);
	dispose();
	foo('fam');
	expect(results).toEqual(['foo', 'bar', 'foo', 'baz']);
});

test('preactiveReaction(action) passes disposer as 1st argument to the action', () => {
	const s = preactiveSignal('foo');
	const cancel = preactiveSignal(false);
	const results: string[] = [];
	preactiveReaction((dispose) => {
		results.push(s());
		if (cancel()) {
			dispose();
		}
		return 0;
	});
	expect(results).toEqual(['foo']);
	s('bar');
	expect(results).toEqual(['foo', 'bar']);
	cancel(true);
	expect(results).toEqual(['foo', 'bar', 'bar']);
	s('baz');
	expect(results).toEqual(['foo', 'bar', 'bar']);
});

test('preactiveReaction(action) doesnt allow action to trigger itself', () => {
	const a = preactiveSignal(1);
	let testPlan = 0;
	let c = 0;
	preactiveReaction((_dispose) => {
		a(a() + 1);
		c++;
		return 0;
	});
	expect(c).toBe(1);
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, {onError}) catches and triggers onError 1', () => {
	let testPlan = 0;
	let c: string | undefined;
	preactiveReaction(
		function MyReaction1(_dispose) {
			throw new Error('foo');
			// return 0;
		},
		undefined,
		{
			onErrorWithDisposer: (exception, _dispose) => {
				c = (exception as Error).message;
			},
		},
	);
	expect(c).toBe(
		'preactiveReaction.createOnceLoop.preactiveOnceReaction [MyReaction1] ==> [preactiveReaction(effect.displayName)] --- preactiveOnceReaction [actionWrap_MyReaction1] ==> [onceEffect_effectWrap_$] --- foo',
	);
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, {onError}) catches and triggers onError 2', () => {
	let testPlan = 0;
	let c: string | undefined;
	const MyReaction2 = (_dispose: PreactiveDisposerFunction) => {
		throw new Error('bar');
		// return 0;
	};
	preactiveReaction(MyReaction2, undefined, {
		onErrorWithDisposer: (exception, _dispose) => {
			c = (exception as Error).message;
		},
	});
	expect(c).toBe(
		'preactiveReaction.createOnceLoop.preactiveOnceReaction [MyReaction2] ==> [preactiveReaction(effect.displayName)] --- preactiveOnceReaction [actionWrap_MyReaction2] ==> [onceEffect_effectWrap_$] --- bar',
	);
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, {onError}) catches and triggers onError 3', () => {
	let testPlan = 0;
	let c: string | undefined;
	const MyReaction3 = (_dispose: PreactiveDisposerFunction) => {
		throw new Error('here');
		// return 0;
	};
	MyReaction3.displayName = '__MyReaction3__';

	preactiveReaction(MyReaction3, undefined, {
		onErrorWithDisposer: (exception, _dispose) => {
			c = (exception as Error).message;
		},
	});

	expect(c).toBe(
		'preactiveReaction.createOnceLoop.preactiveOnceReaction [__MyReaction3__] ==> [preactiveReaction(effect.displayName)] --- preactiveOnceReaction [actionWrap___MyReaction3__] ==> [onceEffect_effectWrap_$] --- here',
	);
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect, {onError}) catches and triggers onError 1', () => {
	let testPlan = 0;
	let c: string | undefined;
	const s = preactiveSignal(1);
	preactiveReaction(
		function MyReaction1(_dispose) {
			return s();
		},
		function MyEffect1(_reactiveValue, _dispose) {
			throw new Error('foo');
		},
		{
			onErrorWithDisposer: (exception, _dispose) => {
				c = (exception as Error).message;
			},
		},
	);
	s(2);

	expect(c).toBe('preactiveReaction.effectWrap [MyReaction1] ==> [MyEffect1] --- foo');
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect, {onError}) catches and triggers onError 2', () => {
	let testPlan = 0;
	let c: string | undefined;
	const s = preactiveSignal(1);
	const MyReaction2 = (_dispose: PreactiveDisposerFunction) => {
		return s();
	};
	const MyEffect2 = (_reactiveValue: number, _dispose: PreactiveDisposerFunction) => {
		throw new Error('bar');
	};
	preactiveReaction(MyReaction2, MyEffect2, {
		onErrorWithDisposer: (exception, _dispose) => {
			c = (exception as Error).message;
		},
	});
	s(2);
	expect(c).toBe('preactiveReaction.effectWrap [MyReaction2] ==> [MyEffect2] --- bar');
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect, {onError}) catches and triggers onError 3', () => {
	let testPlan = 0;
	let c: string | undefined;
	const s = preactiveSignal(1);
	const MyReaction3 = (_dispose: PreactiveDisposerFunction) => {
		return s();
	};
	MyReaction3.displayName = '__MyReaction3__';
	const MyEffect3 = (_reactiveValue: number, _dispose: PreactiveDisposerFunction) => {
		throw new Error('here');
	};
	MyEffect3.displayName = '__MyEffect3__';

	preactiveReaction(MyReaction3, MyEffect3, {
		onErrorWithDisposer: (exception, _dispose) => {
			c = (exception as Error).message;
		},
	});
	s(2);
	expect(c).toBe('preactiveReaction.effectWrap [__MyReaction3__] ==> [__MyEffect3__] --- here');
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect) executes the effect as action dependencies change', () => {
	const s = preactiveSignal('foo');
	let actionCount = 0;
	let effectCount = 0;
	preactiveReaction(
		(_dispose) => {
			actionCount++;
			return s();
		},
		(_reactiveValue, _dispose) => {
			effectCount++;
		},
	);
	expect(actionCount).toBe(1);
	expect(effectCount).toBe(0);
	s('bar');
	expect(actionCount).toBe(2);
	expect(effectCount).toBe(1);
});

test('preactiveReaction(action, effect) passes the value returned by action to effect', () => {
	let testPlan = 0;
	const s = preactiveSignal('foo');
	let c: string | undefined;
	preactiveReaction(
		(_dispose) => {
			return `${s()}Action`;
		},
		(reactiveValue, _dispose) => {
			c = reactiveValue;
		},
	);
	s('bar');
	expect(c).toBe('barAction');
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect) passes its disposer as 1st argument to action', () => {
	const s = preactiveSignal('foo');
	const cancel = preactiveSignal(false);
	let actionCount = 0;
	let effectCount = 0;
	preactiveReaction(
		(dispose) => {
			actionCount++;
			s();
			if (cancel()) {
				dispose();
			}
			return 0;
		},
		(_reactiveValue, _dispose) => {
			effectCount++;
		},
	);
	expect(actionCount).toBe(1);
	expect(effectCount).toBe(0);
	cancel(true);
	expect(actionCount).toBe(2);
	expect(effectCount).toBe(1);
	s('bar');
	expect(actionCount).toBe(2);
	expect(effectCount).toBe(1);
});

test('preactiveReaction(action, effect) passes its disposer as 2nd argument to effect', () => {
	const s = preactiveSignal('foo');
	let actionCount = 0;
	let effectCount = 0;
	preactiveReaction(
		() => {
			actionCount++;
			return s();
		},
		(_reactiveValue, dispose) => {
			effectCount++;
			dispose();
		},
	);
	expect(actionCount).toBe(1);
	expect(effectCount).toBe(0);
	s('bar');
	expect(actionCount).toBe(2);
	expect(effectCount).toBe(1);
	s('baz');
	expect(actionCount).toBe(2);
	expect(effectCount).toBe(1);
});

test('preactiveReaction(action, effect) doesnt allow action to trigger itself', () => {
	let testPlan = 0;
	const a = preactiveSignal(1);

	let c1 = 0;
	let c2 = 0;
	preactiveReaction(
		(_dispose) => {
			a(2);
			a();
			c1++;
			return 0;
		},
		(_reactiveValue, _dispose) => {
			c2++;
		},
	);
	expect(c1).toBe(1);
	testPlan++;
	expect(c2).toBe(0);
	testPlan++;
	a(-1);
	expect(c1).toBe(2);
	testPlan++;
	expect(c2).toBe(1);
	testPlan++;
	expect(testPlan).toBe(4);
});

test('preactiveReaction(action, effect) detects and disposes circular reactions', () => {
	const count = preactiveSignal(-1);
	const myAction = () => {
		return count();
	};
	const myEffect = (currentCount: number) => {
		return count(currentCount + 1);
	};
	let c: string | undefined;
	preactiveReaction(myAction, myEffect, {
		onErrorWithDisposer: (exception, _dispose) => {
			c = (exception as Error)?.message;
		},
	});
	preactiveAction(() => {
		count(0);
	});
	expect(c).toBe(
		'preactiveReaction.createOnceLoop.preactiveOnceReaction [myAction] ==> [myEffect] --- preactiveOnceReaction.observer.preactiveBulkEffects [actionWrap_myAction] ==> [onceEffect_effectWrap_myEffect] --- MAX_REACTION_DEPTH!! (100)',
	);
	expect(count.reactiveValue).toBe(101);
});

test('preactiveReaction(action, effect, {immediate: true}) triggers effect immediately', () => {
	let testPlan = 0;
	const a = preactiveSignal(1);

	let c = 0;
	preactiveReaction(
		(_dispose) => {
			return a();
		},
		(reactiveValue, _dispose) => {
			c = reactiveValue;
		},
		{ immediateEffect: true },
	);
	expect(c).toBe(1);
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect, {onError}) catches and triggers onError from action', () => {
	let testPlan = 0;
	let c: string | undefined;
	preactiveReaction(
		function MyReaction(_dispose) {
			throw new Error('hello');
		},
		function MyEffect(_reactiveValue, _dispose) {
			// nope
		},
		{
			onErrorWithDisposer: (exception, _dispose) => {
				c = (exception as Error).message;
			},
		},
	);
	expect(c).toBe(
		'preactiveReaction.createOnceLoop.preactiveOnceReaction [MyReaction] ==> [MyEffect] --- preactiveOnceReaction [actionWrap_MyReaction] ==> [onceEffect_effectWrap_MyEffect] --- hello',
	);
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect, {onError}) catches and triggers onError from effect', () => {
	let testPlan = 0;
	const s = preactiveSignal(-1);

	let c: string | undefined;
	preactiveReaction(
		function MyReaction(_dispose) {
			return s();
		},
		function MyEffect(_reactiveValue, _dispose) {
			throw new Error('hi');
		},
		{
			onErrorWithDisposer: (exception, _dispose) => {
				c = (exception as Error).message;
			},
		},
	);
	s(0);
	expect(c).toBe('preactiveReaction.effectWrap [MyReaction] ==> [MyEffect] --- hi');
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect, {immediate, onError}) catches and triggers onError from effect', () => {
	let testPlan = 0;
	let c: string | undefined;
	preactiveReaction(
		function MyReaction(_dispose) {
			// nope
		},
		function MyEffect(_reactiveValue, _dispose) {
			throw new Error('bah');
		},
		{
			immediateEffect: true,
			onErrorWithDisposer: (exception, _dispose) => {
				c = (exception as Error).message;
			},
		},
	);
	expect(c).toBe('preactiveReaction.effectWrap [MyReaction] ==> [MyEffect] --- bah');
	testPlan++;
	expect(testPlan).toBe(1);
});

test('preactiveComputedSignal() creates a computed signal', () => {
	const foo = preactiveSignal('foo');
	const c = preactiveComputedSignal(() => {
		return `${foo()}bar`;
	});
	expect(c()).toBe('foobar');
});

test('preactiveComputedSignal() only re-computes when one of the dependencies change', () => {
	const foo = preactiveSignal('foo');
	const bar = preactiveSignal('bar');
	let count = 0;
	const c = preactiveComputedSignal(() => {
		count++;
		return `${foo()}${bar()}`;
	});
	expect(c()).toBe('foobar');
	expect(c()).toBe('foobar');
	expect(c()).toBe('foobar');
	foo('fam');
	expect(c()).toBe('fambar');
	expect(count).toBe(2);
});

test('preactiveComputedSignal() propagates changed signals of its dependencies', () => {
	let testPlan = 0;
	const foo = preactiveSignal('foo');
	const bar = preactiveSignal('bar');
	const a = preactiveComputedSignal(() => {
		return `${foo()}${bar()}`;
	});
	const b = preactiveComputedSignal(() => {
		return `${a()}Parent`;
	});

	let c1 = 0;
	let c2 = 0;
	preactiveOnceReaction(
		(_dispose) => {
			a();
		},
		() => {
			c1++;
		},
	);
	expect(c1).toBe(0);
	testPlan++;
	foo('fam');
	expect(c1).toBe(1);
	testPlan++;
	preactiveOnceReaction(
		(_dispose) => {
			b();
		},
		() => {
			c2++;
		},
	);
	expect(c2).toBe(0);
	testPlan++;
	bar('baz');
	expect(c2).toBe(1);
	testPlan++;
	expect(testPlan).toBe(4);
});

test('preactiveAction() de-duplicates and bulks all updates to the end', () => {
	let testPlan = 0;
	const a = preactiveSignal(1);
	const b = preactiveSignal(1);
	const outside = preactiveSignal(1);
	const c = preactiveComputedSignal(() => {
		return `${a()}${outside()}`;
	});

	let v = 0;
	preactiveReaction((_dispose) => {
		v++;
		a();
		b();
		c();
	});

	expect(v).toBe(1);
	testPlan++;
	preactiveAction(() => {
		a(2);
		a(3);
		b(2);
		outside(2);
	});
	expect(v).toBe(2);
	testPlan++;
	expect(testPlan).toBe(2);
});

test('preactiveAction() returns the value', () => {
	expect(
		preactiveAction(() => {
			return 'foo';
		}),
	).toBe('foo');
});

test('preactiveAction() prevents signals from being tracked', () => {
	const a = preactiveSignal(1);
	const b = preactiveSignal(1);
	const c = preactiveSignal(1);
	let count = 0;
	preactiveReaction(() => {
		count++;
		a();
		preactiveAction(() => {
			return b();
		});
		c();
	});
	expect(count).toBe(1);
	a(2);
	expect(count).toBe(2);
	b(2);
	expect(count).toBe(2);
	c(2);
	expect(count).toBe(3);
});

test('preactiveAction() doesnt prevent computed signal from updating', () => {
	const a = preactiveSignal('f');
	const b = preactiveSignal('b');
	const aIs = preactiveComputedSignal(() => `a:${a()}`);
	const bIs = preactiveComputedSignal(() => `b:${b()}`);
	const allAre = preactiveComputedSignal(() => `${aIs()}, ${bIs()}`);
	preactiveAction(() => {
		expect(allAre()).toBe('a:f, b:b');
		b('bar');
		expect(allAre()).toBe('a:f, b:bar');
	});
});

test('preactiveAction() triggers effects even when it throws', () => {
	let testPlan1 = 0;
	let testPlan2 = 0;
	const a = preactiveSignal('foo');

	preactiveReaction(() => {
		a();
		expect(true).toBe(true);
		testPlan1++;
	});
	try {
		preactiveAction(() => {
			a('bar');
			throw new Error('foo');
		});
	} catch (_e) {
		testPlan2++;
	}

	expect(testPlan1).toBe(2);
	expect(testPlan2).toBe(1);
});

test('preactiveAction() inside preactiveAction() doesnt resume dependency tracking', () => {
	let testPlan = 0;
	const a = preactiveSignal('f');
	const b = preactiveSignal('b');

	preactiveReaction(
		() => {
			preactiveAction(() => {
				a();
				preactiveAction(() => {
					// nope
				});
				b();
			});
		},
		() => {
			expect(true).toBe(true);
			testPlan++;
		},
	);
	a('foo');
	b('bar');
	expect(testPlan).toBe(0);
});

test('preactiveOnceReaction() inside preactiveAction() still tracks its dependencies', () => {
	let testPlan = 0;
	const s = preactiveSignal('foo');

	preactiveReaction(() => {
		preactiveOnceReaction(
			() => s(),
			() => {
				expect(true).toBe(true);
				testPlan++;
			},
		);
		s('bar');
	});
	expect(testPlan).toBe(1);
});

test('preactiveReaction() inside preactiveAction() still tracks its dependencies', () => {
	let testPlan = 0;
	const s = preactiveSignal('foo');

	preactiveAction(() => {
		const dispose = preactiveReaction(
			() => s(),
			() => {
				expect(true).toBe(true);
				testPlan++;
			},
		);
		s('bar');
		dispose();
	});

	expect(testPlan).toBe(1);
});

test('preactiveOnceReaction() inside preactiveOnceReaction() doesnt cancel tracking', () => {
	let testPlan = 0;
	const s = preactiveSignal('f');

	preactiveOnceReaction(
		() => {
			preactiveOnceReaction(
				() => {
					// nope
				},
				() => {
					// nope
				},
			);
			s();
		},
		() => {
			expect(true).toBe(true);
			testPlan++;
		},
	);
	s('foo');
	expect(testPlan).toBe(1);
});

test('preactiveComputedSignal() updates even within an action', () => {
	let testPlan = 0;
	const a = preactiveSignal('f');
	const b = preactiveSignal('b');
	let count = 0;
	const c = preactiveComputedSignal(() => {
		count++;
		return `${a()}${b()}`;
	});

	preactiveAction(() => {
		expect(c()).toBe('fb');
		testPlan++;
		a('foo');
		b('bar');
		expect(c()).toBe('foobar');
		testPlan++;
		expect(count).toBe(2);
		testPlan++;
	});

	expect(testPlan).toBe(3);
});

test('createAction() wraps the action, inheriting arguments and return value', () => {
	let testPlan = 0;
	const a = preactiveSignal(1);
	const b = preactiveSignal(1);
	const outside = preactiveSignal(1);
	const c = preactiveComputedSignal(() => {
		return `${a()}${outside()}`;
	});

	preactiveReaction(() => {
		expect(true).toBe(true);
		testPlan++;
		a();
		b();
		c();
	});
	const action = createPreactiveAction((value: string) => {
		a(2);
		a(3);
		b(2);
		outside(2);
		return `${value}bar`;
	});
	expect(action('foo')).toBe('foobar');
	testPlan++;
	expect(testPlan).toBe(3);
});

test('preactiveComputedSignal() describes errors correctly', () => {
	const a = preactiveComputedSignal(function ComputeA() {
		throw new Error('foo1');
	});

	const ComputeB = () => {
		throw new Error('foo2');
	};
	const b = preactiveComputedSignal(ComputeB);

	const ComputeC = () => {
		throw new Error('foo3');
	};
	ComputeC.displayName = '__ComputeC__';
	const c = preactiveComputedSignal(ComputeC);

	let err1: Error | undefined;
	try {
		a();
	} catch (e) {
		err1 = e as Error;
	}
	expect((err1 as Error).message).toBe('preactiveComputedSignal.computeFunction [ComputeA] --- foo1');

	let err2: Error | undefined;
	try {
		b();
	} catch (e) {
		err2 = e as Error;
	}
	expect((err2 as Error).message).toBe('preactiveComputedSignal.computeFunction [ComputeB] --- foo2');

	let err3: Error | undefined;
	try {
		c();
	} catch (e) {
		err3 = e as Error;
	}
	expect((err3 as Error).message).toBe('preactiveComputedSignal.computeFunction [__ComputeC__] --- foo3');
});

test('preactiveComputedSignal() recovers from errors', () => {
	const errorOut = preactiveSignal(true);
	const c = preactiveComputedSignal(function ComputeFoo() {
		if (errorOut()) {
			throw new Error('foo');
		}
		return 'foo';
	});

	expect(() => {
		c();
	}).toThrowError('preactiveComputedSignal.computeFunction [ComputeFoo] --- foo');

	expect(() => {
		c();
	}).toThrowError(
		'preactiveComputedSignal.computeFunction [ComputeFoo] --- preactiveComputedSignal.computeFunction [ComputeFoo] --- foo',
	);

	errorOut(false);
	expect(c()).toBe('foo');
});

test('preactiveReaction(action) recovers from errors', () => {
	let testPlan = 0;
	const errorOut = preactiveSignal(true);

	preactiveReaction(
		function MyReaction(_dispose) {
			if (errorOut()) {
				throw new Error('foo');
			}
			expect(true).toBe(true);
			testPlan++;
		},
		undefined,
		{
			onErrorWithDisposer: (exception, _dispose) => {
				expect((exception as Error).message).toBe(
					'preactiveReaction.createOnceLoop.preactiveOnceReaction [MyReaction] ==> [preactiveReaction(effect.displayName)] --- preactiveOnceReaction [actionWrap_MyReaction] ==> [onceEffect_effectWrap_$] --- foo',
				);
				testPlan++;
			},
		},
	);
	errorOut(false);
	expect(testPlan).toBe(2);
});

test('preactiveReaction(action, effect) recovers from error in action', () => {
	let testPlan = 0;
	const errorOut = preactiveSignal(true);

	preactiveReaction(
		function MyReaction(_dispose) {
			if (errorOut()) {
				throw new Error('foo');
			}
			expect(true).toBe(true);
			testPlan++;
		},
		function MyEffect(_reactiveValue, _dispose) {
			expect(true).toBe(true);
			testPlan++;
		},
		{
			onErrorWithDisposer: (exception, _dispose) => {
				expect((exception as Error).message).toBe(
					'preactiveReaction.createOnceLoop.preactiveOnceReaction [MyReaction] ==> [MyEffect] --- preactiveOnceReaction [actionWrap_MyReaction] ==> [onceEffect_effectWrap_MyEffect] --- foo',
				);
				testPlan++;
			},
		},
	);
	errorOut(false);
	expect(testPlan).toBe(3);
});

test('preactiveReaction(action, effect) recovers from error in effect', () => {
	let testPlan = 0;
	const errorOut = preactiveSignal(false);

	preactiveReaction(
		function MyAction(_dispose) {
			expect(true).toBe(true);
			testPlan++;
			return errorOut();
		},
		function MyEffect(errorOut, _dispose) {
			if (errorOut) {
				throw new Error('foo');
			}
			expect(true).toBe(true);
			testPlan++;
		},
		{
			onErrorWithDisposer: (exception, _dispose) => {
				expect((exception as Error).message).toBe('preactiveReaction.effectWrap [MyAction] ==> [MyEffect] --- foo');
				testPlan++;
			},
		},
	);
	errorOut(true);
	errorOut(false);
	expect(testPlan).toBe(5);
});

test('preactiveReaction(action) that throws doesnt stop the effect queue', () => {
	let testPlan = 0;
	const errorOut = preactiveSignal(false);

	preactiveReaction(
		(_dispose) => {
			if (errorOut()) {
				throw new Error('foo');
			}
		},
		undefined,
		{
			onErrorWithDisposer: (_exception, _dispose) => {
				expect(true).toBe(true);
				testPlan++;
			},
		},
	);
	preactiveReaction((_dispose) => {
		errorOut();
		expect(true).toBe(true);
		testPlan++;
	});
	errorOut(true);
	expect(testPlan).toBe(3);
});

test('preactiveReaction(action, effect) that throws doesnt stop the effect queue', () => {
	let testPlan = 0;
	const errorOut = preactiveSignal(false);

	preactiveReaction(
		() => errorOut(),
		(errorOut) => {
			if (errorOut) {
				throw new Error('foo');
			}
		},
		{
			onErrorWithDisposer: (_exception, _dispose) => {
				expect(true).toBe(true);
				testPlan++;
			},
		},
	);
	preactiveReaction(() => {
		errorOut();
		expect(true).toBe(true);
		testPlan++;
	});
	errorOut(true);
	expect(testPlan).toBe(3);
});

test('preactiveReaction(action) onError(_, dispose) disposes reaction', () => {
	let testPlan = 0;
	const a = preactiveSignal('foo');

	preactiveReaction(
		(_dispose) => {
			expect(true).toBe(true);
			testPlan++;
			a();
			throw new Error('foo');
		},
		undefined,
		{
			onErrorWithDisposer: (_exception, dispose) => {
				return dispose();
			},
		},
	);
	a('bar');
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect) action onError(_, dispose) disposes reaction', () => {
	let testPlan = 0;
	const a = preactiveSignal('foo');

	preactiveReaction(
		(_dispose) => {
			expect(true).toBe(true);
			testPlan++;
			a();
			throw new Error('foo');
		},
		(_reactiveValue, _dispose) => {
			expect(true).toBe(false);
			testPlan++;
		},
		{
			onErrorWithDisposer: (_exception, dispose) => {
				return dispose();
			},
		},
	);
	a('bar');
	expect(testPlan).toBe(1);
});

test('preactiveReaction(action, effect) effect onError(_, dispose) disposes reaction', () => {
	let testPlan = 0;
	const a = preactiveSignal('foo');

	preactiveReaction(
		(_dispose) => {
			expect(true).toBe(true);
			testPlan++;
			a();
		},
		(_reactiveValue, _dispose) => {
			throw new Error('foo');
		},
		{
			onErrorWithDisposer: (_exception, dispose) => {
				return dispose();
			},
		},
	);
	a('bar');
	a('baz');

	expect(testPlan).toBe(2);
});

test('preactiveAction() that throws inside preactiveReaction(action) doesnt break effect queue', () => {
	let testPlan = 0;
	const verify = preactiveSignal(false);
	const go = preactiveSignal(false);

	preactiveReaction(() => {
		if (verify()) {
			// eslint-disable-next-line jest/no-conditional-expect
			expect(true).toBe(true);
			testPlan++;
		}
	});
	preactiveReaction(
		() => {
			if (verify()) {
				// eslint-disable-next-line jest/no-conditional-expect
				expect(true).toBe(true);
				testPlan++;
			}
			if (go()) {
				preactiveAction(() => {
					verify(true);
					throw new Error('foo');
				});
			}
		},
		undefined,
		{
			onErrorWithDisposer: (_exception, _dispose) => {
				expect(true).toBe(true);
				testPlan++;
			},
		},
	);
	preactiveReaction(() => {
		if (verify()) {
			// eslint-disable-next-line jest/no-conditional-expect
			expect(true).toBe(true);
			testPlan++;
		}
	});
	go(true);
	expect(testPlan).toBe(3);
});