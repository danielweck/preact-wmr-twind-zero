const fs = require('fs');
const vm = require('vm');
const path = require('path');
const code = fs.readFileSync(path.join(process.cwd(), 'dist/observant.rollup.js'), 'utf8');
const observant = vm.runInNewContext(`${code};observant`);

// MISMATCH:
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/sinuous-mod.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/sinuous.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/s-mod.cjs");

// const { signal, computed } = require("../../usignal.cjs");
// const createSignal = (val) => {
// const o = signal(val);
// return [() => o.value, v => o.value = v];
// };
// const createRoot = (fn) => {
// return fn();
// };
// const createComputed = (fn) => {
// const o = computed(fn);
// const tmp = o.value;
// };

// MATCH:
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/rval-mod.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/vuerx.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/bench/kairo.cjs");
// const { createRoot, createSignal, createComputed } = require("../../../solid/packages/solid/dist/solid.cjs");

// const { signal, computed } = require("../../preact-signals.cjs");
// const createSignal = (val) => {
// const o = signal(val);
// return [() => o.value, v => o.value = v];
// };
// const createRoot = (fn) => {
// return fn();
// };
// const createComputed = (fn) => {
// const o = computed(fn);
// const tmp = o.value;
// };

const { Reactive } = require("../../../reactively/packages/core/dist/reactively-core.cjs");
const createSignal = (val) => {
const o = new Reactive(val);
return [() => o.get(), v => o.set(v)];
};
const createRoot = (fn) => {
return fn();
};
const createComputed = (fn) => {
const o = new Reactive(fn);
const tmp = o.get();
};

