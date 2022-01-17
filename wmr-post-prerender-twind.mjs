import path from 'path';
import fs from 'fs';

/**
 * @param {string} rootDir directory in which to search
 * @param {string[]} [ignore = []] Root-relative paths start with `/`, no slash ignores by file basename, `"."` ignores all dotfiles
 */
async function readdirRecursive(rootDir, ignore = []) {
	/** @type {string[]} */
	const files = [];
	const noDotFiles = ignore.includes('.');
	const r = (/** @type {string} */ dir) => {
		const p = [];
		const wdir = path.join(rootDir, dir);
		for (const f of fs.readdirSync(wdir, { withFileTypes: true })) {
			const name = path.join(dir, f.name);
			if ((noDotFiles && f.name[0] === '.') || ignore.includes(f.name) || ignore.includes(`/${name}`)) continue;
			if (f.isFile()) files.push(name);
			else if (f.isDirectory()) p.push(r(name));
		}
	};
	await r('');
	return files;
}

const TWIND_REGEXP = /<style id="__twind">([\s\S]+)<\/style>/gm;

setTimeout(async () => {
	/** @type {Record<string, string>} */
	const htmlCssMap = {};
	const root = path.join(process.cwd(), 'dist');
	const files = await readdirRecursive(root, []);
	for (const file of files) {
		if (/\.html?$/.test(file)) {
			console.log(`##################### ${file}`);

			const htmlFilePath = path.join(root, file);
			let html = fs.readFileSync(htmlFilePath, { encoding: 'utf8' });

			const preactCss = new RegExp(TWIND_REGEXP).exec(html)[1] || '/* TWIND REGEXP FAIL???? */';
			htmlCssMap[htmlFilePath] = preactCss;
		}
	}
	const htmlFilePaths = Object.keys(htmlCssMap);
	htmlFilePaths.forEach((htmlFilePath) => {
		const cssSelf = htmlCssMap[htmlFilePath];
		const cssSelfLines = cssSelf.split('\n');
		/** @type {string[]} */
		const hydrateCss = [];
		htmlFilePaths.forEach((otherHtmlFilePath) => {
			if (htmlFilePath === otherHtmlFilePath) {
				return;
			}
			const cssOther = htmlCssMap[otherHtmlFilePath];
			const cssOtherLines = cssOther.split('\n');
			cssOtherLines.forEach((cssOtherLine) => {
				if (cssOtherLine.startsWith('/*')) {
					return;
				}
				if (!hydrateCss.includes(cssOtherLine) && !cssSelfLines.includes(cssOtherLine)) {
					hydrateCss.push(cssOtherLine);
				}
			});
		});

		fs.writeFileSync(`${htmlFilePath}.css`, hydrateCss.join('\n'), { encoding: 'utf8' });
		const cssFilePath = `${path.dirname(path.relative(root, htmlFilePath)).replace(/\\/g, '/')}/${path.basename(
			htmlFilePath,
		)}.css`.replace(/\.\//g, '');
		console.log('CSS: ', cssFilePath);

		const cssFilename = `${path.basename(htmlFilePath)}.css`;

		let html = fs.readFileSync(htmlFilePath, { encoding: 'utf8' });

		const CSS_PERF = false;
		// document.readyState:
		// -1 loading
		// -2 interactive (document.DOMContentLoaded)
		// -3 complete (window.load)
		const onStylesheetLinkLoad = `this.onload=null;${
			// eslint-disable-next-line quotes
			CSS_PERF ? "console.time('CSS');" : ''
		}var n='DOMContentLoaded',h=x=>${CSS_PERF ? '(' : ''}(this.media='all')${
			CSS_PERF
				? // eslint-disable-next-line quotes
				  "&&console.timeEnd('CSS')"
				: ''
		}${
			CSS_PERF ? ')' : ''
		};(document.readyState=='interactive'||document.readyState=='complete'?h():document.addEventListener(n,h))`
			.replace(/\s\s*/gm, ' ')
			.trim();

		// add the lower-priority non-critical CSS external stylesheet links
		html = html.replace(
			/<\/head>/,
			`
<!-- UNCOMMENT THIS FOR HIGHER FETCH PRIORITY link rel="preload" href="${cssFilename}" as="style" crossorigin="anonymous" / -->
<link rel="stylesheet" href="${cssFilename}" media="print" onload="${onStylesheetLinkLoad}" crossorigin="anonymous" />
<noscript><link rel="stylesheet" href="${cssFilename}"></noscript>
</head>
`,
		);
		fs.writeFileSync(htmlFilePath, html, { encoding: 'utf8' });
	});
});
