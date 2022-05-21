/* eslint-disable jest/no-commented-out-tests */

// https://github.com/solidjs/solid/blob/f17df5c7042425aa8d363be261bd9a9e5345c188/packages/solid/test/signals.spec.ts#L1
// https://github.com/solidjs/solid/blob/f17df5c7042425aa8d363be261bd9a9e5345c188/packages/solid/test/signals.memo.spec.ts#L1

import { afterEach, beforeEach, describe, expect, it, test } from 'vitest';

import { type TObs, type TObsKind, type TObsOptions, get, obs, peek, reset, set } from './index.js';

const createSignal = <T = TObsKind>(
	val: T,
	opts?: TObsOptions<T>,
): [getter: () => T, setter: (v: T | ((v: T) => T)) => void, o: TObs<T>] => {
	const o = obs(val, opts);
	return [() => get(o), (v: T | ((v: T) => T)) => (set(o, v as T | undefined), v), o];
};

const createRoot = (fn: () => unknown) => {
	return fn();
};

const createComputed = <T = TObsKind>(fn: () => T) => {
	obs(fn, { run: true });
};
const createEffect = createComputed;

const createMemo = <T = TObsKind>(fn: () => T, opts?: TObsOptions<T>): (() => T) => {
	const o = obs(fn, opts ? { ...opts, run: true } : { run: true });
	return () => get(o);
};

// let _unhandledEvents: PromiseRejectionEvent[] = [];
// function onUnhandledRejection(event: PromiseRejectionEvent) {
// 	console.log('onUnhandledRejection', event);
// 	_unhandledEvents.push(event);
// }

beforeEach(() => {
	// _unhandledEvents = [];
	// if (typeof window !== 'undefined' && 'onunhandledrejection' in window) {
	// 	window.addEventListener('unhandledrejection', onUnhandledRejection);
	// }
	reset();
});
afterEach(() => {
	// if (typeof window !== 'undefined' && 'onunhandledrejection' in window) {
	// 	window.removeEventListener('unhandledrejection', onUnhandledRejection);
	// 	if (_unhandledEvents.length) {
	// 		throw _unhandledEvents[0].reason ?? _unhandledEvents[0];
	// 	}
	// }
});

describe('Create signals', () => {
	test('Create and read a Signal', () => {
		const [value] = createSignal(5);
		expect(value()).toBe(5);
	});
	test('Create and read a Signal with comparator', () => {
		const [value] = createSignal(5, { equals: (a, b) => a === b });
		expect(value()).toBe(5);
	});
	test('Create and read a Memo', () => {
		createRoot(() => {
			const memo = createMemo(() => 'Hello');
			expect(memo()).toBe('Hello');
		});
	});
	// test('Create and read a Memo with initial value', () => {
	// 	createRoot(() => {
	// 		const memo = createMemo((i) => `${i} John`, 'Hello');
	// 		expect(memo()).toBe('Hello John');
	// 	});
	// });
	// test('Create onMount', () => {
	// 	let temp: string;
	// 	createRoot(() => {
	// 		onMount(() => (temp = 'impure'));
	// 	});
	// 	expect(temp!).toBe('impure');
	// });
	// test('Create a Computed with explicit deps', () => {
	// 	createRoot(() => {
	// 		let temp: string;
	// 		const [sign] = createSignal('thoughts');
	// 		const fn = on(sign, (v) => (temp = `impure ${v}`));
	// 		createComputed(fn);
	// 		createComputed(on(sign, (v) => (temp = `impure ${v}`)));
	// 		expect(temp!).toBe('impure thoughts');
	// 	});
	// });
	// test('Create a Computed with multiple explicit deps', () => {
	// 	createRoot(() => {
	// 		let temp: string;
	// 		const [sign] = createSignal('thoughts');
	// 		const [num] = createSignal(3);
	// 		const fn = on([sign, num], (v) => (temp = `impure ${v[1]}`));
	// 		createComputed(fn);
	// 		expect(temp!).toBe('impure 3');
	// 	});
	// });
	// test('Create a Computed with explicit deps and lazy evaluation', () => {
	// 	createRoot(() => {
	// 		let temp: string;
	// 		const [sign, set] = createSignal('thoughts');
	// 		const fn = on(sign, (v) => (temp = `impure ${v}`), { defer: true });
	// 		createComputed(fn);
	// 		expect(temp!).toBeUndefined();
	// 		set('minds');
	// 		expect(temp!).toBe('impure minds');
	// 	});
	// });
});

