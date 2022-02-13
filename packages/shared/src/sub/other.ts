import { foo } from './foo.js';

export const other = () => {
	return `other ${foo()}`;
};
