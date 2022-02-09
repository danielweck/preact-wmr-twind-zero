// eslint-disable-next-line import/default
import parcelCss from '@parcel/css';
import browserslist from 'browserslist';
import fs from 'fs';
import { cyan, green } from 'kolorist';
import path from 'path';

const SKIP_CSS_MINIFY = false;

// eslint-disable-next-line import/no-named-as-default-member
const { browserslistToTargets, transform } = parcelCss;

const targets = browserslistToTargets(
	browserslist(fs.readFileSync(path.join(process.cwd(), '.browserslistrc'), { encoding: 'utf8' }).split('\n')),
);
// console.log(`------> browserslist targets for ParcelCSS: ${JSON.stringify(targets, null, 4)}`);

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

const DEBUG_PREFIX = '\nWMR POST-PRERENDER SCRIPT:\n';

/**
 * @param {number} bytes
 * @param {number} [decimals=2]
 * @return {string}
 */
const prettyBytes = (bytes, decimals) => {
	if (bytes === 0) {
		return '0 Bytes';
	}
	const k = 1024;
	const decs = decimals || 2;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decs))} ${sizes[i]}`;
};

setTimeout(async () => {
	let totalCssBytesSaved = 0;
	/** @type {Record<string, string>} */
	const htmlCssMap = {};
	const root = path.join(process.cwd(), 'dist');
	const files = await readdirRecursive(root, []);
	for (const file of files) {
		if (/\.html?$/.test(file)) {
			const htmlFilePath = path.join(root, file);
			let html = fs.readFileSync(htmlFilePath, { encoding: 'utf8' });

			// const r = new RegExp(TWIND_REGEXP).exec(html);
			// const preactCss = (r && r[1]) || '/* TWIND REGEXP FAIL???? */';

			const relativeCssPath = `${path.dirname(path.relative(root, htmlFilePath)).replace(/\\/g, '/')}/${path.basename(
				htmlFilePath,
			)} (inline CSS)`.replace(/\.\//g, '');

			let preactCss = '';
			html = html.replace(TWIND_REGEXP, (_match, /** @type {string} */ $1) => {
				preactCss += $1;
				const buff = Buffer.from($1);
				const sizeBefore = buff.length;

				const { code: parcelCssBuffer, map: _map } = SKIP_CSS_MINIFY
					? { code: buff, map: undefined }
					: transform({
							filename: relativeCssPath,
							code: buff,
							minify: true,
							sourceMap: false,
							targets,
					  });
				// const optimisedCss = parcelCssBuffer.toString();

				const sizeAfter = parcelCssBuffer.length;
				const sizeSaved = sizeBefore - sizeAfter;
				totalCssBytesSaved += sizeSaved;
				console.log(
					`${DEBUG_PREFIX}ParcelCSS [${cyan(relativeCssPath)}]\n${green(prettyBytes(sizeBefore))} >>>> ${green(
						prettyBytes(sizeAfter),
					)} (${green(prettyBytes(sizeSaved))} saved)\n`,
				);

				const optimisedCss = parcelCssBuffer.toString();
				return `<style id="__twind">${optimisedCss}</style>`;
			});

			fs.writeFileSync(htmlFilePath, html, { encoding: 'utf8' });

			if (!preactCss) {
				preactCss = '/* TWIND REGEXP FAIL???? */';
			}

			htmlCssMap[htmlFilePath] = preactCss;

			// if (htmlFilePath.indexOf('static-no-hydrate') >= 0) {
			// 	console.log(htmlFilePath);
			// 	console.log('=====> (1)');
			// 	console.log(preactCss);
			// }
		}
	}
	const htmlFilePaths = Object.keys(htmlCssMap);
	htmlFilePaths.forEach((htmlFilePath) => {
		const fullCssPath = `${htmlFilePath}.css`;

		const cssSelf = htmlCssMap[htmlFilePath];
		const cssSelfLines = cssSelf.split('\n');
		/** @type {string[]} */
		const hydrateCss = [];

		htmlFilePaths.forEach((otherHtmlFilePath) => {
			if (htmlFilePath === otherHtmlFilePath) {
				// if (htmlFilePath.indexOf('static-no-hydrate') >= 0) {
				// 	console.log('(SKIP LOOP)');
				// }
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

		// fullCssPath
		const relativeCssPath = `${path.dirname(path.relative(root, htmlFilePath)).replace(/\\/g, '/')}/${path.basename(
			htmlFilePath,
		)}.css`.replace(/\.\//g, '');

		const hydrateCssStr = hydrateCss.join(SKIP_CSS_MINIFY ? '\n' : '');

		// if (htmlFilePath.indexOf('static-no-hydrate') >= 0) {
		// 	console.log(htmlFilePath);
		// 	console.log('=====> (2)');
		// 	console.log(hydrateCssStr);
		// }

		// Uncomment this line to compare ParcelCSS minified+optimised output with Twind's original stylesheet
		// fs.writeFileSync(`${fullCssPath}.before-parcel.css`, hydrateCssStr, { encoding: 'utf8' });

		const cssFileHref = `${path.basename(htmlFilePath)}.css`;

		const buff = Buffer.from(hydrateCssStr);
		const sizeBefore = buff.length;

		const { code: parcelCssBuffer, map: _map } = SKIP_CSS_MINIFY
			? { code: buff, map: undefined }
			: transform({
					filename: cssFileHref,
					code: buff,
					minify: true,
					sourceMap: false,
					targets,
			  });
		// const optimisedCss = parcelCssBuffer.toString();

		const sizeAfter = parcelCssBuffer.length;
		const sizeSaved = sizeBefore - sizeAfter;
		totalCssBytesSaved += sizeSaved;

		console.log(
			`${DEBUG_PREFIX}ParcelCSS [${cyan(relativeCssPath)}]\n${green(prettyBytes(sizeBefore))} >>>> ${green(
				prettyBytes(sizeAfter),
			)} (${green(prettyBytes(sizeSaved))} saved)\n`,
		);

		fs.writeFileSync(fullCssPath, parcelCssBuffer, { encoding: 'utf8' });

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
			// eslint-disable-next-line quotes
			CSS_PERF ? "&&console.timeEnd('CSS')" : ''
		}${
			CSS_PERF ? ')' : ''
		};(document.readyState=='interactive'||document.readyState=='complete'?h():document.addEventListener(n,h))`
			.replace(/\s\s*/gm, ' ')
			.trim();

		// add the lower-priority non-critical CSS external stylesheet links
		html = html.replace(
			/<\/head>/,
			`
<!-- UNCOMMENT THIS FOR HIGHER FETCH PRIORITY link rel="preload" href="${cssFileHref}" as="style" crossorigin="anonymous" / -->
<link rel="stylesheet" href="${cssFileHref}" media="print" onload="${onStylesheetLinkLoad}" crossorigin="anonymous" />
<noscript><link rel="stylesheet" href="${cssFileHref}"></noscript>
</head>
`,
		);
		fs.writeFileSync(htmlFilePath, html, { encoding: 'utf8' });
	});

	console.log(`${DEBUG_PREFIX}ParcelCSS ${green(prettyBytes(totalCssBytesSaved))} total saved\n`);
});
