var n$1,l$1,u$1,t$2,r$1,o$1,f$1,e$2={},c$1=[],s$1=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a$1(n,l){for(var u in l)n[u]=l[u];return n}function h$1(n){var l=n.parentNode;l&&l.removeChild(n);}function v$1(l,u,i){var t,r,o,f={};for(o in u)"key"==o?t=u[o]:"ref"==o?r=u[o]:f[o]=u[o];if(arguments.length>2&&(f.children=arguments.length>3?n$1.call(arguments,2):i),"function"==typeof l&&null!=l.defaultProps)for(o in l.defaultProps)void 0===f[o]&&(f[o]=l.defaultProps[o]);return y(l,f,t,r,null)}function y(n,i,t,r,o){var f={type:n,props:i,key:t,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==o?++u$1:o};return null==o&&null!=l$1.vnode&&l$1.vnode(f),f}function d$1(n){return n.children}function _(n,l){this.props=n,this.context=l;}function k$1(n,l){if(null==l)return n.__?k$1(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return "function"==typeof n.type?k$1(n):null}function b$1(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return b$1(n)}}function m$2(n){(!n.__d&&(n.__d=!0)&&t$2.push(n)&&!g$1.__r++||o$1!==l$1.debounceRendering)&&((o$1=l$1.debounceRendering)||r$1)(g$1);}function g$1(){for(var n;g$1.__r=t$2.length;)n=t$2.sort(function(n,l){return n.__v.__b-l.__v.__b}),t$2=[],n.some(function(n){var l,u,i,t,r,o;n.__d&&(r=(t=(l=n).__v).__e,(o=l.__P)&&(u=[],(i=a$1({},t)).__v=t.__v+1,j$1(o,t,i,l.__n,void 0!==o.ownerSVGElement,null!=t.__h?[r]:null,u,null==r?k$1(t):r,t.__h),z(u,t),t.__e!=r&&b$1(t)));});}function w$1(n,l,u,i,t,r,o,f,s,a){var h,v,p,_,b,m,g,w=i&&i.__k||c$1,A=w.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(_=u.__k[h]=null==(_=l[h])||"boolean"==typeof _?null:"string"==typeof _||"number"==typeof _||"bigint"==typeof _?y(null,_,null,null,_):Array.isArray(_)?y(d$1,{children:_},null,null,null):_.__b>0?y(_.type,_.props,_.key,null,_.__v):_)){if(_.__=u,_.__b=u.__b+1,null===(p=w[h])||p&&_.key==p.key&&_.type===p.type)w[h]=void 0;else for(v=0;v<A;v++){if((p=w[v])&&_.key==p.key&&_.type===p.type){w[v]=void 0;break}p=null;}j$1(n,_,p=p||e$2,t,r,o,f,s,a),b=_.__e,(v=_.ref)&&p.ref!=v&&(g||(g=[]),p.ref&&g.push(p.ref,null,_),g.push(v,_.__c||b,_)),null!=b?(null==m&&(m=b),"function"==typeof _.type&&_.__k===p.__k?_.__d=s=x$1(_,s,n):s=P(n,_,p,w,b,s),"function"==typeof u.type&&(u.__d=s)):s&&p.__e==s&&s.parentNode!=n&&(s=k$1(p));}for(u.__e=m,h=A;h--;)null!=w[h]&&("function"==typeof u.type&&null!=w[h].__e&&w[h].__e==u.__d&&(u.__d=k$1(i,h+1)),N(w[h],w[h]));if(g)for(h=0;h<g.length;h++)M(g[h],g[++h],g[++h]);}function x$1(n,l,u){for(var i,t=n.__k,r=0;t&&r<t.length;r++)(i=t[r])&&(i.__=n,l="function"==typeof i.type?x$1(i,l,u):P(u,i,i,t,i.__e,l));return l}function A(n,l){return l=l||[],null==n||"boolean"==typeof n||(Array.isArray(n)?n.some(function(n){A(n,l);}):l.push(n)),l}function P(n,l,u,i,t,r){var o,f,e;if(void 0!==l.__d)o=l.__d,l.__d=void 0;else if(null==u||t!=r||null==t.parentNode)n:if(null==r||r.parentNode!==n)n.appendChild(t),o=null;else {for(f=r,e=0;(f=f.nextSibling)&&e<i.length;e+=2)if(f==t)break n;n.insertBefore(t,r),o=r;}return void 0!==o?o:t.nextSibling}function C(n,l,u,i,t){var r;for(r in u)"children"===r||"key"===r||r in l||H(n,r,null,u[r],i);for(r in l)t&&"function"!=typeof l[r]||"children"===r||"key"===r||"value"===r||"checked"===r||u[r]===l[r]||H(n,r,l[r],u[r],i);}function $(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||s$1.test(l)?u:u+"px";}function H(n,l,u,i,t){var r;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else {if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||$(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||$(n.style,l,u[l]);}else if("o"===l[0]&&"n"===l[1])r=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+r]=u,u?i||n.addEventListener(l,r?T:I,r):n.removeEventListener(l,r?T:I,r);else if("dangerouslySetInnerHTML"!==l){if(t)l=l.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l));}}function I(n){this.l[n.type+!1](l$1.event?l$1.event(n):n);}function T(n){this.l[n.type+!0](l$1.event?l$1.event(n):n);}function j$1(n,u,i,t,r,o,f,e,c){var s,h,v,y,p,k,b,m,g,x,A,P=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(c=i.__h,e=u.__e=i.__e,u.__h=null,o=[e]),(s=l$1.__b)&&s(u);try{n:if("function"==typeof P){if(m=u.props,g=(s=P.contextType)&&t[s.__c],x=s?g?g.props.value:s.__:t,i.__c?b=(h=u.__c=i.__c).__=h.__E:("prototype"in P&&P.prototype.render?u.__c=h=new P(m,x):(u.__c=h=new _(m,x),h.constructor=P,h.render=O),g&&g.sub(h),h.props=m,h.state||(h.state={}),h.context=x,h.__n=t,v=h.__d=!0,h.__h=[]),null==h.__s&&(h.__s=h.state),null!=P.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=a$1({},h.__s)),a$1(h.__s,P.getDerivedStateFromProps(m,h.__s))),y=h.props,p=h.state,v)null==P.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else {if(null==P.getDerivedStateFromProps&&m!==y&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(m,x),!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(m,h.__s,x)||u.__v===i.__v){h.props=m,h.state=h.__s,u.__v!==i.__v&&(h.__d=!1),h.__v=u,u.__e=i.__e,u.__k=i.__k,u.__k.forEach(function(n){n&&(n.__=u);}),h.__h.length&&f.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(m,h.__s,x),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(y,p,k);});}h.context=x,h.props=m,h.state=h.__s,(s=l$1.__r)&&s(u),h.__d=!1,h.__v=u,h.__P=n,s=h.render(h.props,h.state,h.context),h.state=h.__s,null!=h.getChildContext&&(t=a$1(a$1({},t),h.getChildContext())),v||null==h.getSnapshotBeforeUpdate||(k=h.getSnapshotBeforeUpdate(y,p)),A=null!=s&&s.type===d$1&&null==s.key?s.props.children:s,w$1(n,Array.isArray(A)?A:[A],u,i,t,r,o,f,e,c),h.base=u.__e,u.__h=null,h.__h.length&&f.push(h),b&&(h.__E=h.__=null),h.__e=!1;}else null==o&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=L(i.__e,u,i,t,r,o,f,c);(s=l$1.diffed)&&s(u);}catch(n){u.__v=null,(c||null!=o)&&(u.__e=e,u.__h=!!c,o[o.indexOf(e)]=null),l$1.__e(n,u,i);}}function z(n,u){l$1.__c&&l$1.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u);});}catch(n){l$1.__e(n,u.__v);}});}function L(l,u,i,t,r,o,f,c){var s,a,v,y=i.props,p=u.props,d=u.type,_=0;if("svg"===d&&(r=!0),null!=o)for(;_<o.length;_++)if((s=o[_])&&"setAttribute"in s==!!d&&(d?s.localName===d:3===s.nodeType)){l=s,o[_]=null;break}if(null==l){if(null===d)return document.createTextNode(p);l=r?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,p.is&&p),o=null,c=!1;}if(null===d)y===p||c&&l.data===p||(l.data=p);else {if(o=o&&n$1.call(l.childNodes),a=(y=i.props||e$2).dangerouslySetInnerHTML,v=p.dangerouslySetInnerHTML,!c){if(null!=o)for(y={},_=0;_<l.attributes.length;_++)y[l.attributes[_].name]=l.attributes[_].value;(v||a)&&(v&&(a&&v.__html==a.__html||v.__html===l.innerHTML)||(l.innerHTML=v&&v.__html||""));}if(C(l,p,y,r,c),v)u.__k=[];else if(_=u.props.children,w$1(l,Array.isArray(_)?_:[_],u,i,t,r&&"foreignObject"!==d,o,f,o?o[0]:i.__k&&k$1(i,0),c),null!=o)for(_=o.length;_--;)null!=o[_]&&h$1(o[_]);c||("value"in p&&void 0!==(_=p.value)&&(_!==y.value||_!==l.value||"progress"===d&&!_)&&H(l,"value",_,y.value,!1),"checked"in p&&void 0!==(_=p.checked)&&_!==l.checked&&H(l,"checked",_,y.checked,!1));}return l}function M(n,u,i){try{"function"==typeof n?n(u):n.current=u;}catch(n){l$1.__e(n,i);}}function N(n,u,i){var t,r;if(l$1.unmount&&l$1.unmount(n),(t=n.ref)&&(t.current&&t.current!==n.__e||M(t,null,u)),null!=(t=n.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount();}catch(n){l$1.__e(n,u);}t.base=t.__P=null;}if(t=n.__k)for(r=0;r<t.length;r++)t[r]&&N(t[r],u,"function"!=typeof n.type);i||null==n.__e||h$1(n.__e),n.__e=n.__d=void 0;}function O(n,l,u){return this.constructor(n,u)}function S$1(u,i,t){var r,o,f;l$1.__&&l$1.__(u,i),o=(r="function"==typeof t)?null:t&&t.__k||i.__k,f=[],j$1(i,u=(!r&&t||i).__k=v$1(d$1,null,[u]),o||e$2,e$2,void 0!==i.ownerSVGElement,!r&&t?[t]:o?null:i.firstChild?n$1.call(i.childNodes):null,f,!r&&t?t:o?o.__e:i.firstChild,r),z(f,u);}function q(n,l){S$1(n,l,q);}function B(l,u,i){var t,r,o,f=a$1({},l.props);for(o in u)"key"==o?t=u[o]:"ref"==o?r=u[o]:f[o]=u[o];return arguments.length>2&&(f.children=arguments.length>3?n$1.call(arguments,2):i),y(l.type,f,t||l.key,r||l.ref,null)}function D(n,l){var u={__c:l="__cC"+f$1++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,i;return this.getChildContext||(u=[],(i={})[l]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(m$2);},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n);};}),n.children}};return u.Provider.__=u.Consumer.contextType=u}n$1=c$1.slice,l$1={__e:function(n,l){for(var u,i,t;l=l.__;)if((u=l.__c)&&!u.__)try{if((i=u.constructor)&&null!=i.getDerivedStateFromError&&(u.setState(i.getDerivedStateFromError(n)),t=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),t=u.__d),t)return u.__E=u}catch(l){n=l;}throw n}},u$1=0,_.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=a$1({},this.state),"function"==typeof n&&(n=n(a$1({},u),this.props)),n&&a$1(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),m$2(this));},_.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),m$2(this));},_.prototype.render=d$1,t$2=[],r$1="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g$1.__r=0,f$1=0;
var n=function(t,s,r,e){var u;s[0]=0;for(var h=1;h<s.length;h++){var p=s[h++],a=s[h]?(s[0]|=p?1:2,r[s[h++]]):s[++h];3===p?e[0]=a:4===p?e[1]=Object.assign(e[1]||{},a):5===p?(e[1]=e[1]||{})[s[++h]]=a:6===p?e[1][s[++h]]+=a+"":p?(u=t.apply(a,n(t,a,r,["",null])),e.push(u),a[0]?s[0]|=2:(s[h-2]=0,s[h]=u)):e.push(a);}return e},t$1=new Map;function e$1(s){var r=t$1.get(this);return r||(r=new Map,t$1.set(this,r)),(r=n(this,r.get(s)||(r.set(s,r=function(n){for(var t,s,r=1,e="",u="",h=[0],p=function(n){1===r&&(n||(e=e.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?h.push(0,n,e):3===r&&(n||e)?(h.push(3,n,e),r=2):2===r&&"..."===e&&n?h.push(4,n,0):2===r&&e&&!n?h.push(5,0,!0,e):r>=5&&((e||!n&&5===r)&&(h.push(r,0,e,s),r=6),n&&(h.push(r,n,0,s),r=6)),e="";},a=0;a<n.length;a++){a&&(1===r&&p(),p(a));for(var l=0;l<n[a].length;l++)t=n[a][l],1===r?"<"===t?(p(),h=[h],r=3):e+=t:4===r?"--"===e&&">"===t?(r=1,e=""):e=t+e[0]:u?t===u?u="":e+=t:'"'===t||"'"===t?u=t:">"===t?(p(),r=1):r&&("="===t?(r=5,s=e,e=""):"/"===t&&(r<5||">"===n[a][l+1])?(p(),3===r&&(h=h[0]),r=h,(h=h[0]).push(2,0,r),r=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(p(),r=2):e+=t),3===r&&"!--"===e&&(r=4,h=h[0]);}return p(),h}(s)),r),arguments,[])).length>1?r:r[0]}var m$1=e$1.bind(v$1);var t,u,r,o=0,i=[],c=l$1.__b,f=l$1.__r,e=l$1.diffed,a=l$1.__c,v=l$1.unmount;function m(t,r){l$1.__h&&l$1.__h(u,t,o||r),o=0;var i=u.__H||(u.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({}),i.__[t]}function l(n){return o=1,p(w,n)}function p(n,r,o){var i=m(t++,2);return i.t=n,i.__c||(i.__=[o?o(r):w(void 0,r),function(n){var t=i.t(i.__[0],n);i.__[0]!==t&&(i.__=[t,i.__[1]],i.__c.setState({}));}],i.__c=u),i.__}function h(r,o){var i=m(t++,4);!l$1.__s&&k(i.__H,o)&&(i.__=r,i.__H=o,u.__h.push(i));}function s(n){return o=5,d(function(){return {current:n}},[])}function d(n,u){var r=m(t++,7);return k(r.__H,u)&&(r.__=n(),r.__H=u,r.__h=n),r.__}function F(n){var r=u.context[n.__c],o=m(t++,9);return o.c=n,r?(null==o.__&&(o.__=!0,r.sub(u)),r.props.value):n.__}function x(){for(var t;t=i.shift();)if(t.__P)try{t.__H.__h.forEach(g),t.__H.__h.forEach(j),t.__H.__h=[];}catch(u){t.__H.__h=[],l$1.__e(u,t.__v);}}l$1.__b=function(n){u=null,c&&c(n);},l$1.__r=function(n){f&&f(n),t=0;var r=(u=n.__c).__H;r&&(r.__h.forEach(g),r.__h.forEach(j),r.__h=[]);},l$1.diffed=function(t){e&&e(t);var o=t.__c;o&&o.__H&&o.__H.__h.length&&(1!==i.push(o)&&r===l$1.requestAnimationFrame||((r=l$1.requestAnimationFrame)||function(n){var t,u=function(){clearTimeout(r),b&&cancelAnimationFrame(t),setTimeout(n);},r=setTimeout(u,100);b&&(t=requestAnimationFrame(u));})(x)),u=null;},l$1.__c=function(t,u){u.some(function(t){try{t.__h.forEach(g),t.__h=t.__h.filter(function(n){return !n.__||j(n)});}catch(r){u.some(function(n){n.__h&&(n.__h=[]);}),u=[],l$1.__e(r,t.__v);}}),a&&a(t,u);},l$1.unmount=function(t){v&&v(t);var u,r=t.__c;r&&r.__H&&(r.__H.__.forEach(function(n){try{g(n);}catch(n){u=n;}}),u&&l$1.__e(u,r.__v));};var b="function"==typeof requestAnimationFrame;function g(n){var t=u,r=n.__c;"function"==typeof r&&(n.__c=void 0,r()),u=t;}function j(n){var t=u;n.__c=n.__(),u=t;}function k(n,t){return !n||n.length!==t.length||t.some(function(t,u){return t!==n[u]})}function w(n,t){return "function"==typeof t?t(n):t}let initialized;

/** @type {typeof render} */
function hydrate(jsx, parent) {
	if (typeof window === 'undefined') return;
	let isodata = document.querySelector('script[type=isodata]');
	// @ts-ignore-next
	parent = parent || (isodata && isodata.parentNode) || document.body;
	if (!initialized && isodata) {
		q(jsx, parent);
	} else {
		S$1(jsx, parent);
	}
	initialized = true;
}function lazy(load) {
	let p, c;
	return props => {
		const [, update] = l(0);
		const r = s(c);
		if (!p) p = load().then(m => (c = (m && m.default) || m));
		if (c !== undefined) return v$1(c, props);
		if (!r.current) r.current = p.then(() => update(1));
		throw p;
	};
}

// See https://github.com/preactjs/preact/blob/88680e91ec0d5fc29d38554a3e122b10824636b6/compat/src/suspense.js#L5
const oldCatchError = l$1.__e;
l$1.__e = (err, newVNode, oldVNode) => {
	if (err && err.then) {
		let v = newVNode;
		while ((v = v.__)) {
			if (v.__c && v.__c.__c) {
				if (newVNode.__e == null) {
					newVNode.__e = oldVNode.__e; // ._dom
					newVNode.__k = oldVNode.__k; // ._children
				}
				if (!newVNode.__k) newVNode.__k = [];
				return v.__c.__c(err, newVNode);
			}
		}
	}
	if (oldCatchError) oldCatchError(err, newVNode, oldVNode);
};

function ErrorBoundary(props) {
	this.__c = childDidSuspend;
	this.componentDidCatch = props.onError;
	return props.children;
}

function childDidSuspend(err) {
	err.then(() => this.forceUpdate());
}let push;
const UPDATE = (state, url) => {
	push = undefined;
	if (url && url.type === 'click') {
		// ignore events the browser takes care of already:
		if (url.ctrlKey || url.metaKey || url.altKey || url.shiftKey || url.button !== 0) {
			return state;
		}

		const link = url.target.closest('a[href]');
		if (
			!link ||
			link.origin != location.origin ||
			/^#/.test(link.getAttribute('href')) ||
			!/^(_?self)?$/i.test(link.target)
		) {
			return state;
		}

		push = true;
		url.preventDefault();
		url = link.href.replace(location.origin, '');
	} else if (typeof url === 'string') {
		push = true;
	} else {
		url = location.pathname + location.search;
	}

	if (push === true) history.pushState(null, '', url);
	else if (push === false) history.replaceState(null, '', url);
	return url;
};

const exec = (url, route, matches) => {
	url = url.split('/').filter(Boolean);
	route = (route || '').split('/').filter(Boolean);
	for (let i = 0, val, rest; i < Math.max(url.length, route.length); i++) {
		let [, m, param, flag] = (route[i] || '').match(/^(:?)(.*?)([+*?]?)$/);
		val = url[i];
		// segment match:
		if (!m && param == val) continue;
		// /foo/* match
		if (!m && val && flag == '*') {
			matches.rest = '/' + url.slice(i).map(decodeURIComponent).join('/');
			break;
		}
		// segment mismatch / missing required field:
		if (!m || (!val && flag != '?' && flag != '*')) return;
		rest = flag == '+' || flag == '*';
		// rest (+/*) match:
		if (rest) val = url.slice(i).map(decodeURIComponent).join('/');
		// normal/optional field:
		else if (val) val = decodeURIComponent(val);
		matches.params[param] = val;
		if (!(param in matches)) matches[param] = val;
		if (rest) break;
	}
	return matches;
};

function LocationProvider(props) {
	const [url, route] = p(UPDATE, props.url || location.pathname + location.search);
	const wasPush = push === true;

	const value = d(() => {
		const u = new URL(url, location.origin);
		const path = u.pathname.replace(/(.)\/$/g, '$1');
		// @ts-ignore-next
		return { url, path, query: Object.fromEntries(u.searchParams), route, wasPush };
	}, [url]);

	h(() => {
		addEventListener('click', route);
		addEventListener('popstate', route);

		return () => {
			removeEventListener('click', route);
			removeEventListener('popstate', route);
		};
	}, []);

	// @ts-ignore
	return v$1(LocationProvider.ctx.Provider, { value }, props.children);
}

const RESOLVED = Promise.resolve();
function Router(props) {
	const [c, update] = p(c => c + 1, 0);

	const { url, query, wasPush, path } = useLocation();
	const { rest = path, params = {} } = F(RouteContext);

	const isLoading = s(false);
	const prevRoute = s(path);
	// Monotonic counter used to check if an un-suspending route is still the current route:
	const count = s(0);
	// The current route:
	const cur = s();
	// Previous route (if current route is suspended):
	const prev = s();
	// A not-yet-hydrated DOM root to remove once we commit:
	const pendingBase = s();
	// has this component ever successfully rendered without suspending:
	const hasEverCommitted = s(false);
	// was the most recent render successful (did not suspend):
	const didSuspend = s();
	didSuspend.current = false;

	cur.current = d(() => {
		// This hack prevents Preact from diffing when we swap `cur` to `prev`:
		if (this.__v && this.__v.__k) this.__v.__k.reverse();

		count.current++;

		prev.current = cur.current;

		let p, d, m;
		A(props.children).some(vnode => {
			const matches = exec(rest, vnode.props.path, (m = { path: rest, query, params, rest: '' }));
			if (matches) return (p = B(vnode, m));
			if (vnode.props.default) d = B(vnode, m);
		});

		return v$1(RouteContext.Provider, { value: m }, p || d);
	}, [url]);

	// Reset previous children - if rendering succeeds synchronously, we shouldn't render the previous children.
	const p$1 = prev.current;
	prev.current = null;

	// This borrows the _childDidSuspend() solution from compat.
	this.__c = e => {
		// Mark the current render as having suspended:
		didSuspend.current = true;

		// The new route suspended, so keep the previous route around while it loads:
		prev.current = p$1;

		// Fire an event saying we're waiting for the route:
		if (props.onLoadStart) props.onLoadStart(url);
		isLoading.current = true;

		// Re-render on unsuspend:
		let c = count.current;
		e.then(() => {
			// Ignore this update if it isn't the most recently suspended update:
			if (c !== count.current) return;

			// Successful route transition: un-suspend after a tick and stop rendering the old route:
			prev.current = null;
			RESOLVED.then(update);
		});
	};

	h(() => {
		const currentDom = this.__v && this.__v.__e;

		// Ignore suspended renders (failed commits):
		if (didSuspend.current) {
			// If we've never committed, mark any hydration DOM for removal on the next commit:
			if (!hasEverCommitted.current && !pendingBase.current) {
				pendingBase.current = currentDom;
			}
			return;
		}

		// If this is the first ever successful commit and we didn't use the hydration DOM, remove it:
		if (!hasEverCommitted.current && pendingBase.current) {
			if (pendingBase.current !== currentDom) pendingBase.current.remove();
			pendingBase.current = null;
		}

		// Mark the component has having committed:
		hasEverCommitted.current = true;

		// The route is loaded and rendered.
		if (prevRoute.current !== path) {
			if (wasPush) scrollTo(0, 0);
			if (props.onLoadEnd && isLoading.current) props.onLoadEnd(url);
			if (props.onRouteChange) props.onRouteChange(url);

			isLoading.current = false;
			prevRoute.current = path;
		}
	}, [path, wasPush, c]);

	// Note: curChildren MUST render first in order to set didSuspend & prev.
	return [v$1(RenderRef, { r: cur }), v$1(RenderRef, { r: prev })];
}

// Lazily render a ref's current value:
const RenderRef = ({ r }) => r.current;

Router.Provider = LocationProvider;

/** @typedef {{ url: string, path: string, query: object, route, wasPush: boolean }} RouteInfo */

LocationProvider.ctx = D(/** @type {RouteInfo} */ ({}));
const RouteContext = D({});

const Route = props => v$1(props.component, props);

const useLocation = () => F(LocationProvider.ctx);function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }


let _preactOptionsVNodeOriginal = -1;

const initPreactVDOMHook = (tw) => {
	if (_preactOptionsVNodeOriginal === -1) {
		// console.log(
		// 	'initPreactVDOMHook initPreactVDOMHook initPreactVDOMHook initPreactVDOMHook initPreactVDOMHook initPreactVDOMHook',
		// );
		_preactOptionsVNodeOriginal = l$1.vnode;
	}
	const preactOptionsVNodeOriginal = _preactOptionsVNodeOriginal ;

	const optionsVnodeCore = (vnode, _fromRenderFunc = false) => {
		const props = vnode.props || {};

		// if (props.className && !props.class) {
		// 	if (preactOptionsVNodeOriginal) {
		// 		preactOptionsVNodeOriginal(vnode);
		// 	}
		// 	return;
		// }

		// type T = typeof vnode.props;
		// const { children, class: clazz, className, ...rest } = props;
		// const props_: T = rest as T;
		// console.log(
		// 	fromRenderFunc,
		// 	`\x1b[31m${vnode.type}\x1b[0m`,
		// 	' ---> \n',
		// 	`CLASS: \x1b[36m${clazz ? clazz : ' '}\x1b[0m \n`,
		// 	`CLASSNAME: \x1b[36m${className ? className : ' '}\x1b[0m \n`,
		// 	`CHILD TEXT: \x1b[32m${typeof children === 'string' ? children : ' '}\x1b[0m \n`,
		// 	'PROPS: ',
		// 	JSON.stringify(props_, null, 4),
		// );

		const classes = new Set();

		for (const p of ['class', 'className'] ) {
			if (p in props) {
				const pp = props[p];
				if (!pp) {
					continue;
				}

				if (typeof pp !== 'string') {
					throw new Error(pp);
				}
				const c = tw ? tw(pp) : pp;

				// if (tw) {
				// 	console.log(`##### [[\x1b[36m${pp}\x1b[0m]] =======> [[\x1b[33m${c}\x1b[0m]]`);
				// }

				if (typeof c === 'string') {
					classes.add(c);
				}

				props[p] = undefined;
			}
		}

		if (classes.size) {
			// Removes line breaks and collapses whitespaces
			props.className = Array.from(classes).join(' ').replace(/\s\s*/gm, ' ').trim();
		}
	};
	const optionsVnodeFunc = (vnode) => {
		if (typeof vnode.type === 'string') {
			optionsVnodeCore(vnode, true);
		}
		if (_optionalChain([vnode, 'access', _ => _.props, 'optionalAccess', _2 => _2.children]) && Array.isArray(vnode.props.children)) {
			const children = vnode.props.children ;
			for (const v of children) {
				if (v) {
					optionsVnodeFunc(v);
				}
			}
		}
	};
	l$1.vnode = (vnode) => {
		if (!vnode.type || typeof vnode.type !== 'string') {
			if (typeof vnode.type === 'function') {
				optionsVnodeFunc(vnode);
			}
			// console.log(
			// 	`vnode.typevnode.typevnode.typevnode.typevnode.typevnode.typevnode.typevnode.type ${typeof vnode.type} => ${JSON.stringify(
			// 		vnode.props,
			// 		null,
			// 		4,
			// 	)}`,
			// );
			if (preactOptionsVNodeOriginal) {
				preactOptionsVNodeOriginal(vnode);
			}
			return;
		}

		optionsVnodeCore(vnode);

		if (preactOptionsVNodeOriginal) {
			preactOptionsVNodeOriginal(vnode);
		}
	};
};const Routed404 = (_props) => {
	return (
		m$1`<section><h2>Routed → 404 Not Found</h2><p class="bg-yellow-300 text-black text-3xl"> This text has a <strong>yellow-300</strong> background (unique to this paragraph, not shared with any other route or component) </p></section>`
	);
};const RoutedHome = (_props) => {
	return (
		m$1`<section><h2>Routed → Home</h2><p class="bg-yellow-400 text-black non-twind-class-token text-3xl"> This text has a <strong>yellow-400</strong> background (unique to this paragraph, not shared with any other route or component) </p><div class="test-scope"><p> this is a paragraph <span class="child-span"> with a <span>child</span> span </span>  element. </p><h4>heading</h4></div></section>`
	);
};const RoutedNonLazy = (_props) => {
	return (
		m$1`<section><h2>Routed → Non Lazy</h2><p class="bg-yellow-600 text-3xl"> This text has a <strong>yellow-600</strong> background (unique to this paragraph, not shared with any other route or component) </p><p class="text-4xl"> This text has a <strong>text-4xl</strong> size (unique to this paragraph, not shared with any other route or component) </p></section>`
	);
};const IS_CLIENT_SIDE = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

// export const PUBLIC_PATH_ORIGIN = process.env.WMR_PUBLIC_PATH_ORIGIN || '';
const PUBLIC_PATH_ROOT = "/preact-wmr-twind-zero/" ;

// client-side live dev server !== page prerendered via WMR 'build' mode
// note: includes IS_SERVER_SIDE
const IS_PRE_RENDERED = !IS_CLIENT_SIDE || !!document.querySelector('script[type=isodata]');

const KEYBOARD_INTERACT = 'KEYBOARD_INTERACT';// Code splitting
// export const SuspendedLazy = lazy(() => import('./island.js'));
const SuspendedLazy = lazy(
	() =>
		new Promise((resolve) => {
			setTimeout(
				() => {
					resolve(import('./chunks/island.5d965db9.js'));
				},
				IS_CLIENT_SIDE ? 1000 : 0,
			);
		}),
);const SuspendedLazyLoader = (_props) => {
	const [isLazyLoaded, setLazyLoaded] = l(false);

	return (
		m$1`${isLazyLoaded ? m$1`<${ErrorBoundary} onError=${err => {
  console.log('ErrorBoundary onError (SuspendedLazy): ', err);
}}><${SuspendedLazy}/><//>` : m$1`<button class="p-2 m-2 border-2 rounded border-dotted border-purple-500" onClick=${() => {
  setLazyLoaded(true);
}}> CLICK HERE TO LAZY-LOAD </button><span>(1s simulated network delay on first load, then "cache" hit)</span>`}`
	);
};
const RoutedRoute = (_props) => {
	// The following classes could be directly inlined in the 'class' / 'className' JSX properties
	// with or without the twindTw helper,
	// but here we demonstrate the twindTw tagged template literal function
	// for the benefits of autocompletion / VSCode intellisense,
	// and also noting that this will perform whitespace collapse + string trim,
	// resulting in cleaner smaller JSX hydration code
	// (this is automatically done for class/className props too, not just the twindTw / twindShortcut functions)
	const other = `
        
        text-black
        
        `;
	const paraClass = `bg-yellow-700 ${other}`;

	// note the dual class and className props on the HTML / JSX paragraph below (no difference, either can be used):
	return (
		m$1`<section><h2>Routed → Route</h2><p class=${paraClass} className="text-6xl"> This text has a <strong>yellow-700</strong> background (unique to this paragraph, not shared with any other route or component) </p><p class="~(!text-center,hover:underline,cursor-pointer,text-red-800,bg-green-50,hover:!bg-red-100,w-1/2,ml-11)"> This text has a unique custom Twind "shortcut" class based on the combination of the following utility styles: <strong>!text-center hover:underline cursor-pointer text-red-800 bg(green-50 !hover:red-100) w-1/2 ml-11</strong>. </p><${SuspendedLazyLoader}/></section>`
	);
};const StaticNoHydrate = (props) => {
	// note: IS_PRE_RENDERED includes IS_SERVER_SIDE,
	// so here we must ensure IS_CLIENT_SIDE
	if (IS_CLIENT_SIDE && IS_PRE_RENDERED) {
		// return (
		// 	<div>
		// 		{(Array.isArray(props.children) ? props.children : [props.children])
		// 			.filter((c) => typeof c !== 'undefined' && c !== null)
		// 			.map((_c) => NO_HYDRATE)}
		// 	</div>
		// );
		return NO_HYDRATE;
	}
	return (
		m$1`<div class="bg-pink-200 border-solid border-2 border-pink-800 rounded" data-static-no-hydrate>${props.children}</div>`
	);
};
const S = {};
class NoHydrate extends _ {
	shouldComponentUpdate() {
		return false;
	}
	componentDidCatch(e) {
		// mark the component as dirty to trigger suspend, but do not re-render:

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (e === S) (this ).__d = true;
	}
	render() {
		return v$1(Suspender, null, null);
	}
}
const NO_HYDRATE = v$1(NoHydrate, null, []);
const Suspender = (_props) => {
	throw S;
	// return null;
};const SuspendedStaticNoHydrate = lazy(() => import('./chunks/island.0d8e1b02.js'));const RoutedSuspendedSubRouter = (_props) => {
	return (
		m$1`<${ErrorBoundary} onError=${(err) => {
				console.log('ErrorBoundary onError (sub router): ', err);
			}}><${Router}><${SuspendedLazy} path=${`/lazy${IS_PRE_RENDERED ? '/' : ''}`}/><${SuspendedStaticNoHydrate} path=${`/static-no-hydrate${IS_PRE_RENDERED ? '/' : ''}`}/><//><//>`
	);
};const RoutedLazy = lazy(
	() =>
		new Promise((resolve) => {
			setTimeout(
				() => {
					resolve(import('./chunks/lazy.8d60b7c6.js'));
				},
				IS_CLIENT_SIDE ? 1000 : 0,
			);
		}),
);
const App = ({ prerenderIndex }) => {
	const [onRouteChangeWasCalled, setOnRouteChangeWasCalled] = l(false);
	return (
		m$1`<${LocationProvider}><${StaticNoHydrate}><p>prerenderIndex: ${prerenderIndex}</p><//><h1>Router status:</h1><p class="bg-pink-600 p-1.5 text-white text-3xl">${onRouteChangeWasCalled ? 'SPA route (post-hydration)' : 'Initial route (static SSR / SSG)'}</p><h1>Router links:</h1><ul><li><span class="inline-block text-yellow-400 mr-1.5"> ███ </span><a href=${`${PUBLIC_PATH_ROOT}?param=home#hash-home`}>Routed Home</a></li><li><span class="inline-block text-yellow-500 mr-1.5"> ███ </span><a href=${`${PUBLIC_PATH_ROOT}routed-lazy${IS_PRE_RENDERED ? '/' : ''}?param=lazy#hash-lazy`}>Routed Lazy</a> (1s simulated network delay on first load, then "cache" hit) </li><li><span class="inline-block text-yellow-600 mr-1.5"> ███ </span><a href=${`${PUBLIC_PATH_ROOT}routed-non-lazy${IS_PRE_RENDERED ? '/' : ''}?param=non-lazy#hash-non-lazy`}> Routed Non Lazy </a></li><li><span class="inline-block text-yellow-700 mr-1.5"> ███ </span><a href=${`${PUBLIC_PATH_ROOT}routed-route${IS_PRE_RENDERED ? '/' : ''}?param=route#hash-route`}>Routed Route</a>  (contains lazy component) </li></ul><h1>Router content:</h1><div class="border-solid border-4 border-pink-600 rounded"><${ErrorBoundary} onError=${(err) => {
						console.log('ErrorBoundary onError (top router): ', err);
					}}><${Router} onRouteChange=${() => {
							setOnRouteChangeWasCalled(true);
						}}><${RoutedHome} path=${`${PUBLIC_PATH_ROOT}`}/><${RoutedLazy} path=${`${PUBLIC_PATH_ROOT}routed-lazy${IS_PRE_RENDERED ? '/' : ''}`}/><${RoutedNonLazy} path=${`${PUBLIC_PATH_ROOT}routed-non-lazy${IS_PRE_RENDERED ? '/' : ''}`}/><${Route} component=${RoutedRoute} path=${`${PUBLIC_PATH_ROOT}routed-route${IS_PRE_RENDERED ? '/' : ''}`}/><${Routed404} default/><${RoutedSuspendedSubRouter} path=${`${PUBLIC_PATH_ROOT}suspended/*`}/><//><//></div><h1>Twind critical/secondary stylesheet tests:</h1><p class=${'text-3xl'}> This paragraphs and others located in different routes share the same <strong>text-3xl</strong> Twind style, but it isn't duplicated in the pre-rendered "secondary" stylesheet, it is hoisted in the "critical" styles. </p><p class="bg-yellow-200 text-black"> This text has a <strong>yellow-200</strong> background (unique to this paragraph, not shared with any other route or component) </p><h1>404 Not Found links:</h1><ul><li><span class="inline-block text-yellow-300 mr-1.5"> ███ </span><a href=${`${PUBLIC_PATH_ROOT}not-found-blank`} rel="noreferrer noopener" target="_BLANK"> 404 (target BLANK) </a></li><li><span class="inline-block text-yellow-300 mr-1.5"> ███ </span><a href=${`${PUBLIC_PATH_ROOT}not-found-inpage`} target="_top"> 404 (in page) </a></li></ul><${StaticNoHydrate}><p>STATIC NO HYDRATE (HTML/JSX component code below is not shipped to client, only pre-rendered :)</p><span class=${onRouteChangeWasCalled ? 'text-red-600' : 'text-green-600'}>${onRouteChangeWasCalled
						? '[onRouteChangeWasCalled] (this should never display (except in dev mode))'
						: '[!onRouteChangeWasCalled] (this should always display (except in dev mode))'}</span><//><${StaticNoHydrate}><${ErrorBoundary} onError=${(err) => {
						console.log('ErrorBoundary onError (SuspendedStaticNoHydrate): ', err);
					}}><${SuspendedStaticNoHydrate}/><//><//><//>`
	);
};
if (IS_CLIENT_SIDE) {
	document.documentElement.addEventListener(
		'mousedown',
		(_ev) => {
			document.documentElement.classList.remove(KEYBOARD_INTERACT);
		},
		true,
	);

	document.addEventListener(
		'keydown',
		(_ev) => {
			document.documentElement.classList.add(KEYBOARD_INTERACT);
		},
		{
			once: false,
			passive: false,
			capture: true,
		},
	);
	document.addEventListener(
		'keyup',
		(_ev) => {
			document.documentElement.classList.add(KEYBOARD_INTERACT);
		},
		{
			once: false,
			passive: false,
			capture: true,
		},
	);

	// note: IS_PRE_RENDERED includes IS_SERVER_SIDE,
	// but here we are inside a IS_CLIENT_SIDE conditional code branch
	if (IS_PRE_RENDERED) {
		initPreactVDOMHook();
		hydrate(m$1`<${App} prerenderIndex=${999}/>`, document.body);
	}
}
let _prerenderIndex = 0;
async function prerender(data)










 {
	// Must be dynamic import for code splitting and avoid include in client bundle
	const { preactWmrPrerenderForTwind } = await import('./chunks/prerender.d1db0067.js');
	// // TODO? trick Rollup into *not* transforming the `import()`
	// const $import = new Function('s', 'return import(s)');
	// const { preactWmrPrerenderForTwind } = await $import('file:///' + path.resolve(cwd, './prerender/prerender.js'));

	// console.log(`))) PRERENDER DATA: ${JSON.stringify(data, null, 4)}`);

	// TODO: data props?
	// <App {...data} />
	const res = await preactWmrPrerenderForTwind(data.url, m$1`<${App} prerenderIndex=${_prerenderIndex++}/>`, {
		props: data,
	});
	// const res = await preactWmrPrerenderForTwind(data.url, cloneElement(<App />, { prerenderIndex: _prerenderIndex++ }), {
	// 	props: data,
	// });
	// // const $App = new Function('$', 'return (p) => $.apply($, [p])');
	// const $App = new Function('$', 'return $');
	// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// // @ts-expect-error
	// const res = await preactWmrPrerenderForTwind(data.url, $App(App), {
	// 	maxDepth: 10,
	// 	props: { prerenderIndex: _prerenderIndex++, ...data },
	// });

	const elements = new Set([
		{ type: 'meta', props: { property: 'og:title', content: 'SEO title' }  },
		{ type: 'style', props: { id: res.cssId, children: res.cssTextContent } },
		{
			type: 'script',
			props: {
				type: 'text/javascript',
				children:
					'if (!window.location.pathname.endsWith("/") && !/\\.html?/.test(window.location.pathname)) { window.location = window.location.origin + window.location.pathname + "/" + window.location.search + window.location.hash; }',
			},
		},
	]);
	return {
		html: res.html,
		links: res.links,
		data: {
			// xxx: true, // ensures <script type="isodata" /> is generated so we can later check the DOM for its existence, but not needed here as 'data' includes ssr:true already
			...data,
		},
		head: {
			elements,
		},
	};
}export{App,B,KEYBOARD_INTERACT as K,d$1 as d,initPreactVDOMHook as i,l$1 as l,m$1 as m,prerender,v$1 as v};