describe('Update signals', () => {
	test('Create and update a Signal', () => {
		const [value, setValue] = createSignal(5);
		setValue(10);
		expect(value()).toBe(10);
	});
	test('Create and update a Signal with fn', () => {
		const [value, setValue] = createSignal(5);
		setValue((p) => p + 5);
		expect(value()).toBe(10);
	});
	test('Create Signal and set different value', () => {
		const [value, setValue] = createSignal(5);
		setValue(10);
		expect(value()).toBe(10);
	});
	test('Create Signal and set equivalent value', () => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const [value, setValue] = createSignal(5, { equals: (a, b) => a! > b! });
		setValue(3);
		expect(value()).toBe(5);
	});
	// test('Create and read a Signal with function value', () => {
	// 	const [value, setValue] = createSignal<() => string>(() => 'Hi');
	// 	expect(value()()).toBe('Hi');
	// 	setValue(() => () => 'Hello');
	// 	expect(value()()).toBe('Hello');
	// });
	test('Create and trigger a Memo', () => {
		createRoot(() => {
			const [name, setName] = createSignal('John'),
				memo = createMemo(() => `Hello ${name()}`);
			expect(memo()).toBe('Hello John');
			setName('Jake');
			expect(memo()).toBe('Hello Jake');
		});
	});
	test('Create and trigger a Memo in an effect', () => {
		createRoot(() => {
			let temp: string | undefined;
			const [name, setName] = createSignal('John');
			const memo = createMemo(() => `Hello ${name()}`);
			createEffect<string>(() => (temp = `${memo()}!!!`));
			// setTimeout(() => {
			expect(temp).toBe('Hello John!!!');
			setName('Jake');
			expect(temp).toBe('Hello Jake!!!');
			// done();
			// });
		});
	});
	test('Create and trigger an Effect', () => {
		createRoot(() => {
			let temp: string | undefined;
			const [sign, setSign] = createSignal('thoughts');
			createEffect(() => (temp = `unpure ${sign()}`));
			// setTimeout(() => {
			expect(temp).toBe('unpure thoughts');
			setSign('mind');
			expect(temp).toBe('unpure mind');
			// done();
			// });
		});
	});
	// test('Create and trigger an Effect with function signals', () => {
	// 	createRoot(() => {
	// 		let temp: string;
	// 		const [sign, setSign] = createSignal<() => string>(() => 'thoughts');
	// 		createEffect(() => (temp = `unpure ${sign()()}`));
	// 		setTimeout(() => {
	// 			expect(temp).toBe('unpure thoughts');
	// 			setSign(() => () => 'mind');
	// 			expect(temp).toBe('unpure mind');
	// 			// done();
	// 		});
	// 	});
	// });
	// test('Set signal returns argument', () => {
	// 	const [_, setValue] = createSignal<number>();
	// 	const res1: undefined = setValue(undefined);
	// 	expect(res1).toBe(undefined);
	// 	const res2: number = setValue(12);
	// 	expect(res2).toBe(12);
	// 	const res3 = setValue(Math.random() >= 0 ? 12 : undefined);
	// 	expect(res3).toBe(12);
	// 	const res4 = setValue();
	// 	expect(res4).toBe(undefined);
	// });
});

describe('Untrack signals', () => {
	test('Mute an effect', () => {
		createRoot(() => {
			let temp: string | undefined;
			const [_sign, setSign, o] = createSignal('thoughts');
			createEffect(() => (temp = `unpure ${peek(o)}`));
			// setTimeout(() => {
			expect(temp).toBe('unpure thoughts');
			setSign('mind');
			expect(temp).toBe('unpure thoughts');
			// 	done();
			// });
		});
	});
});