// const createSignal = (val) => {
// 	const o = observant.obs(val);
// 	return [() => observant.get(o), (v) => observant.set(o, v)];
// };
// const createRoot = (fn) => {
// 	return fn();
// };
// const createComputed = (fn) => {
// 	const o = observant.obs(fn);
// 	observant.get(o);
// };
// // const createMemo = (fn) => {
// // 	const o = observant.obs(fn);
// // 	return () => observant.get(o);
// // };

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
	let [time, src, res] = run(fn, count, scount);
	console.log(`${fn.name}: ${time.toFixed(0)}`);
  
	const filePath = path.join(process.cwd(), "bench-data", `BENCH_${fn.name}.json`);
	if (!fs.existsSync(filePath)) {
	  fs.writeFileSync(filePath, JSON.stringify({src, res}), {encoding: "utf-8"});
	} else {
	  const rawSaved = fs.readFileSync(filePath, {encoding: "utf-8"});
	  const jsonSaved = JSON.parse(rawSaved);
	  const rawSavedSRC = JSON.stringify(jsonSaved.src);
	  const rawSavedRES = JSON.stringify(jsonSaved.res);
  
	  const rawNewSRC = JSON.stringify(src);
	  const rawNewRES = JSON.stringify(res);
	  if (rawNewSRC !== rawSavedSRC) {
		console.log("------ DIFF?! SRC", fn.name, filePath);
		fs.writeFileSync(`${filePath.replace(/.json$/, "")}_SRC.json`, rawNewSRC, {encoding: "utf-8"});
	  }
	  if (rawNewRES !== rawSavedRES) {
		console.log("------ DIFF?! RES", fn.name, filePath);
		fs.writeFileSync(`${filePath.replace(/.json$/, "")}_RES.json`, rawNewRES, {encoding: "utf-8"});
	  }
	  // const json = JSON.parse(raw);
	  // const resDiff = !arrayEquals(res, json.res);
	  // const srcDiff = !arrayEquals(src, json.src);
	  // if (srcDiff || resDiff) {
	  //   console.log("------ DIFF?!", srcDiff ? "SRC" : "RES", fn.name, filePath);
	  //   fs.writeFileSync(`${filePath.replace(/.json$/, "")}_CHECK.json`, JSON.stringify({src, res}), {encoding: "utf-8"});
	  // }
	}
  
	return time;
  }
  
  function run(fn, n, scount) {
	// prep n * arity sources
	let start,
	  end;
  
	let src = Array(scount);
	let res;
  
	createRoot(function () {
	  // run 3 times to warm up
	  let sources = createDataSignals(scount, []);
	  fn(n / 100, sources);
	  sources = createDataSignals(scount, []);
	  fn(n / 100, sources);
	  sources = createDataSignals(scount, []);
		  % OptimizeFunctionOnNextCall(fn);
	  fn(n / 100, sources);
	  sources = createDataSignals(scount, []);
	  for (let i = 0; i < scount; i++) {
		sources[i][0]();
		sources[i][0]();
		//%OptimizeFunctionOnNextCall(sources[i]);
		sources[i][0]();
	  }
  
		  // start GC clean
		  % CollectGarbage(null);
  
	  start = now();
  
	  res = fn(n, sources);
  
	  end = now();
  
	  for (let i = 0; i < scount; i++) {
		src[i] = sources[i][0]();
	  }
  
	  // end GC clean
	  sources = null;
		  % CollectGarbage(null);
	});
  
	return [end - start, src, res];
  }
  
  function createDataSignals(n, sources) {
	for (let i = 0; i < n; i++) {
	  sources[i] = createSignal(i);
	}
	return sources;
  }
  
  function createComputations0to1(n, sources) {
	const res = Array(n);
	for (let i = 0; i < n; i++) {
	  res[i] = createComputation0(i);
	}
	return res;
  }
  
  function createComputations1to1000(n, sources) {
	const res = Array(n);
	let k = 0;
	for (let i = 0; i < n / 1000; i++) {
	  const [get] = sources[i];
	  for (let j = 0; j < 1000; j++) {
		res[k++] = createComputation1(get);
	  }
	  //sources[i] = null;
	}
	return res;
  }
  
  function createComputations1to8(n, sources) {
	const res = Array(n);
	for (let i = 0; i < n / 8; i++) {
	  const [get] = sources[i];
	  res[i] = createComputation1(get);
	  res[i + 1] = createComputation1(get);
	  res[i + 2] = createComputation1(get);
	  res[i + 3] = createComputation1(get);
	  res[i + 4] = createComputation1(get);
	  res[i + 5] = createComputation1(get);
	  res[i + 6] = createComputation1(get);
	  res[i + 7] = createComputation1(get);
	  //sources[i] = null;
	}
	return res;
  }
  
  function createComputations1to4(n, sources) {
	const res = Array(n);
	for (let i = 0; i < n / 4; i++) {
	  const [get] = sources[i];
	  res[i] = createComputation1(get);
	  res[i + 1] = createComputation1(get);
	  res[i + 2] = createComputation1(get);
	  res[i + 3] = createComputation1(get);
	  //sources[i] = null;
	}
	return res;
  }
  
  function createComputations1to2(n, sources) {
	const res = Array(n);
	for (let i = 0; i < n / 2; i++) {
	  const [get] = sources[i];
	  res[i] = createComputation1(get);
	  res[i + 1] = createComputation1(get);
	  //sources[i] = null;
	}
	return res;
  }
  
  function createComputations1to1(n, sources) {
	const res = Array(n);
	for (let i = 0; i < n; i++) {
	  const [get] = sources[i]
	  res[i] = createComputation1(get);
	  //sources[i] = null;
	}
	return res;
  }
  
  function createComputations2to1(n, sources) {
	const res = Array(n);
	for (let i = 0; i < n; i++) {
	  res[i] = createComputation2(
		sources[i * 2][0],
		sources[i * 2 + 1][0]
	  );
	  //sources[i * 2] = null;
	  //sources[i * 2 + 1] = null;
	}
	return res;
  }
  
  function createComputations4to1(n, sources) {
	const res = Array(n);
	for (let i = 0; i < n; i++) {
	  res[i] = createComputation4(
		sources[i * 4][0],
		sources[i * 4 + 1][0],
		sources[i * 4 + 2][0],
		sources[i * 4 + 3][0]
	  );
	  //sources[i * 4] = null;
	  //sources[i * 4 + 1] = null;
	  //sources[i * 4 + 2] = null;
	  //sources[i * 4 + 3] = null;
	}
	return res;
  }
  
  function createComputations8(n, sources) {
	const res = Array(n);
	for (let i = 0; i < n; i++) {
	  res[i] = createComputation8(
		sources[i * 8][0],
		sources[i * 8 + 1][0],
		sources[i * 8 + 2][0],
		sources[i * 8 + 3][0],
		sources[i * 8 + 4][0],
		sources[i * 8 + 5][0],
		sources[i * 8 + 6][0],
		sources[i * 8 + 7][0]
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
	return res;
  }
  
  // only create n / 100 computations, as otherwise takes too long
  function createComputations1000to1(n, sources) {
	const res = Array(n);
	for (let i = 0; i < n; i++) {
	  res[i] = createComputation1000(sources, i * 1000);
	}
	return res;
  }
  
  function createComputation0(i) {
	const res = Array(1);
	createComputed(function () { res[0] = i; return res[0]; });
	return res;
  }
  
  function createComputation1(s1) {
	const res = Array(1);
	createComputed(function () { res[0] = s1(); return res[0]; });
	return res;
  }
  
  function createComputation2(s1, s2) {
	const res = Array(1);
	createComputed(function () { res[0] = s1() + s2(); return res[0]; });
	return res;
  }
  
  function createComputation4(s1, s2, s3, s4) {
	const res = Array(1);
	createComputed(function () { res[0] = s1() + s2() + s3() + s4(); return res[0]; });
	return res;
  }
  
  function createComputation8(s1, s2, s3, s4, s5, s6, s7, s8) {
	const res = Array(1);
	createComputed(function () { res[0] = s1() + s2() + s3() + s4() + s5() + s6() + s7() + s8(); return res[0]; });
	return res;
  }
  
  function createComputation1000(ss, offset) {
	const res = Array(1);
	createComputed(function () {
	  let sum = 0;
	  for (let i = 0; i < 1000; i++) {
		sum += ss[offset + i][0]();
	  }
	  res[0] = sum;
	  return sum;
	});
	return res;
  }
  
  function updateComputations1to1(n, sources) {
	let [get1, set1] = sources[0];
	const res = [];
	createComputed(function () { /* if (res[0] !== get1()) console.log(res[0], get1()); */ res.push(get1()); return res[res.length-1]; });
	for (let i = 0; i < n; i++) {
	  set1(i);
	}
	return res;
  }
  
  function updateComputations2to1(n, sources) {
	let [get1, set1] = sources[0],
	  [get2] = sources[1];
	const res = [];
	createComputed(function () { res.push(get1() + get2()); return res[res.length-1]; });
	for (let i = 0; i < n; i++) {
	  set1(i);
	}
	return res;
  }
  
  function updateComputations4to1(n, sources) {
	let [get1, set1] = sources[0],
	  [get2] = sources[1];
	  let [get3] = sources[2],
	  [get4] = sources[3];
	const res = [];
	createComputed(function () { res.push(get1() + get2() + get3() + get4()); return res[res.length-1]; });
	for (let i = 0; i < n; i++) {
	  set1(i);
	}
	return res;
  }
  
  function updateComputations1000to1(n, sources) {
	let [get1, set1] = sources[0];
	const res = [];
	createComputed(function () {
	  let sum = 0;
	  
	  for (let i = 0; i < 1000; i++) {
		sum += sources[i][0]();
	  }
  
	  res.push(sum);
	  return sum;
	});
	for (let i = 0; i < n; i++) {
	  set1(i);
	}
	return res;
  }
  
  function updateComputations500to1Alt(n, sources) {
	let [get1, set1] = sources[0];
	const [getA, setA] = createSignal(false);
	const res = [];
	createComputed(function () {
	  let sum = 0;
  
	if (getA()) {
	  for (let i = 0; i < 500; i++) {
		sum += sources[i][0]();
	  }
	} else {
	  for (let i = 500; i < 1000; i++) {
		sum += sources[i][0]();
	  }
	}
	  res.push(sum);
	  return sum;
	});
	for (let i = 0; i < n; i++) {
	  set1(i);
	}
	setA(true);
	for (let i = 0; i < n; i++) {
	  set1(i);
	}
	return res;
  }
  
  function updateComputations1to2(n, sources) {
	let [get1, set1] = sources[0];
	const res = [];
	createComputed(function () { res.push(get1()); return res[res.length-1]; });
	createComputed(function () { res.push(get1()); return res[res.length-1]; });
	for (let i = 0; i < n / 2; i++) {
	  set1(i);
	}
	return res;
  }
  
  function updateComputations1to4(n, sources) {
	let [get1, set1] = sources[0];
	const res = [];
	createComputed(function () { res.push(get1()); return res[res.length-1]; });
	createComputed(function () { res.push(get1()); return res[res.length-1]; });
	createComputed(function () { res.push(get1()); return res[res.length-1]; });
	createComputed(function () { res.push(get1()); return res[res.length-1]; });
	for (let i = 0; i < n / 4; i++) {
	  set1(i);
	}
	return res;
  }
  
  function updateComputations1to1000(n, sources) {
	let [get1, set1] = sources[0];
	const res = [];
	for (let i = 0; i < 1000; i++) {
	  createComputed(function () { res.push(get1()); return res[res.length-1]; });
	}
	for (let i = 0; i < n / 1000; i++) {
	  set1(i);
	}
	return res;
  }
  
  function browserNow() {
	return performance.now();
  }
  
  function nodeNow() {
	let hrt = process.hrtime();
	return hrt[0] * 1000 + hrt[1] / 1e6;
  }
}