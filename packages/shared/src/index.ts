import { ass } from './sub/foo.js';

export { func } from './func.js';

// comment 1
export const assync = async () => {
	return `assync ${await ass()}`;
};