describe('Batch signals', () => {
	test('Groups updates', () => {
		createRoot(() => {
			let count = 0;
			const [a, setA] = createSignal(0);
			const [b, setB] = createSignal(0);
			createEffect(() => {
				setA(1);
				setB(1);
			});
			createComputed(() => (count = a() + b()));
			// setTimeout(() => {
			expect(count).toBe(2);
			// 	done();
			// });
		});
	});
	test('Groups updates with repeated sets', () => {
		createRoot(() => {
			let count = 0;
			const [a, setA] = createSignal(0);
			createEffect(() => {
				setA(1);
				setA(4);
			});
			createComputed(() => (count = a()));
			// setTimeout(() => {
			expect(count).toBe(4);
			// 	done();
			// });
		});
	});
	test('Groups updates with fn setSignal', () => {
		createRoot(() => {
			let count = 0;
			const [a, setA] = createSignal(0);
			const [b, setB] = createSignal(0);
			createEffect(() => {
				setA((a) => a + 1);
				setB((b) => b + 1);
			});
			createComputed(() => (count = a() + b()));
			// setTimeout(() => {
			expect(count).toBe(2);
			// 	done();
			// });
		});
	});
	test('Groups updates with fn setSignal with repeated sets', () => {
		createRoot(() => {
			let count = 0;
			const [a, setA] = createSignal(0);
			createEffect(() => {
				setA((a) => a + 1);
				setA((a) => a + 2);
			});
			createComputed(() => (count = a()));
			// setTimeout(() => {
			expect(count).toBe(3);
			// 	done();
			// });
		});
	});
	test('cross setting in a batched update', () => {
		createRoot(() => {
			let count = 0;
			const [a, setA] = createSignal(1);
			const [b, setB] = createSignal(0);
			createEffect(() => {
				setA((a) => a + b());
			});
			createComputed(() => (count = a()));
			// setTimeout(() => {
			setB((b) => b + 1);
			// setTimeout(() => {
			expect(count).toBe(2);
			// 	done();
			// });
			// });
		});
	});
	test('Handles errors gracefully', () => {
		createRoot(() => {
			let error: Error | undefined;
			const [a, setA] = createSignal(0);
			const [b, _setB] = createSignal(0);
			createEffect(() => {
				try {
					setA(1);
					throw new Error('test');
					// setB(1);
				} catch (e) {
					error = e as Error;
				}
			});
			createComputed(() => a() + b());
			// setTimeout(() => {
			expect(a()).toBe(1);
			expect(b()).toBe(0);
			setA(2);
			expect(a()).toBe(2);
			expect(error).toBeInstanceOf(Error);
			expect(error?.message).toBe('test');
			// 	done();
			// });
		});
	});

	test('Multiple sets', () => {
		createRoot(() => {
			let count = 0;
			const [a, setA] = createSignal(0);
			createEffect(() => {
				setA(1);
				setA(0);
			});
			createComputed(() => (count = a()));
			// setTimeout(() => {
			expect(count).toBe(0);
			// 	done();
			// });
		});
	});
});

describe('Typecheck computed and effects', () => {
	test('No default value can return undefined', () => {
		createRoot(() => {
			let count = 0;
			const [sign, setSign] = createSignal('thoughts');
			const fn = (arg?: number) => {
				count++;
				sign();
				expect(arg).toBe(undefined);
				return arg;
			};
			createComputed(fn);
			// createRenderEffect(fn);
			createEffect(fn);
			// setTimeout(() => {
			expect(count).toBe(2);
			setSign('update');
			expect(count).toBe(4);
			// });
		});
	});
	// 	test('Default value never receives undefined', () => {
	// 		createRoot(() => {
	// 			let count = 0;
	// 			const [sign, setSign] = createSignal('thoughts');
	// 			const fn = (arg: number) => {
	// 				count++;
	// 				sign();
	// 				expect(arg).toBe(12);
	// 				return arg;
	// 			};
	// 			createComputed(fn, 12);
	// 			createRenderEffect(fn, 12);
	// 			createEffect(fn, 12);
	// 			setTimeout(() => {
	// 				expect(count).toBe(3);
	// 				setSign('update');
	// 				expect(count).toBe(6);
	// 			});
	// 		});
	// 	});
});

