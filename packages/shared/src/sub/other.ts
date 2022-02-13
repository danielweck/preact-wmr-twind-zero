import { foo } from './foo.js';

/**
 * comment 2
 */
export const other = () => {
	return `other ${foo()}`;
};
