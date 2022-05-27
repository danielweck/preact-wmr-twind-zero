const fs = require('fs');
const vm = require('vm');
const path = require('path');
const code = fs.readFileSync(path.join(process.cwd(), 'dist/observant.rollup.js'), 'utf8');
const observant = vm.runInNewContext(`${code};observant`);

// MISMATCH:
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/sinuous-mod.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/sinuous.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/s-mod.cjs");

// MATCH:
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/rval-mod.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/vuerx.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/kairo.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/dist/solid.cjs");

const createSignal = (val) => {
	const o = observant.obs(val);
	return [() => observant.get(o), (v) => observant.set(o, v)];
};
const createRoot = (fn) => {
	return fn();
};
const createComputed = (fn) => {
	const o = observant.obs(fn);
	observant.get(o);
};
// const createMemo = (fn) => {
// 	const o = observant.obs(fn);
// 	return () => observant.get(o);
// };

// -------

if (process.env.WAIT_KEY === "1") {
const pressAnyKeyPromise = () => {
const message = "Press any key to continue, or CTRL+C to exit...";
process.stdout.write(message + "\n");

return new Promise((resolve, reject) => {
const onStdInData = (buffer) => {
process.stdin.removeListener("data", onStdInData);
process.stdin.setRawMode(false);
process.stdin.pause();

process.stdout.write("\n");

const bytes = Array.from(buffer);
if (bytes.length && bytes[0] === 3) {
reject(new Error("CTRL+C"));
// process.exit(1);
return;
}
process.nextTick(resolve);
};

process.stdin.resume();
process.stdin.setRawMode(true);
process.stdin.once("data", onStdInData);
});
};

;(async () => {
try {
	await pressAnyKeyPromise();
	doStuff();
} catch (err) {
	process.stdout.write((err.message || "ERROR!?") + "\n");
	process.exit(1);
}
})(); // .then(process.exit(0));
} else {
	doStuff();
}

