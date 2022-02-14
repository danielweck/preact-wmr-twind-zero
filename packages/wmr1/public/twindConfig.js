import twindPresetAutoprefix from '@twind/preset-autoprefix';
import twindPresetExt from '@twind/preset-ext';
import twindPresetTailwind from '@twind/preset-tailwind';
import twindPresetTailwindForms from '@twind/preset-tailwind-forms';
import twindPresetTypography from '@twind/preset-typography';
import { asArray, defineConfig } from 'twind';

import { twindConfig } from './twind.config.js';

// @ts-expect-error TS2345
export const twConfig = defineConfig({
	...twindConfig,
	presets: [
		twindPresetAutoprefix(),
		...asArray(twindConfig.presets),
		twindPresetTailwind({ disablePreflight: false }),
		twindPresetTailwindForms({ strategy: 'class' }),
		twindPresetTypography(),
		twindPresetExt(),
	],
});
