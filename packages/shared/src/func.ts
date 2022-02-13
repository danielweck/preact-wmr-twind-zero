import { other } from './sub/other.js';

export const func = () => {
	const str = 'Hello';
	for (const s of str) {
		console.log(s);
	}
	return `func ${other()}`;
};
