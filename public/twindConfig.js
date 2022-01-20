import twindPresetAutoprefix from '@twind/preset-autoprefix';
import twindPresetExt from '@twind/preset-ext';
import twindPresetTailwind from '@twind/preset-tailwind';
import twindPresetTailwindForms from '@twind/preset-tailwind-forms';
import { asArray, defineConfig } from 'twind';

import { twindConfig } from './twind.config.js';

/** type {import('twind').TwindConfig<import('twind').BaseTheme>} */
export const twConfig = defineConfig({
	...twindConfig,
	presets: [
		twindPresetAutoprefix(),
		...asArray(twindConfig.presets),
		twindPresetExt(),
		twindPresetTailwind({ enablePreflight: true }),
		twindPresetTailwindForms({ strategy: 'class' }),
	],
});
