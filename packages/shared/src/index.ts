import { ass } from './sub/foo.js';

export { func } from './func.js';

export const assync = async () => {
	return `assync ${await ass()}`;
};
