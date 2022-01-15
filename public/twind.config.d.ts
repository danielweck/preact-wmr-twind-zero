import type { Configuration } from 'twind';
export const twindConfig: Configuration;
declare module 'twind' {
	interface Plugins {
		prose: '' | 'xl';
	}
}
