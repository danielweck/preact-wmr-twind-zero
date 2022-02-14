import { expect, test } from 'vitest';

import { assync, func } from './index.js';

test('index assync() string test', async () => {
	expect(await assync()).toBe('assync async');
});

test('index func() string test', () => {
	expect(func()).toBe('func other foo');
});
