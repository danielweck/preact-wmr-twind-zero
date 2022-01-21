import twindPresetAutoprefix from '@twind/preset-autoprefix';
import twindPresetExt from '@twind/preset-ext';
import twindPresetTailwind from '@twind/preset-tailwind';
import twindPresetTailwindForms from '@twind/preset-tailwind-forms';
import { asArray, css, defineConfig } from 'twind';

import { twindConfig } from './twind.config.js';

export const twindReset = () => css`
	@layer base {
		:root#twind > body {
			@apply bg-yellow-100;

			border: 3px solid red;
		}
	}
`;

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