// describe('onCleanup', () => {
// 	test('Clean an effect', (done) => {
// 		createRoot(() => {
// 			let temp: string;
// 			const [sign, setSign] = createSignal('thoughts');
// 			createEffect(() => {
// 				sign();
// 				onCleanup(() => (temp = 'after'));
// 			});
// 			setTimeout(() => {
// 				expect(temp).toBeUndefined();
// 				setSign('mind');
// 				expect(temp).toBe('after');
// 				done();
// 			});
// 		});
// 	});
// 	test('Explicit root disposal', () => {
// 		let temp: string | undefined, disposer: () => void;
// 		createRoot((dispose) => {
// 			disposer = dispose;
// 			onCleanup(() => (temp = 'disposed'));
// 		});
// 		expect(temp).toBeUndefined();
// 		disposer!();
// 		expect(temp).toBe('disposed');
// 	});
// });

// describe('onError', () => {
// 	test('No Handler', () => {
// 		expect(() =>
// 			createRoot(() => {
// 				throw 'fail';
// 			}),
// 		).toThrow('fail');
// 	});
// 	test('Top level', () => {
// 		let errored = false;
// 		expect(() =>
// 			createRoot(() => {
// 				onError(() => (errored = true));
// 				throw 'fail';
// 			}),
// 		).not.toThrow('fail');
// 		expect(errored).toBe(true);
// 	});

// 	test('In initial effect', () => {
// 		let errored = false;
// 		expect(() =>
// 			createRoot(() => {
// 				createEffect(() => {
// 					onError(() => (errored = true));
// 					throw 'fail';
// 				});
// 			}),
// 		).not.toThrow('fail');
// 		expect(errored).toBe(true);
// 	});

// 	test('With multiple error handlers', () => {
// 		let errored = false;
// 		let errored2 = false;
// 		expect(() =>
// 			createRoot(() => {
// 				createEffect(() => {
// 					onError(() => (errored = true));
// 					onError(() => (errored2 = true));
// 					throw 'fail';
// 				});
// 			}),
// 		).not.toThrow('fail');
// 		expect(errored).toBe(true);
// 		expect(errored2).toBe(true);
// 	});

// 	test('In update effect', () => {
// 		let errored = false;
// 		expect(() =>
// 			createRoot(() => {
// 				const [s, set] = createSignal(0);
// 				createEffect(() => {
// 					const v = s();
// 					onError(() => (errored = true));
// 					if (v) throw 'fail';
// 				});
// 				set(1);
// 			}),
// 		).not.toThrow('fail');
// 		expect(errored).toBe(true);
// 	});

// 	test('In initial nested effect', () => {
// 		let errored = false;
// 		expect(() =>
// 			createRoot(() => {
// 				createEffect(() => {
// 					createEffect(() => {
// 						onError(() => (errored = true));
// 						throw 'fail';
// 					});
// 				});
// 			}),
// 		).not.toThrow('fail');
// 		expect(errored).toBe(true);
// 	});

// 	test('In nested update effect', () => {
// 		let errored = false;
// 		expect(() =>
// 			createRoot(() => {
// 				const [s, set] = createSignal(0);
// 				createEffect(() => {
// 					createEffect(() => {
// 						const v = s();
// 						onError(() => (errored = true));
// 						if (v) throw 'fail';
// 					});
// 				});
// 				set(1);
// 			}),
// 		).not.toThrow('fail');
// 		expect(errored).toBe(true);
// 	});

// 	test('In nested update effect different levels', () => {
// 		let errored = false;
// 		expect(() =>
// 			createRoot(() => {
// 				const [s, set] = createSignal(0);
// 				createEffect(() => {
// 					onError(() => (errored = true));
// 					createEffect(() => {
// 						const v = s();
// 						if (v) throw 'fail';
// 					});
// 				});
// 				set(1);
// 			}),
// 		).not.toThrow('fail');
// 		expect(errored).toBe(true);
// 	});
// });

// describe('createDeferred', () => {
// 	test('simple defer', (done) => {
// 		createRoot(() => {
// 			const [s, set] = createSignal('init'),
// 				r = createDeferred(s, { timeoutMs: 20 });
// 			expect(r()).toBe('init');
// 			set('Hi');
// 			expect(r()).toBe('init');
// 			setTimeout(() => {
// 				expect(r()).toBe('Hi');
// 				done();
// 			}, 100);
// 		});
// 	});
// });

