import { asArray, defineConfig } from '@twind/core';
import twindPresetAutoprefix from '@twind/preset-autoprefix';
import twindPresetExt from '@twind/preset-ext';
import twindPresetTailwind from '@twind/preset-tailwind';
import twindPresetTailwindForms from '@twind/preset-tailwind-forms';

import { twindConfig } from './twind.config.js';

/** type {import('@twind/core').TwindConfig<import('@twind/core').BaseTheme>} */
export const twConfig = defineConfig({
	...twindConfig,
	presets: [
		twindPresetAutoprefix(),
		...asArray(twindConfig.presets),
		twindPresetExt(),
		twindPresetTailwind({ preflight: true }),
		twindPresetTailwindForms({ strategy: 'class' }),
	],
});
