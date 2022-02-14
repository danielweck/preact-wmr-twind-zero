import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { assync, func } from './index.js';

// eslint-disable-next-line jest/expect-expect
test('index assync() string test', async () => {
	assert.is(await assync(), 'assync async');
});

// eslint-disable-next-line jest/expect-expect
test('index func() string test', () => {
	assert.is(func(), 'func other foo');
});

test.run();