// describe('createSelector', () => {
// 	test('simple selection', (done) => {
// 		createRoot(() => {
// 			const [s, set] = createSignal<number>(),
// 				isSelected = createSelector(s);
// 			let count = 0;
// 			const list = Array.from({ length: 100 }, (_, i) =>
// 				createMemo(() => {
// 					count++;
// 					return isSelected(i) ? 'selected' : 'no';
// 				}),
// 			);
// 			expect(count).toBe(100);
// 			expect(list[3]()).toBe('no');
// 			setTimeout(() => {
// 				count = 0;
// 				set(3);
// 				expect(count).toBe(1);
// 				expect(list[3]()).toBe('selected');
// 				count = 0;
// 				set(6);
// 				expect(count).toBe(2);
// 				expect(list[3]()).toBe('no');
// 				expect(list[6]()).toBe('selected');
// 				set(undefined);
// 				expect(count).toBe(3);
// 				expect(list[6]()).toBe('no');
// 				set(5);
// 				expect(count).toBe(4);
// 				expect(list[5]()).toBe('selected');
// 				done();
// 			});
// 		});
// 	});

// 	test('double selection', (done) => {
// 		createRoot(() => {
// 			const [s, set] = createSignal<number>(-1),
// 				isSelected = createSelector<number, number>(s);
// 			let count = 0;
// 			const list = Array.from({ length: 100 }, (_, i) => [
// 				createMemo(() => {
// 					count++;
// 					return isSelected(i) ? 'selected' : 'no';
// 				}),
// 				createMemo(() => {
// 					count++;
// 					return isSelected(i) ? 'oui' : 'non';
// 				}),
// 			]);
// 			expect(count).toBe(200);
// 			expect(list[3][0]()).toBe('no');
// 			expect(list[3][1]()).toBe('non');
// 			setTimeout(() => {
// 				count = 0;
// 				set(3);
// 				expect(count).toBe(2);
// 				expect(list[3][0]()).toBe('selected');
// 				expect(list[3][1]()).toBe('oui');
// 				count = 0;
// 				set(6);
// 				expect(count).toBe(4);
// 				expect(list[3][0]()).toBe('no');
// 				expect(list[6][0]()).toBe('selected');
// 				expect(list[3][1]()).toBe('non');
// 				expect(list[6][1]()).toBe('oui');
// 				done();
// 			});
// 		});
// 	});

// 	test('zero index', (done) => {
// 		createRoot(() => {
// 			const [s, set] = createSignal<number>(-1),
// 				isSelected = createSelector<number, number>(s);
// 			let count = 0;
// 			const list = [
// 				createMemo(() => {
// 					count++;
// 					return isSelected(0) ? 'selected' : 'no';
// 				}),
// 			];
// 			expect(count).toBe(1);
// 			expect(list[0]()).toBe('no');
// 			setTimeout(() => {
// 				count = 0;
// 				set(0);
// 				expect(count).toBe(1);
// 				expect(list[0]()).toBe('selected');
// 				count = 0;
// 				set(-1);
// 				expect(count).toBe(1);
// 				expect(list[0]()).toBe('no');
// 				done();
// 			});
// 		});
// 	});
// });

// describe('create and use context', () => {
// 	test('createContext without arguments defaults to undefined', () => {
// 		const context = createContext<number>();
// 		const res = useContext(context);
// 		expect(res).toBe<typeof res>(undefined);
// 	});
// });

// describe('runWithOwner', () => {
// 	test('Top level owner execute and disposal', () => {
// 		let effectRun = false;
// 		let cleanupRun = false;
// 		const [owner, dispose] = createRoot((dispose) => {
// 			return [getOwner()!, dispose];
// 		});

// 		runWithOwner(owner, () => {
// 			createEffect(() => (effectRun = true));
// 			onCleanup(() => (cleanupRun = true));
// 			expect(effectRun).toBe(false);
// 			expect(cleanupRun).toBe(false);
// 		});
// 		expect(effectRun).toBe(true);
// 		expect(cleanupRun).toBe(false);
// 		dispose();
// 		expect(cleanupRun).toBe(true);
// 	});
// });

