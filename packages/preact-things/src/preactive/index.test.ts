/* eslint-disable jest/no-commented-out-tests */

// This code was shamelessly adapted from Statin, for educational / learning purposes (lots of renaming, type re-organisation, etc. ... but otherwise same logic):
// https://github.com/tomasklaen/statin/blob/d9d35e3def67b60a663a3afc4d6f2ab8f8b9c5ff/test.ts#L1

import { expect, test } from 'vitest';

import { preactiveAction } from './action';
import { preactiveOnce, preactiveReaction } from './reaction.js';
import { preactiveSignal, setStrictSignalMustChangeInsideAction } from './signal.js';
import type { PreactiveFunction } from './types.js';

setStrictSignalMustChangeInsideAction(false);

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

test('preactiveOnce() listens and execute effect once', () => {
	const s = preactiveSignal('foo');
	let count = 0;
	preactiveOnce(
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

test('preactiveOnce() passes a disposer to action as 1st argument', () => {
	const s = preactiveSignal('foo');
	let count = 0;
	preactiveOnce(
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

test('preactiveOnce() internal disposer clears even dependencies created after its been called', () => {
	const a = preactiveSignal('foo');
	const b = preactiveSignal('foo');
	let count = 0;
	preactiveOnce(
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
	s.editReactiveValue((value) => {
		expect(value).toBe('foo');
		return value;
	});
});

test('signal.editReactiveValue() sends a changed signal after editor finishes', () => {
	const s = preactiveSignal(['foo', 'bar']);
	preactiveOnce(
		(_dispose) => {
			s();
		},
		() => {
			expect(s()).toEqual(['foo']);
		},
	);
	s.editReactiveValue((v) => {
		v.pop();
		return v;
	});
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
	preactiveReaction((_dispose) => {
		a(a() + 1);
		expect(true).toBe(true);
		return 0;
	});
});

test('preactiveReaction(action, {onError}) catches and triggers onError 1', () => {
	preactiveReaction(
		function MyReaction1(_dispose: PreactiveFunction<void>) {
			throw new Error('foo');
			// return 0;
		},
		undefined,
		{
			onErrorWithDisposer: (exception, _dispose) => {
				expect((exception as Error).message).toBe(
					'preactiveReaction.createOnceLoop.preactiveOnce [MyReaction1] ==> [preactiveReaction(effect.displayName)] --- preactiveOnce [actionWrap_MyReaction1] ==> [onceEffect_effectWrap_$] --- foo',
				);
			},
		},
	);
});

test('preactiveReaction(action, {onError}) catches and triggers onError 2', () => {
	const MyReaction2 = (_dispose: PreactiveFunction<void>) => {
		throw new Error('bar');
		// return 0;
	};
	preactiveReaction(MyReaction2, undefined, {
		onErrorWithDisposer: (exception, _dispose) => {
			expect((exception as Error).message).toBe(
				'preactiveReaction.createOnceLoop.preactiveOnce [MyReaction2] ==> [preactiveReaction(effect.displayName)] --- preactiveOnce [actionWrap_MyReaction2] ==> [onceEffect_effectWrap_$] --- bar',
			);
		},
	});
});

test('preactiveReaction(action, {onError}) catches and triggers onError 3', () => {
	const MyReaction3 = (_dispose: PreactiveFunction<void>) => {
		throw new Error('here');
		// return 0;
	};
	MyReaction3.displayName = '__MyReaction3__';

	preactiveReaction(MyReaction3, undefined, {
		onErrorWithDisposer: (exception, _dispose) => {
			expect((exception as Error).message).toBe(
				'preactiveReaction.createOnceLoop.preactiveOnce [__MyReaction3__] ==> [preactiveReaction(effect.displayName)] --- preactiveOnce [actionWrap___MyReaction3__] ==> [onceEffect_effectWrap_$] --- here',
			);
		},
	});
});

test('preactiveReaction(action, effect, {onError}) catches and triggers onError 1', () => {
	const s = preactiveSignal(1);
	preactiveReaction(
		function MyReaction1(_dispose: PreactiveFunction<void>) {
			return s();
		},
		function MyEffect1(_reactiveValue: number, _dispose: PreactiveFunction<void>) {
			throw new Error('foo');
		},
		{
			onErrorWithDisposer: (exception, _dispose) => {
				expect((exception as Error).message).toBe('preactiveReaction.effectWrap [MyReaction1] ==> [MyEffect1] --- foo');
			},
		},
	);
	s(2);
});

test('preactiveReaction(action, effect, {onError}) catches and triggers onError 2', () => {
	const s = preactiveSignal(1);
	const MyReaction2 = (_dispose: PreactiveFunction<void>) => {
		return s();
	};
	const MyEffect2 = (_reactiveValue: number, _dispose: PreactiveFunction<void>) => {
		throw new Error('bar');
	};
	preactiveReaction(MyReaction2, MyEffect2, {
		onErrorWithDisposer: (exception, _dispose) => {
			expect((exception as Error).message).toBe('preactiveReaction.effectWrap [MyReaction2] ==> [MyEffect2] --- bar');
		},
	});
	s(2);
});

test('preactiveReaction(action, effect, {onError}) catches and triggers onError 3', () => {
	const s = preactiveSignal(1);
	const MyReaction3 = (_dispose: PreactiveFunction<void>) => {
		return s();
	};
	MyReaction3.displayName = '__MyReaction3__';
	const MyEffect3 = (_reactiveValue: number, _dispose: PreactiveFunction<void>) => {
		throw new Error('here');
	};
	MyEffect3.displayName = '__MyEffect3__';

	preactiveReaction(MyReaction3, MyEffect3, {
		onErrorWithDisposer: (exception, _dispose) => {
			expect((exception as Error).message).toBe(
				'preactiveReaction.effectWrap [__MyReaction3__] ==> [__MyEffect3__] --- here',
			);
		},
	});
	s(2);
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
	const s = preactiveSignal('foo');

	preactiveReaction(
		(_dispose) => {
			return `${s()}Action`;
		},
		(reactiveValue, _dispose) => {
			expect(reactiveValue).toBe('barAction');
		},
	);
	s('bar');
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
	const a = preactiveSignal(1);

	preactiveReaction(
		(_dispose) => {
			a(2);
			a();
			expect(true).toBe(true);
			return 0;
		},
		(_reactiveValue, _dispose) => {
			expect(true).toBe(true);
		},
	);
	a(-1);
});

test('preactiveReaction(action, effect) detects and disposes circular reactions', () => {
	const count = preactiveSignal(-1);
	const myAction = () => {
		return count();
	};
	const myEffect = (currentCount: number) => {
		return count(currentCount + 1);
	};
	preactiveReaction(myAction, myEffect, {
		onErrorWithDisposer: (exception, _dispose) => {
			expect((exception as Error)?.message).toBe(
				'preactiveReaction.createOnceLoop.preactiveOnce [myAction] ==> [myEffect] --- preactiveOnce.observer.preactiveBulkEffects [actionWrap_myAction] ==> [onceEffect_effectWrap_myEffect] --- MAX_REACTION_DEPTH!! (100)',
			);
		},
	});
	preactiveAction(() => {
		return count(0);
	});
	expect(count.reactiveValue).toBe(101);
});

// test('preactiveReaction(action, effect, {immediate: true}) triggers effect immediately', () => {
// 	const a = preactiveSignal(1);
//
// 	preactiveReaction(
// 		() => a(),
// 		(value) => expect(value).toBe( 1),
// 		{immediate: true}
// 	);
// });

// test('preactiveReaction(action, effect, {onError}) catches and triggers onError from action', () => {
//
// 	preactiveReaction(
// 		function MyReaction() {
// 			throw new Error('foo');
// 		},
// 		function MyEffect() {},
// 		{onError: (error) => expect(error.message).toBe( 'Error in MyReaction: foo')}
// 	);
// });

// test('preactiveReaction(action, effect, {onError}) catches and triggers onError from effect', () => {
// 	const s = preactiveSignal(-1);
//
// 	preactiveReaction(
// 		function MyReaction() {
// 			s();
// 		},
// 		function MyEffect() {
// 			throw new Error('foo');
// 		},
// 		{onError: (error) => expect(error.message).toBe( 'Error in MyEffect: foo')}
// 	);
// 	s(0);
// });

// test('preactiveReaction(action, effect, {immediate, onError}) catches and triggers onError from effect', () => {
//
// 	preactiveReaction(
// 		function MyReaction() {},
// 		function MyEffect() {
// 			throw new Error('foo');
// 		},
// 		{immediate: true, onError: (error) => expect(error.message).toBe( 'Error in MyEffect: foo')}
// 	);
// });

// test('computed() creates a computed signal', () => {
// 	const foo = preactiveSignal('foo');
// 	const c = computed(() => `${foo()}bar`);
// 	expect(c()).toBe( 'foobar');
// });

// test('computed() only re-computes when one of the dependencies change', () => {
// 	const foo = preactiveSignal('foo');
// 	const bar = preactiveSignal('bar');
// 	let count = 0;
// 	const c = computed(() => {
// 		count++;
// 		return `${foo()}${bar()}`;
// 	});
// 	expect(c()).toBe( 'foobar');
// 	expect(c()).toBe( 'foobar');
// 	expect(c()).toBe( 'foobar');
// 	foo('fam');
// 	expect(c()).toBe( 'fambar');
// 	expect(count).toBe( 2);
// });

// test('computed() propagates changed signals of its dependencies', () => {
// 	const foo = preactiveSignal('foo');
// 	const bar = preactiveSignal('bar');
// 	const a = computed(() => `${foo()}${bar()}`);
// 	const b = computed(() => `${a()}Parent`);
//
// 	preactiveOnce(
// 		() => a(),
// 		() => expect(true).toBe(true)
// 	);
// 	foo('fam');
// 	preactiveOnce(
// 		() => b(),
// 		() => expect(true).toBe(true)
// 	);
// 	bar('baz');
// });

// test('action() de-duplicates and bulks all updates to the end', () => {
// 	const a = preactiveSignal(1);
// 	const b = preactiveSignal(1);
// 	const outside = preactiveSignal(1);
// 	const c = computed(() => `${a()}${outside()}`);
//
// 	preactiveReaction(() => {
// 		expect(true).toBe(true);
// 		a();
// 		b();
// 		c();
// 	});
// 	action(() => {
// 		a(2);
// 		a(3);
// 		b(2);
// 		outside(2);
// 	});
// });

// test('action() returns the value', () => {
// 	t.is(
// 		action(() => 'foo'),
// 		'foo'
// 	);
// });

// test('action() prevents signals from being tracked', () => {
// 	const a = preactiveSignal(1);
// 	const b = preactiveSignal(1);
// 	const c = preactiveSignal(1);
// 	let count = 0;
// 	preactiveReaction(() => {
// 		count++;
// 		a();
// 		action(() => b());
// 		c();
// 	});
// 	expect(count).toBe( 1);
// 	a(2);
// 	expect(count).toBe( 2);
// 	b(2);
// 	expect(count).toBe( 2);
// 	c(2);
// 	expect(count).toBe( 3);
// });

// test('action() doesnt prevent computed signal from updating', () => {
// 	const a = preactiveSignal('f');
// 	const b = preactiveSignal('b');
// 	const aIs = computed(() => `a:${a()}`);
// 	const bIs = computed(() => `b:${b()}`);
// 	const allAre = computed(() => `${aIs()}, ${bIs()}`);
// 	action(() => {
// 		expect(allAre(), 'a:f).toBe( b:b');
// 		b('bar');
// 		expect(allAre(), 'a:f).toBe( b:bar');
// 	});
// });

// test('action() triggers effects even when it throws', () => {
// 	const a = preactiveSignal('foo');
//
// 	preactiveReaction(() => {
// 		a();
// 		expect(true).toBe(true);
// 	});
// 	t.throws(() =>
// 		action(() => {
// 			a('bar');
// 			throw new Error('foo');
// 		})
// 	);
// });

// test('action() inside action() doesnt resume dependency tracking', () => {
// 	const a = preactiveSignal('f');
// 	const b = preactiveSignal('b');
//
// 	preactiveReaction(
// 		() => {
// 			action(() => {
// 				a();
// 				action(() => {});
// 				b();
// 			});
// 		},
// 		() => expect(true).toBe(true)
// 	);
// 	a('foo');
// 	b('bar');
// });

// test('preactiveOnce() inside action() still tracks its dependencies', () => {
// 	const s = preactiveSignal('foo');
//
// 	action(() => {
// 		preactiveOnce(
// 			() => s(),
// 			() => expect(true).toBe(true)
// 		);
// 		s('bar');
// 	});
// });

// test('preactiveReaction() inside action() still tracks its dependencies', () => {
// 	const s = preactiveSignal('foo');
//
// 	action(() => {
// 		const dispose = preactiveReaction(
// 			() => s(),
// 			() => expect(true).toBe(true)
// 		);
// 		s('bar');
// 		dispose();
// 	});
// });

// test('preactiveOnce() inside preactiveOnce() doesnt cancel tracking', () => {
// 	const s = preactiveSignal('f');
//
// 	preactiveOnce(
// 		() => {
// 			preactiveOnce(
// 				() => {},
// 				() => {}
// 			);
// 			s();
// 		},
// 		() => expect(true).toBe(true)
// 	);
// 	s('foo');
// });

// test('computed() updates even within an action', () => {
// 	const a = preactiveSignal('f');
// 	const b = preactiveSignal('b');
// 	let count = 0;
// 	const c = computed(() => {
// 		count++;
// 		return `${a()}${b()}`;
// 	});
//
// 	action(() => {
// 		expect(c()).toBe( 'fb');
// 		a('foo');
// 		b('bar');
// 		expect(c()).toBe( 'foobar');
// 		expect(count).toBe( 2);
// 	});
// });

// test('createAction() wraps the action, inheriting arguments and return value', () => {
// 	const a = preactiveSignal(1);
// 	const b = preactiveSignal(1);
// 	const outside = preactiveSignal(1);
// 	const c = computed(() => `${a()}${outside()}`);
//
// 	preactiveReaction(() => {
// 		expect(true).toBe(true);
// 		a();
// 		b();
// 		c();
// 	});
// 	const action = createAction((value: string) => {
// 		a(2);
// 		a(3);
// 		b(2);
// 		outside(2);
// 		return `${value}bar`;
// 	});
// 	expect(action('foo')).toBe( 'foobar');
// });

// test('computed() describes errors correctly', () => {
// 	const a = computed(function ComputeA() {
// 		throw new Error('foo');
// 	});
// 	const b = computed(
// 		nameFn('ComputeB', () => {
// 			throw new Error('foo');
// 		})
// 	);
// 	t.throws(a, {message: 'Error in ComputeA: foo'});
// 	t.throws(b, {message: 'Error in ComputeB: foo'});
// });

// test('computed() recovers from errors', () => {
// 	const errorOut = preactiveSignal(true);
// 	const c = computed(function ComputeFoo() {
// 		if (errorOut()) throw new Error('foo');
// 		return 'foo';
// 	});
// 	const error = t.throws(c);
// 	// Caches original error
// 	expect(t.throws(c)).toBe( error);
// 	errorOut(false);
// 	expect(c()).toBe( 'foo');
// });

// test('preactiveReaction(action) recovers from errors', () => {
// 	const errorOut = preactiveSignal(true);
//
// 	preactiveReaction(
// 		function MyReaction() {
// 			if (errorOut()) throw new Error('foo');
// 			expect(true).toBe(true);
// 		},
// 		{onError: (error) => expect(error.message).toBe( 'Error in MyReaction: foo')}
// 	);
// 	errorOut(false);
// });

// test('preactiveReaction(action, effect) recovers from error in action', () => {
// 	const errorOut = preactiveSignal(true);
//
// 	preactiveReaction(
// 		function MyAction() {
// 			if (errorOut()) throw new Error('foo');
// 			expect(true).toBe(true);
// 		},
// 		function MyEffect() {
// 			expect(true).toBe(true);
// 		},
// 		{onError: (error) => expect(error.message).toBe( 'Error in MyAction: foo')}
// 	);
// 	errorOut(false);
// });

// test('preactiveReaction(action, effect) recovers from error in effect', () => {
// 	const errorOut = preactiveSignal(false);
//
// 	preactiveReaction(
// 		function MyAction() {
// 			expect(true).toBe(true);
// 			return errorOut();
// 		},
// 		function MyEffect(errorOut) {
// 			if (errorOut) throw new Error('foo');
// 			expect(true).toBe(true);
// 		},
// 		{onError: (error) => expect(error.message).toBe( 'Error in MyEffect: foo')}
// 	);
// 	errorOut(true);
// 	errorOut(false);
// });

// test('preactiveReaction(action) that throws doesnt stop the effect queue', () => {
// 	const errorOut = preactiveSignal(false);
//
// 	preactiveReaction(
// 		() => {
// 			if (errorOut()) throw new Error('foo');
// 		},
// 		{onError: () => expect(true).toBe(true)}
// 	);
// 	preactiveReaction(() => {
// 		errorOut();
// 		expect(true).toBe(true);
// 	});
// 	errorOut(true);
// });

// test('preactiveReaction(action, effect) that throws doesnt stop the effect queue', () => {
// 	const errorOut = preactiveSignal(false);
//
// 	preactiveReaction(
// 		() => errorOut(),
// 		(errorOut) => {
// 			if (errorOut) throw new Error('foo');
// 		},
// 		{onError: () => expect(true).toBe(true)}
// 	);
// 	preactiveReaction(() => {
// 		errorOut();
// 		expect(true).toBe(true);
// 	});
// 	errorOut(true);
// });

// test('preactiveReaction(action) onError(_, dispose) disposes reaction', () => {
// 	const a = preactiveSignal('foo');
//
// 	preactiveReaction(
// 		() => {
// 			expect(true).toBe(true);
// 			a();
// 			throw new Error('foo');
// 		},
// 		{onError: (_, dispose) => dispose()}
// 	);
// 	a('bar');
// });

// test('preactiveReaction(action, effect) action onError(_, dispose) disposes reaction', () => {
// 	const a = preactiveSignal('foo');
//
// 	preactiveReaction(
// 		() => {
// 			expect(true).toBe(true);
// 			a();
// 			throw new Error('foo');
// 		},
// 		() => {
// 			t.fail();
// 		},
// 		{onError: (_, dispose) => dispose()}
// 	);
// 	a('bar');
// });

// test('preactiveReaction(action, effect) effect onError(_, dispose) disposes reaction', () => {
// 	const a = preactiveSignal('foo');
//
// 	preactiveReaction(
// 		() => {
// 			expect(true).toBe(true);
// 			a();
// 		},
// 		() => {
// 			throw new Error('foo');
// 		},
// 		{onError: (_, dispose) => dispose()}
// 	);
// 	a('bar');
// 	a('baz');
// });

// test('action() that throws inside preactiveReaction(action) doesnt break effect queue', () => {
// 	const check = preactiveSignal(false);
// 	const go = preactiveSignal(false);
//
// 	preactiveReaction(() => {
// 		if (check()) expect(true).toBe(true);
// 	});
// 	preactiveReaction(
// 		() => {
// 			if (check()) expect(true).toBe(true);
// 			if (go()) {
// 				action(() => {
// 					check(true);
// 					throw new Error('foo');
// 				});
// 			}
// 		},
// 		{onError: (error) => expect(true).toBe(true)}
// 	);
// 	preactiveReaction(() => {
// 		if (check()) expect(true).toBe(true);
// 	});
// 	go(true);
// });