function doStuff() {

let now = typeof process === 'undefined' ? browserNow : nodeNow;

let COUNT = 1e5;

main();

function main() {
	let createTotal = 0;
	createTotal += bench(createDataSignals, COUNT, COUNT);
	createTotal += bench(createComputations0to1, COUNT, 0);
	createTotal += bench(createComputations1to1, COUNT, COUNT);
	createTotal += bench(createComputations2to1, COUNT / 2, COUNT);
	createTotal += bench(createComputations4to1, COUNT / 4, COUNT);
	createTotal += bench(createComputations1000to1, COUNT / 1000, COUNT);
	//total += bench1(createComputations8, COUNT, 8 * COUNT);
	createTotal += bench(createComputations1to2, COUNT, COUNT / 2);
	createTotal += bench(createComputations1to4, COUNT, COUNT / 4);
	createTotal += bench(createComputations1to8, COUNT, COUNT / 8);
	createTotal += bench(createComputations1to1000, COUNT, COUNT / 1000);
	console.log(`create total: ${createTotal.toFixed(0)}`);
	console.log('---');
	let updateTotal = 0;
	updateTotal += bench(updateComputations1to1, COUNT * 4, 1);
	updateTotal += bench(updateComputations2to1, COUNT * 2, 2);
	updateTotal += bench(updateComputations4to1, COUNT, 4);
	updateTotal += bench(updateComputations1000to1, COUNT / 100, 1000);
	updateTotal += bench(updateComputations1to2, COUNT * 4, 1);
	updateTotal += bench(updateComputations1to4, COUNT * 4, 1);
	updateTotal += bench(updateComputations1to1000, COUNT * 4, 1);
	console.log(`update total: ${updateTotal.toFixed(0)}`);
	console.log(`total: ${(createTotal + updateTotal).toFixed(0)}`);
}

function bench(fn, count, scount) {
	let time = run(fn, count, scount);
	console.log(`${fn.name}: ${time.toFixed(0)}`);
	return time;
}

function run(fn, n, scount) {
	// prep n * arity sources
	let start, end;

	createRoot(function () {
		// run 3 times to warm up
		let sources = createDataSignals(scount, []);
		fn(n / 100, sources);
		sources = createDataSignals(scount, []);
		fn(n / 100, sources);
		sources = createDataSignals(scount, []);
        // @ts-expect-error TS1109
		%OptimizeFunctionOnNextCall(fn);
		fn(n / 100, sources);
		sources = createDataSignals(scount, []);
		for (let i = 0; i < scount; i++) {
			sources[i][0]();
			sources[i][0]();
            // @ts-expect-error TS1109
			//%OptimizeFunctionOnNextCall(sources[i]);
			sources[i][0]();
		}

		// start GC clean
        // @ts-expect-error TS1109
		%CollectGarbage(null);

		start = now();

		fn(n, sources);

		end = now();

		// end GC clean
		sources = null;
        // @ts-expect-error TS1109
		%CollectGarbage(null);
	});

	return end - start;
}

function createDataSignals(n, sources) {
	for (let i = 0; i < n; i++) {
		sources[i] = createSignal(i);
	}
	return sources;
}

function createComputations0to1(n, sources) {
	for (let i = 0; i < n; i++) {
		createComputation0(i);
	}
}

function createComputations1to1000(n, sources) {
	for (let i = 0; i < n / 1000; i++) {
		const [get] = sources[i];
		for (let j = 0; j < 1000; j++) {
			createComputation1(get);
		}
		//sources[i] = null;
	}
}

function createComputations1to8(n, sources) {
	for (let i = 0; i < n / 8; i++) {
		const [get] = sources[i];
		createComputation1(get);
		createComputation1(get);
		createComputation1(get);
		createComputation1(get);
		createComputation1(get);
		createComputation1(get);
		createComputation1(get);
		createComputation1(get);
		//sources[i] = null;
	}
}

function createComputations1to4(n, sources) {
	for (let i = 0; i < n / 4; i++) {
		const [get] = sources[i];
		createComputation1(get);
		createComputation1(get);
		createComputation1(get);
		createComputation1(get);
		//sources[i] = null;
	}
}

function createComputations1to2(n, sources) {
	for (let i = 0; i < n / 2; i++) {
		const [get] = sources[i];
		createComputation1(get);
		createComputation1(get);
		//sources[i] = null;
	}
}

function createComputations1to1(n, sources) {
	for (let i = 0; i < n; i++) {
		const [get] = sources[i];
		createComputation1(get);
		//sources[i] = null;
	}
}

function createComputations2to1(n, sources) {
	for (let i = 0; i < n; i++) {
		createComputation2(sources[i * 2][0], sources[i * 2 + 1][0]);
		//sources[i * 2] = null;
		//sources[i * 2 + 1] = null;
	}
}

function createComputations4to1(n, sources) {
	for (let i = 0; i < n; i++) {
		createComputation4(sources[i * 4][0], sources[i * 4 + 1][0], sources[i * 4 + 2][0], sources[i * 4 + 3][0]);
		//sources[i * 4] = null;
		//sources[i * 4 + 1] = null;
		//sources[i * 4 + 2] = null;
		//sources[i * 4 + 3] = null;
	}
}

function createComputations8(n, sources) {
	for (let i = 0; i < n; i++) {
		createComputation8(
			sources[i * 8][0],
			sources[i * 8 + 1][0],
			sources[i * 8 + 2][0],
			sources[i * 8 + 3][0],
			sources[i * 8 + 4][0],
			sources[i * 8 + 5][0],
			sources[i * 8 + 6][0],
			sources[i * 8 + 7][0],
		);
		sources[i * 8] = null;
		sources[i * 8 + 1] = null;
		sources[i * 8 + 2] = null;
		sources[i * 8 + 3] = null;
		sources[i * 8 + 4] = null;
		sources[i * 8 + 5] = null;
		sources[i * 8 + 6] = null;
		sources[i * 8 + 7] = null;
	}
}

// only create n / 100 computations, as otherwise takes too long
function createComputations1000to1(n, sources) {
	for (let i = 0; i < n; i++) {
		createComputation1000(sources, i * 1000);
	}
}

function createComputation0(i) {
	createComputed(function () {
		return i;
	});
}

function createComputation1(s1) {
	createComputed(function () {
		return s1();
	});
}

function createComputation2(s1, s2) {
	createComputed(function () {
		return s1() + s2();
	});
}

function createComputation4(s1, s2, s3, s4) {
	createComputed(function () {
		return s1() + s2() + s3() + s4();
	});
}

function createComputation8(s1, s2, s3, s4, s5, s6, s7, s8) {
	createComputed(function () {
		return s1() + s2() + s3() + s4() + s5() + s6() + s7() + s8();
	});
}

function createComputation1000(ss, offset) {
	createComputed(function () {
		let sum = 0;
		for (let i = 0; i < 1000; i++) {
			sum += ss[offset + i][0]();
		}
		return sum;
	});
}

function updateComputations1to1(n, sources) {
	let [get1, set1] = sources[0];
	createComputed(function () {
		return get1();
	});
	for (let i = 0; i < n; i++) {
		set1(i);
	}
}

function updateComputations2to1(n, sources) {
	let [get1, set1] = sources[0],
		[get2] = sources[1];
	createComputed(function () {
		return get1() + get2();
	});
	for (let i = 0; i < n; i++) {
		set1(i);
	}
}

function updateComputations4to1(n, sources) {
	let [get1, set1] = sources[0],
		[get2] = sources[1];
	let [get3] = sources[2], [get4] = sources[3];
	createComputed(function () {
		return get1() + get2() + get3() + get4();
	});
	for (let i = 0; i < n; i++) {
		set1(i);
	}
}

function updateComputations1000to1(n, sources) {
	let [get1, set1] = sources[0];
	createComputed(function () {
		let sum = 0;
		for (let i = 0; i < 1000; i++) {
			sum += sources[i][0]();
		}
		return sum;
	});
	for (let i = 0; i < n; i++) {
		set1(i);
	}
}

function updateComputations1to2(n, sources) {
	let [get1, set1] = sources[0];
	createComputed(function () {
		return get1();
	});
	createComputed(function () {
		return get1();
	});
	for (let i = 0; i < n / 2; i++) {
		set1(i);
	}
}

function updateComputations1to4(n, sources) {
	let [get1, set1] = sources[0];
	createComputed(function () {
		return get1();
	});
	createComputed(function () {
		return get1();
	});
	createComputed(function () {
		return get1();
	});
	createComputed(function () {
		return get1();
	});
	for (let i = 0; i < n / 4; i++) {
		set1(i);
	}
}

function updateComputations1to1000(n, sources) {
	let [get1, set1] = sources[0];
	for (let i = 0; i < 1000; i++) {
		createComputed(function () {
			return get1();
		});
	}
	for (let i = 0; i < n / 1000; i++) {
		set1(i);
	}
}

function browserNow() {
	return performance.now();
}

function nodeNow() {
	let hrt = process.hrtime();
	return hrt[0] * 1000 + hrt[1] / 1e6;
}

// -------

const start = {
	prop1: observant.obs(1),
	prop2: observant.obs(2),
	prop3: observant.obs(3),
	prop4: observant.obs(4),
};

let onC = 0;

let layer = start;
for (let i = 5000; i > 0; i--) {
	layer = (function (m) {
		const s = {
			prop1: observant.obs(function () {
				return observant.get(m.prop2);
			}, true),
			prop2: observant.obs(function () {
				return observant.get(m.prop1) - observant.get(m.prop3);
			}, true),
			prop3: observant.obs(function () {
				return observant.get(m.prop2) + observant.get(m.prop4);
			}, true),
			prop4: observant.obs(function () {
				return observant.get(m.prop3);
			}, true),
		};

		// observant.on(s.prop1, () => {onC++});
		// observant.on(s.prop2, () => {onC++});
		// observant.on(s.prop3, () => {onC++});
		// observant.on(s.prop4, () => {onC++});

		return s;
	})(layer);
}

const end = layer;

console.log(observant.get(end.prop1) === 2);
console.log(observant.get(end.prop2) === 4);
console.log(observant.get(end.prop3) === -1);
console.log(observant.get(end.prop4) === -6);

const timeStart = performance.now();

observant.set(start.prop1, 4);
observant.set(start.prop2, 3);
observant.set(start.prop3, 2);
observant.set(start.prop4, 1);

console.log(observant.get(end.prop1) === -2);
console.log(observant.get(end.prop2) === 1);
console.log(observant.get(end.prop3) === -4);
console.log(observant.get(end.prop4) === -4);

const duration = performance.now() - timeStart;

console.log(duration);
console.log(onC);
}