// describe('createReaction', () => {
// 	test('Create and trigger a Reaction', (done) => {
// 		createRoot(() => {
// 			let count = 0;
// 			const [sign, setSign] = createSignal('thoughts');
// 			const track = createReaction(() => count++);
// 			expect(count).toBe(0);
// 			track(sign);
// 			expect(count).toBe(0);
// 			setTimeout(() => {
// 				expect(count).toBe(0);
// 				setSign('mind');
// 				expect(count).toBe(1);
// 				setSign('body');
// 				expect(count).toBe(1);
// 				track(sign);
// 				setSign('everything');
// 				expect(count).toBe(2);
// 				done();
// 			});
// 		});
// 	});
// });

// ------// ------// ------// ------// ------// ------// ------

describe('createMemo', () => {
	describe('executing propagating', () => {
		it('propagates in topological order', () => {
			createRoot(() => {
				//
				//     c1
				//    /  \
				//   /    \
				//  b1     b2
				//   \    /
				//    \  /
				//     a1
				//
				let seq = '';
				const [a1, setA1] = createSignal(false);
				const b1 = createMemo(
					() => {
						a1();
						seq += 'b1';
					},
					// undefined,
					{ equals: false },
				);
				const b2 = createMemo(
					() => {
						a1();
						seq += 'b2';
					},
					// undefined,
					{ equals: false },
				);
				const _c1 = createMemo(
					() => {
						b1();
						b2();
						seq += 'c1';
					},
					// undefined,
					{ equals: false },
				);

				seq = '';
				setA1(true);

				expect(seq).toBe('b1b2c1');
			});
		});

		it('only propagates once with linear convergences', () => {
			createRoot(() => {
				//         d
				//         |
				// +---+---+---+---+
				// v   v   v   v   v
				// f1  f2  f3  f4  f5
				// |   |   |   |   |
				// +---+---+---+---+
				//         v
				//         g
				const [d, setD] = createSignal(0);
				const f1 = createMemo(() => d());
				const f2 = createMemo(() => d());
				const f3 = createMemo(() => d());
				const f4 = createMemo(() => d());
				const f5 = createMemo(() => d());
				let gcount = 0;
				const _g = createMemo(() => {
					gcount++;
					return f1() + f2() + f3() + f4() + f5();
				});

				gcount = 0;
				setD(1);
				expect(gcount).toBe(1);
			});
		});

		it('only propagates once with exponential convergence', () => {
			createRoot(() => {
				//     d
				//     |
				// +---+---+
				// v   v   v
				// f1  f2 f3
				//   \ | /
				//     O
				//   / | \
				// v   v   v
				// g1  g2  g3
				// +---+---+
				//     v
				//     h
				const [d, setD] = createSignal(0);
				const f1 = createMemo(() => {
					return d();
				});
				const f2 = createMemo(() => {
					return d();
				});
				const f3 = createMemo(() => {
					return d();
				});
				const g1 = createMemo(() => {
					return f1() + f2() + f3();
				});
				const g2 = createMemo(() => {
					return f1() + f2() + f3();
				});
				const g3 = createMemo(() => {
					return f1() + f2() + f3();
				});
				let hcount = 0;
				const _h = createMemo(() => {
					hcount++;
					return g1() + g2() + g3();
				});
				hcount = 0;
				setD(1);
				expect(hcount).toBe(1);
			});
		});

		it('does not trigger downstream computations unless changed', () => {
			createRoot(() => {
				const [s1, set] = createSignal(1, { equals: false });
				let order = '';
				const t1 = createMemo(() => {
					order += 't1';
					return s1();
				});
				createComputed(() => {
					order += 'c1';
					t1();
				});
				expect(order).toBe('t1c1');
				order = '';
				set(1);
				expect(order).toBe('t1');
				order = '';
				set(2);
				expect(order).toBe('t1c1');
			});
		});

		it('applies updates to changed dependees in breadth-first order (not depth-first)', () => {
			createRoot(() => {
				const [s1, set] = createSignal(0);
				let order = '';
				const t1 = createMemo(() => {
					order += 't1';
					return s1() === 0;
				});
				createComputed(() => {
					order += 'c1';
					return t1();
				});
				createComputed(() => {
					order += 'c2';
					return s1();
				});

				expect(order).toBe('t1c1c2');
				order = '';
				set(1);
				expect(order).toBe('t1c2c1');
			});
		});

		it('updates downstream pending computations in breadth-first order (not depth-first)', () => {
			createRoot(() => {
				const [s1, set] = createSignal(0);
				const [s2] = createSignal(0);
				let order = '';
				const t1 = createMemo(() => {
					order += 't1';
					return s1() === 0;
				});
				createComputed(() => {
					order += 'c1';
					return s1();
				});
				createComputed(() => {
					order += 'c2';
					t1();
					createComputed(() => {
						order += 'c2_1';
						return s2();
					});
				});
				order = '';
				set(1);
				expect(order).toBe('t1c1c2c2_1');
			});
		});
	});

	describe('with changing dependencies', () => {
		let i: () => boolean, setI: (v: boolean) => void;
		let t: () => number, setT: (v: number) => void;
		let e: () => number, setE: (v: number) => void;
		let fevals: number;
		let f: () => number;

		function init() {
			[i, setI] = createSignal<boolean>(true);
			[t, setT] = createSignal(1);
			[e, setE] = createSignal(2);
			fevals = 0;
			f = createMemo(() => {
				fevals++;
				return i() ? t() : e();
			});
			fevals = 0;
		}

		it('updates on active dependencies', () => {
			createRoot(() => {
				init();
				setT(5);
				expect(fevals).toBe(1);
				expect(f()).toBe(5);
			});
		});

		it('does not update on inactive dependencies', () => {
			createRoot(() => {
				init();
				setE(5);
				expect(fevals).toBe(0);
				expect(f()).toBe(1);
			});
		});

		it('deactivates obsolete dependencies', () => {
			createRoot(() => {
				init();
				setI(false);
				fevals = 0;
				setT(5);
				expect(fevals).toBe(0);
			});
		});

		it('activates new dependencies', () => {
			createRoot(() => {
				init();
				setI(false);
				fevals = 0;
				setE(5);
				expect(fevals).toBe(1);
			});
		});

		it('ensures that new dependencies are updated before dependee', () => {
			createRoot(() => {
				let order = '';
				const [a, setA] = createSignal(0);
				const b = createMemo(() => {
					order += 'b1';
					const res = a() + 1;
					order += `b2[${res}]`;
					return res;
				});
				const c = createMemo(() => {
					order += 'c1';
					const check = b();
					if (check) {
						order += `c2[${check}]`;
						return check;
					}
					const res = e();
					order += `c3[${res}]`;
					return res;
				});
				const d = createMemo(() => {
					order += 'd1';
					const res = a();
					order += `d2[${res}]`;
					return res;
				});
				const e = createMemo(() => {
					order += 'e1';
					const res = d() + 10;
					order += `e2[${res}]`;
					return res;
				});

				expect(order).toBe('b1b2[1]c1c2[1]d1d2[0]e1e2[10]');

				order = '';
				setA(-1);

				expect(order).toBe('b1b2[0]d1d2[-1]c1e1e2[9]c3[9]');
				expect(c()).toBe(9);

				order = '';
				setA(0);

				expect(order).toBe('b1b2[1]d1d2[0]c1c2[1]e1e2[10]');
				expect(c()).toBe(1);
			});
		});

		describe('with intercepting computations', () => {
			it('does not update subsequent pending computations after stale invocations', () => {
				createRoot(() => {
					const [s1, set1] = createSignal(1);
					const [s2, set2] = createSignal(false);
					let count = 0;
					/*
						  s1
						  |
					  +---+---+
					 t1 t2 c1 t3
					  \       /
						 c3
				   [PN,PN,STL,void]
			  */
					const t1 = createMemo(() => s1() > 0);
					const t2 = createMemo(() => s1() > 0);
					const c1 = createMemo(() => s1());
					const t3 = createMemo(() => {
						const a = s1();
						const b = s2();
						return a && b;
					});
					createComputed(() => {
						t1();
						t2();
						c1();
						t3();
						count++;
					});
					set2(true);
					expect(count).toBe(2);
					set1(2);
					expect(count).toBe(3);
				});
			});

			it('evaluates stale computations before dependendees when trackers stay unchanged', () => {
				createRoot(() => {
					const [s1, set] = createSignal(1, { equals: false });
					let order = '';
					const t1 = createMemo(() => {
						order += 't1';
						return s1() > 2;
					});
					const t2 = createMemo(() => {
						order += 't2';
						return s1() > 2;
					});
					const c1 = createMemo(
						() => {
							order += 'c1';
							s1();
						},
						// undefined,
						{ equals: false },
					);
					createComputed(() => {
						order += 'c2';
						t1();
						t2();
						c1();
					});
					order = '';
					set(1);
					expect(order).toBe('t1t2c1c2');
					order = '';
					set(3);
					expect(order).toBe('t1t2c1c2');
				});
			});

			it('evaluates nested trackings', () => {
				createRoot(() => {
					const [s1, set1] = createSignal(1);
					const [s2] = createSignal(1);
					let count = 0;
					let c1: () => number;
					createMemo(() => {
						c1 = createMemo(() => s2());
						return s1();
					});
					createComputed(() => {
						count++;
						c1();
					});
					set1(2);
					expect(count).toBe(1);
				});
			});

			it('propagates in topological order', () => {
				createRoot(() => {
					const [s1, set] = createSignal(true);
					let order = '';
					const t1 = createMemo(() => {
						order += 't1';
						return s1();
					});
					const t2 = createMemo(() => {
						order += 't2';
						return s1();
					});
					createComputed(() => {
						t1();
						t2();
						order += 'c1';
					});
					order = '';
					set(false);
					expect(order).toBe('t1t2c1');
				});
			});

			it('does not evaluate dependencies with tracking sources that have not changed', () => {
				createRoot(() => {
					const [s1, set] = createSignal(1);
					let order = '';
					createComputed(() => {
						order += 'c1';
						if (s1() > 1) {
							c2();
						}
					});
					const t1 = createMemo(() => {
						order += 't1';
						return s1() < 3;
					});
					const t2 = createMemo(() => {
						order += 't2';
						return t1();
					});
					const c2 = createMemo(() => {
						order += 'c2';
						return t2();
					});
					order = '';
					set(2);
					expect(order).toBe('c1t1');
					order = '';
					set(3);
					expect(order).toBe('c1t1t2c2');
				});
			});

			it('correctly marks downstream computations as stale on change', () => {
				createRoot(() => {
					const [s1, set] = createSignal(1);
					let order = '';
					const t1 = createMemo(() => {
						order += 't1';
						return s1();
					});
					const c1 = createMemo(() => {
						order += 'c1';
						return t1();
					});
					const c2 = createMemo(() => {
						order += 'c2';
						return c1();
					});
					createComputed(() => {
						order += 'c3';
						return c2();
					});
					order = '';
					set(2);
					expect(order).toBe('t1c1c2c3');
				});
			});
		});
	});

	describe('with unending changes', () => {
		it('throws when continually setting a direct dependency', () => {
			createRoot(() => {
				const [d, set] = createSignal(1);

				// expect(() => {
				let ex: unknown | undefined;
				try {
					createMemo(() => {
						return set(d() + 1);
					});
				} catch (e: unknown) {
					ex = e;
				}
				expect(ex).toBeDefined();
				expect((ex as Error).message).toBe('ErRoR1');
				// }).toThrow();
			});
		});

		it('throws when continually setting an indirect dependency', () => {
			createRoot(() => {
				let i = 2;
				const [d, set] = createSignal(1);
				const f1 = createMemo(() => d());
				const f2 = createMemo(() => f1());
				const f3 = createMemo(() => f2());

				// expect(() => {
				let ex: unknown | undefined;
				try {
					createMemo(() => {
						f3();
						set(i++);
					});
				} catch (e: unknown) {
					ex = e;
				}
				expect(ex).toBeDefined();
				expect((ex as Error).message).toBe('ErRoR1');
				// }).toThrow();
			});
		});
	});

	describe('with circular dependencies', () => {
		it('throws when cycle created by modifying a branch', () => {
			createRoot(() => {
				const [d, set] = createSignal(1);
				let val = false;
				// @ts-expect-error TS7022
				const f = createMemo(
					() => {
						if (val) {
							return f();
						}
						val = true;
						return d();
					},
					{
						equals: false,
					},
				);

				// expect(() => {
				let ex: unknown | undefined;
				try {
					set(0);
				} catch (e: unknown) {
					ex = e;
				}
				expect(ex).toBeDefined();
				expect((ex as Error).message).toBe('ErRoR1');
				// }).toThrow();
				expect(true).toBe(true);
			});
		});
	});
});
