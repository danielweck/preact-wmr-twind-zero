import twindPresetAutoprefix from '@twind/preset-autoprefix';
import twindPresetExt from '@twind/preset-ext';
import twindPresetTailwind from '@twind/preset-tailwind';
import twindPresetTailwindForms from '@twind/preset-tailwind-forms';
import { asArray, defineConfig } from 'twind';

import { twindConfig } from './twind.config.js';

export const twConfig = defineConfig({
	...twindConfig,
	presets: [
		twindPresetAutoprefix(),
		...asArray(twindConfig.presets),
		twindPresetTailwind({ enablePreflight: true }),
		twindPresetTailwindForms({ strategy: 'class' }),
		twindPresetExt(),
	],
});
