#!/usr/bin/env node

import fs from 'fs';
// @ts-expect-error TS7016
import { cyan, green, red } from 'kolorist';
import path from 'path';

// const args = process.argv.slice(2);
// const packageJsonPath = args[0];

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));

/** @type {Array<{path: string, limit: string}>} */
const arr = packageJson['size-limit'];
if (!arr) {
	process.exit(0);
}

let abort = false;
for (const obj of arr) {
	const filePath = path.join(packageJsonPath, '..', obj.path);
	if (!fs.existsSync(filePath)) {
		console.log(`${cyan('SIZE LIMIT?!')} [${green(filePath.replace(process.cwd(), '.'))}]`);
		continue;
	}
	const nBytes = parseInt(obj.limit, 10);
	const { size } = fs.statSync(filePath);
	if (size > nBytes) {
		console.log(
			`${red('SIZE LIMIT :(')} [${green(filePath.replace(process.cwd(), '.'))}] (${cyan(size)} > ${cyan(nBytes)})`,
		);
		abort = true;
	} else {
		console.log(
			`${cyan('SIZE LIMIT :)')} [${green(filePath.replace(process.cwd(), '.'))}] (${cyan(size)} <= ${cyan(nBytes)})`,
		);
	}
}
if (abort) {
	process.exit(1);
}
