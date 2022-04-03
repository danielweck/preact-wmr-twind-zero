// https://gist.github.com/developit/f4c67a2ede71dc2fab7f357f39cff28c
// https://preactjs.com/guide/v8/api-reference/#preactrender

export type FakeNode = {
	nodeType: number;
	parentNode: Element;
	childNodes: Node[];
	firstChild: Node | undefined;
	// __e: Node | undefined;
	insertBefore: (c: Node, r: Node) => void;
	appendChild: (c: Node, r: Node) => void;
	removeChild: (c: Node) => void;
};
export interface Element_ extends Element {
	__k: FakeNode | undefined;
}
export const createRootFragment = (parent: Element, replaceNode: Node | Node[]) => {
	const parent_ = parent as Element_;

	// ._children == .__k
	// https://github.com/preactjs/preact/blob/10.6.6/mangle.json#L45
	// https://github.com/preactjs/preact/blob/10.6.6/src/render.js#L30
	// eslint-disable-next-line no-constant-condition
	if (true || !parent_.__k) {
		// const replaceNodes = ([] as Node[]).concat(replaceNode);
		const replaceNodes = Array.isArray(replaceNode) ? replaceNode : [replaceNode];

		const nextSibling = replaceNodes[replaceNodes.length - 1].nextSibling;

		// console.log(
		// 	'createRootFragment !parent_.__k (OK) ',
		// 	((nextSibling || {}) as Element).nodeType,
		// 	((nextSibling || {}) as Element).tagName,
		// 	((nextSibling || {}) as Element).id,
		// 	(replaceNode as Element).tagName,
		// 	(replaceNode as Element).id,
		// );

		// ._dom == .__e
		// https://github.com/preactjs/preact/blob/10.6.6/mangle.json#L50
		// https://github.com/preactjs/preact/blob/10.6.6/src/render.js#L58
		parent_.__k = {
			// get __e() {
			// 	console.log(
			// 		'createRootFragment __e() ',
			// 		((nextSibling || {}) as Element).nodeType,
			// 		((nextSibling || {}) as Element).tagName,
			// 		((nextSibling || {}) as Element).id,
			// 		(replaceNode as Element).tagName,
			// 		(replaceNode as Element).id,
			// 	);
			// 	return replaceNodes[0];
			// },
			firstChild: replaceNodes[0],
			// get firstChild() {
			// 	console.log(
			// 		'createRootFragment firstChild() ',
			// 		((nextSibling || {}) as Element).nodeType,
			// 		((nextSibling || {}) as Element).tagName,
			// 		((nextSibling || {}) as Element).id,
			// 		(replaceNode as Element).tagName,
			// 		(replaceNode as Element).id,
			// 	);
			// 	return replaceNodes[0];
			// },
			nodeType: 1,
			// get nodeType() {
			// 	console.log(
			// 		'createRootFragment nodeType() ',
			// 		((nextSibling || {}) as Element).nodeType,
			// 		((nextSibling || {}) as Element).tagName,
			// 		((nextSibling || {}) as Element).id,
			// 		(replaceNode as Element).tagName,
			// 		(replaceNode as Element).id,
			// 	);
			// 	return 1;
			// },
			parentNode: parent,
			// get parentNode() {
			// 	console.log(
			// 		'createRootFragment parentNode() ',
			// 		parent.tagName,
			// 		parent.id,
			// 		((nextSibling || {}) as Element).nodeType,
			// 		((nextSibling || {}) as Element).tagName,
			// 		((nextSibling || {}) as Element).id,
			// 		(replaceNode as Element).tagName,
			// 		(replaceNode as Element).id,
			// 	);
			// 	return parent;
			// },
			childNodes: replaceNodes,
			// get childNodes() {
			// 	console.log(
			// 		'createRootFragment childNodes() ',
			// 		((nextSibling || {}) as Element).nodeType,
			// 		((nextSibling || {}) as Element).tagName,
			// 		((nextSibling || {}) as Element).id,
			// 		(replaceNode as Element).tagName,
			// 		(replaceNode as Element).id,
			// 	);
			// 	return replaceNodes;
			// },
			insertBefore: (n: Node, child: Node) => {
				// console.log(
				// 	'createRootFragment insertBefore() ',
				// 	(n as Element).tagName,
				// 	(n as Element).id,
				// 	(child as Element).tagName,
				// 	(child as Element).id,
				// 	((nextSibling || {}) as Element).nodeType,
				// 	((nextSibling || {}) as Element).tagName,
				// 	((nextSibling || {}) as Element).id,
				// 	(replaceNode as Element).tagName,
				// 	(replaceNode as Element).id,
				// );
				parent.insertBefore(n, child || nextSibling);
			},
			appendChild: (n: Node) => {
				// console.log(
				// 	'createRootFragment appendChild() ',
				// 	(n as Element).tagName,
				// 	(n as Element).id,
				// 	((nextSibling || {}) as Element).nodeType,
				// 	((nextSibling || {}) as Element).tagName,
				// 	((nextSibling || {}) as Element).id,
				// 	(replaceNode as Element).tagName,
				// 	(replaceNode as Element).id,
				// );
				parent.insertBefore(n, nextSibling);
			},
			removeChild: (n: Node) => {
				// console.log(
				// 	'createRootFragment removeChild() ',
				// 	(n as Element).tagName,
				// 	(n as Element).id,
				// 	((nextSibling || {}) as Element).nodeType,
				// 	((nextSibling || {}) as Element).tagName,
				// 	((nextSibling || {}) as Element).id,
				// 	(replaceNode as Element).tagName,
				// 	(replaceNode as Element).id,
				// );
				parent.removeChild(n);
			},
		};
	}
	// else {
	// 	console.log('createRootFragment parent_.__k (?! PARENT ALREADY HYDRATED)');
	// }
	return parent_.__k as unknown as Element;
};

// import { hydrate } from 'preact';
// function App() {
//   return <>
//     <h1>Example</h1>
//     <p>Hello world!</p>
//   </>;
// }
// render() or hydrate() the last two children elements of body:
// const children = [].slice.call(document.body.children, -2);
// hydrate(<App />, createRootFragment(document.body, children));
//
// pre-rendered index.html:
// <html>
// <head>
// ...
// </head>
// <body>
//     <p>untouched</p>
//     <h1>Example</h1>
//     <p>Hello world!</p>
// </body>
// </html>
//
// Or, render() multiple times:
// render(<A />, createRootFragment(sidebar, widgetA));
// render(<B />, createRootFragment(sidebar, widgetB));
// render(<C />, createRootFragment(sidebar, widgetC));
// ... into index.html:
// <div id="sidebar">
//   <section id="widgetA"><h1>Widget A</h1></section>
//   <section id="widgetB"><h1>Widget B</h1></section>
//   <section id="widgetC"><h1>Widget C</h1></section>
// </div>
