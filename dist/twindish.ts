// no-op function
// ... so that @twind/typescript-plugin works in Visual Studio Code (intellisense / autocompletion)
export const twindTw = (strings: TemplateStringsArray, ...interpolations: string[]): string => {
	if (strings && strings.length === 1) {
		return strings[0];
	}
	// throw new Error('Twind no-op interpolated string template?!');
	let res = '';
	const l = strings ? strings.length : 0;
	for (let i = 0; i < l; i++) {
		res += strings[i];
		if (i < l - 1) {
			res += interpolations[i];
		}
	}
	return res;
};
export const twindApply = twindTw;
export const twindSkip = twindTw;
