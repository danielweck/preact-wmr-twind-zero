var t,e,n,r,o,l,_,i={},u=[],s=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function c(t,e){for(var n in e)t[n]=e[n];return t}function a(t){var e=t.parentNode;e&&e.removeChild(t)}function h(e,n,r){var o,l,_,i={};for(_ in n)"key"==_?o=n[_]:"ref"==_?l=n[_]:i[_]=n[_];if(arguments.length>2&&(i.children=arguments.length>3?t.call(arguments,2):r),"function"==typeof e&&null!=e.defaultProps)for(_ in e.defaultProps)void 0===i[_]&&(i[_]=e.defaultProps[_]);return p(e,i,o,l,null)}function p(t,r,o,l,_){var i={type:t,props:r,key:o,ref:l,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==_?++n:_};return null==_&&null!=e.vnode&&e.vnode(i),i}function d(t){return t.children}function f(t,e){this.props=t,this.context=e}function y(t,e){if(null==e)return t.__?y(t.__,t.__.__k.indexOf(t)+1):null;for(var n;e<t.__k.length;e++)if(null!=(n=t.__k[e])&&null!=n.__e)return n.__e;return"function"==typeof t.type?y(t):null}function m(t){var e,n;if(null!=(t=t.__)&&null!=t.__c){for(t.__e=t.__c.base=null,e=0;e<t.__k.length;e++)if(null!=(n=t.__k[e])&&null!=n.__e){t.__e=t.__c.base=n.__e;break}return m(t)}}function v(t){(!t.__d&&(t.__d=!0)&&r.push(t)&&!g.__r++||l!==e.debounceRendering)&&((l=e.debounceRendering)||o)(g)}function g(){for(var t;g.__r=r.length;)t=r.sort((function(t,e){return t.__v.__b-e.__v.__b})),r=[],t.some((function(t){var e,n,r,o,l,_;t.__d&&(l=(o=(e=t).__v).__e,(_=e.__P)&&(n=[],(r=c({},o)).__v=o.__v+1,S(_,o,r,e.__n,void 0!==_.ownerSVGElement,null!=o.__h?[l]:null,n,null==l?y(o):l,o.__h),C(n,o),o.__e!=l&&m(o)))}))}function w(t,e,n,r,o,l,_,s,c,a){var h,f,m,v,g,w,k,$=r&&r.__k||u,E=$.length;for(n.__k=[],h=0;h<e.length;h++)if(null!=(v=n.__k[h]=null==(v=e[h])||"boolean"==typeof v?null:"string"==typeof v||"number"==typeof v||"bigint"==typeof v?p(null,v,null,null,v):Array.isArray(v)?p(d,{children:v},null,null,null):v.__b>0?p(v.type,v.props,v.key,null,v.__v):v)){if(v.__=n,v.__b=n.__b+1,null===(m=$[h])||m&&v.key==m.key&&v.type===m.type)$[h]=void 0;else for(f=0;f<E;f++){if((m=$[f])&&v.key==m.key&&v.type===m.type){$[f]=void 0;break}m=null}S(t,v,m=m||i,o,l,_,s,c,a),g=v.__e,(f=v.ref)&&m.ref!=f&&(k||(k=[]),m.ref&&k.push(m.ref,null,v),k.push(f,v.__c||g,v)),null!=g?(null==w&&(w=g),"function"==typeof v.type&&v.__k===m.__k?v.__d=c=b(v,c,t):c=x(t,v,m,$,g,c),"function"==typeof n.type&&(n.__d=c)):c&&m.__e==c&&c.parentNode!=t&&(c=y(m))}for(n.__e=w,h=E;h--;)null!=$[h]&&("function"==typeof n.type&&null!=$[h].__e&&$[h].__e==n.__d&&(n.__d=y(r,h+1)),R($[h],$[h]));if(k)for(h=0;h<k.length;h++)L(k[h],k[++h],k[++h])}function b(t,e,n){for(var r,o=t.__k,l=0;o&&l<o.length;l++)(r=o[l])&&(r.__=t,e="function"==typeof r.type?b(r,e,n):x(n,r,r,o,r.__e,e));return e}function k(t,e){return e=e||[],null==t||"boolean"==typeof t||(Array.isArray(t)?t.some((function(t){k(t,e)})):e.push(t)),e}function x(t,e,n,r,o,l){var _,i,u;if(void 0!==e.__d)_=e.__d,e.__d=void 0;else if(null==n||o!=l||null==o.parentNode)t:if(null==l||l.parentNode!==t)t.appendChild(o),_=null;else{for(i=l,u=0;(i=i.nextSibling)&&u<r.length;u+=2)if(i==o)break t;t.insertBefore(o,l),_=l}return void 0!==_?_:o.nextSibling}function $(t,e,n){"-"===e[0]?t.setProperty(e,n):t[e]=null==n?"":"number"!=typeof n||s.test(e)?n:n+"px"}function E(t,e,n,r,o){var l;t:if("style"===e)if("string"==typeof n)t.style.cssText=n;else{if("string"==typeof r&&(t.style.cssText=r=""),r)for(e in r)n&&e in n||$(t.style,e,"");if(n)for(e in n)r&&n[e]===r[e]||$(t.style,e,n[e])}else if("o"===e[0]&&"n"===e[1])l=e!==(e=e.replace(/Capture$/,"")),e=e.toLowerCase()in t?e.toLowerCase().slice(2):e.slice(2),t.l||(t.l={}),t.l[e+l]=n,n?r||t.addEventListener(e,l?P:T,l):t.removeEventListener(e,l?P:T,l);else if("dangerouslySetInnerHTML"!==e){if(o)e=e.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==e&&"list"!==e&&"form"!==e&&"tabIndex"!==e&&"download"!==e&&e in t)try{t[e]=null==n?"":n;break t}catch(t){}"function"==typeof n||(null!=n&&(!1!==n||"a"===e[0]&&"r"===e[1])?t.setAttribute(e,n):t.removeAttribute(e))}}function T(t){this.l[t.type+!1](e.event?e.event(t):t)}function P(t){this.l[t.type+!0](e.event?e.event(t):t)}function S(n,r,o,l,_,u,s,h,p){var m,v,g,b,k,x,$,T,P,S,C,L=r.type;if(void 0!==r.constructor)return null;null!=o.__h&&(p=o.__h,h=r.__e=o.__e,r.__h=null,u=[h]),(m=e.__b)&&m(r);try{t:if("function"==typeof L){if(T=r.props,P=(m=L.contextType)&&l[m.__c],S=m?P?P.props.value:m.__:l,o.__c?$=(v=r.__c=o.__c).__=v.__E:("prototype"in L&&L.prototype.render?r.__c=v=new L(T,S):(r.__c=v=new f(T,S),v.constructor=L,v.render=H),P&&P.sub(v),v.props=T,v.state||(v.state={}),v.context=S,v.__n=l,g=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=L.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=c({},v.__s)),c(v.__s,L.getDerivedStateFromProps(T,v.__s))),b=v.props,k=v.state,g)null==L.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else{if(null==L.getDerivedStateFromProps&&T!==b&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(T,S),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(T,v.__s,S)||r.__v===o.__v){v.props=T,v.state=v.__s,r.__v!==o.__v&&(v.__d=!1),v.__v=r,r.__e=o.__e,r.__k=o.__k,r.__k.forEach((function(t){t&&(t.__=r)})),v.__h.length&&s.push(v);break t}null!=v.componentWillUpdate&&v.componentWillUpdate(T,v.__s,S),null!=v.componentDidUpdate&&v.__h.push((function(){v.componentDidUpdate(b,k,x)}))}v.context=S,v.props=T,v.state=v.__s,(m=e.__r)&&m(r),v.__d=!1,v.__v=r,v.__P=n,m=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(l=c(c({},l),v.getChildContext())),g||null==v.getSnapshotBeforeUpdate||(x=v.getSnapshotBeforeUpdate(b,k)),C=null!=m&&m.type===d&&null==m.key?m.props.children:m,w(n,Array.isArray(C)?C:[C],r,o,l,_,u,s,h,p),v.base=r.__e,r.__h=null,v.__h.length&&s.push(v),$&&(v.__E=v.__=null),v.__e=!1}else null==u&&r.__v===o.__v?(r.__k=o.__k,r.__e=o.__e):r.__e=function(e,n,r,o,l,_,u,s){var c,h,p,d=r.props,f=n.props,m=n.type,v=0;if("svg"===m&&(l=!0),null!=_)for(;v<_.length;v++)if((c=_[v])&&"setAttribute"in c==!!m&&(m?c.localName===m:3===c.nodeType)){e=c,_[v]=null;break}if(null==e){if(null===m)return document.createTextNode(f);e=l?document.createElementNS("http://www.w3.org/2000/svg",m):document.createElement(m,f.is&&f),_=null,s=!1}if(null===m)d===f||s&&e.data===f||(e.data=f);else{if(_=_&&t.call(e.childNodes),h=(d=r.props||i).dangerouslySetInnerHTML,p=f.dangerouslySetInnerHTML,!s){if(null!=_)for(d={},v=0;v<e.attributes.length;v++)d[e.attributes[v].name]=e.attributes[v].value;(p||h)&&(p&&(h&&p.__html==h.__html||p.__html===e.innerHTML)||(e.innerHTML=p&&p.__html||""))}if(function(t,e,n,r,o){var l;for(l in n)"children"===l||"key"===l||l in e||E(t,l,null,n[l],r);for(l in e)o&&"function"!=typeof e[l]||"children"===l||"key"===l||"value"===l||"checked"===l||n[l]===e[l]||E(t,l,e[l],n[l],r)}(e,f,d,l,s),p)n.__k=[];else if(v=n.props.children,w(e,Array.isArray(v)?v:[v],n,r,o,l&&"foreignObject"!==m,_,u,_?_[0]:r.__k&&y(r,0),s),null!=_)for(v=_.length;v--;)null!=_[v]&&a(_[v]);s||("value"in f&&void 0!==(v=f.value)&&(v!==d.value||v!==e.value||"progress"===m&&!v)&&E(e,"value",v,d.value,!1),"checked"in f&&void 0!==(v=f.checked)&&v!==e.checked&&E(e,"checked",v,d.checked,!1))}return e}(o.__e,r,o,l,_,u,s,p);(m=e.diffed)&&m(r)}catch(n){r.__v=null,(p||null!=u)&&(r.__e=h,r.__h=!!p,u[u.indexOf(h)]=null),e.__e(n,r,o)}}function C(t,n){e.__c&&e.__c(n,t),t.some((function(n){try{t=n.__h,n.__h=[],t.some((function(t){t.call(n)}))}catch(t){e.__e(t,n.__v)}}))}function L(t,n,r){try{"function"==typeof t?t(n):t.current=n}catch(t){e.__e(t,r)}}function R(t,n,r){var o,l;if(e.unmount&&e.unmount(t),(o=t.ref)&&(o.current&&o.current!==t.__e||L(o,null,n)),null!=(o=t.__c)){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(t){e.__e(t,n)}o.base=o.__P=null}if(o=t.__k)for(l=0;l<o.length;l++)o[l]&&R(o[l],n,"function"!=typeof t.type);r||null==t.__e||a(t.__e),t.__e=t.__d=void 0}function H(t,e,n){return this.constructor(t,n)}function A(n,r,o){var l,_,u;e.__&&e.__(n,r),_=(l="function"==typeof o)?null:o&&o.__k||r.__k,u=[],S(r,n=(!l&&o||r).__k=h(d,null,[n]),_||i,i,void 0!==r.ownerSVGElement,!l&&o?[o]:_?null:r.firstChild?t.call(r.childNodes):null,u,!l&&o?o:_?_.__e:r.firstChild,l),C(u,n)}function N(t,e){A(t,e,N)}function D(e,n,r){var o,l,_,i=c({},e.props);for(_ in n)"key"==_?o=n[_]:"ref"==_?l=n[_]:i[_]=n[_];return arguments.length>2&&(i.children=arguments.length>3?t.call(arguments,2):r),p(e.type,i,o||e.key,l||e.ref,null)}function U(t,e){var n={__c:e="__cC"+_++,__:t,Consumer:function(t,e){return t.children(e)},Provider:function(t){var n,r;return this.getChildContext||(n=[],(r={})[e]=this,this.getChildContext=function(){return r},this.shouldComponentUpdate=function(t){this.props.value!==t.value&&n.some(v)},this.sub=function(t){n.push(t);var e=t.componentWillUnmount;t.componentWillUnmount=function(){n.splice(n.indexOf(t),1),e&&e.call(t)}}),t.children}};return n.Provider.__=n.Consumer.contextType=n}t=u.slice,e={__e:function(t,e){for(var n,r,o;e=e.__;)if((n=e.__c)&&!n.__)try{if((r=n.constructor)&&null!=r.getDerivedStateFromError&&(n.setState(r.getDerivedStateFromError(t)),o=n.__d),null!=n.componentDidCatch&&(n.componentDidCatch(t),o=n.__d),o)return n.__E=n}catch(e){t=e}throw t}},n=0,f.prototype.setState=function(t,e){var n;n=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=c({},this.state),"function"==typeof t&&(t=t(c({},n),this.props)),t&&c(n,t),null!=t&&this.__v&&(e&&this.__h.push(e),v(this))},f.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),v(this))},f.prototype.render=d,r=[],o="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g.__r=0,_=0;var I=function(t,e,n,r){var o;e[0]=0;for(var l=1;l<e.length;l++){var _=e[l++],i=e[l]?(e[0]|=_?1:2,n[e[l++]]):e[++l];3===_?r[0]=i:4===_?r[1]=Object.assign(r[1]||{},i):5===_?(r[1]=r[1]||{})[e[++l]]=i:6===_?r[1][e[++l]]+=i+"":_?(o=t.apply(i,I(t,i,n,["",null])),r.push(o),i[0]?e[0]|=2:(e[l-2]=0,e[l]=o)):r.push(i)}return r},q=new Map;var z,M,F,W=function(t){var e=q.get(this);return e||(e=new Map,q.set(this,e)),(e=I(this,e.get(t)||(e.set(t,e=function(t){for(var e,n,r=1,o="",l="",_=[0],i=function(t){1===r&&(t||(o=o.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?_.push(0,t,o):3===r&&(t||o)?(_.push(3,t,o),r=2):2===r&&"..."===o&&t?_.push(4,t,0):2===r&&o&&!t?_.push(5,0,!0,o):r>=5&&((o||!t&&5===r)&&(_.push(r,0,o,n),r=6),t&&(_.push(r,t,0,n),r=6)),o=""},u=0;u<t.length;u++){u&&(1===r&&i(),i(u));for(var s=0;s<t[u].length;s++)e=t[u][s],1===r?"<"===e?(i(),_=[_],r=3):o+=e:4===r?"--"===o&&">"===e?(r=1,o=""):o=e+o[0]:l?e===l?l="":o+=e:'"'===e||"'"===e?l=e:">"===e?(i(),r=1):r&&("="===e?(r=5,n=o,o=""):"/"===e&&(r<5||">"===t[u][s+1])?(i(),3===r&&(_=_[0]),r=_,(_=_[0]).push(2,0,r),r=0):" "===e||"\t"===e||"\n"===e||"\r"===e?(i(),r=2):o+=e),3===r&&"!--"===o&&(r=4,_=_[0])}return i(),_}(t)),e),arguments,[])).length>1?e:e[0]}.bind(h),O=0,j=[],B=e.__b,V=e.__r,K=e.diffed,G=e.__c,Y=e.unmount;function Z(t,n){e.__h&&e.__h(M,t,O||n),O=0;var r=M.__H||(M.__H={__:[],__h:[]});return t>=r.__.length&&r.__.push({}),r.__[t]}function J(t){return O=1,Q(ut,t)}function Q(t,e,n){var r=Z(z++,2);return r.t=t,r.__c||(r.__=[n?n(e):ut(void 0,e),function(t){var e=r.t(r.__[0],t);r.__[0]!==e&&(r.__=[e,r.__[1]],r.__c.setState({}))}],r.__c=M),r.__}function X(t,n){var r=Z(z++,4);!e.__s&&it(r.__H,n)&&(r.__=t,r.__H=n,M.__h.push(r))}function tt(t){return O=5,et((function(){return{current:t}}),[])}function et(t,e){var n=Z(z++,7);return it(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function nt(t){var e=M.context[t.__c],n=Z(z++,9);return n.c=t,e?(null==n.__&&(n.__=!0,e.sub(M)),e.props.value):t.__}function rt(){var t;for(j.sort((function(t,e){return t.__v.__b-e.__v.__b}));t=j.pop();)if(t.__P)try{t.__H.__h.forEach(lt),t.__H.__h.forEach(_t),t.__H.__h=[]}catch(M){t.__H.__h=[],e.__e(M,t.__v)}}e.__b=function(t){M=null,B&&B(t)},e.__r=function(t){V&&V(t),z=0;var e=(M=t.__c).__H;e&&(e.__h.forEach(lt),e.__h.forEach(_t),e.__h=[])},e.diffed=function(t){K&&K(t);var n=t.__c;n&&n.__H&&n.__H.__h.length&&(1!==j.push(n)&&F===e.requestAnimationFrame||((F=e.requestAnimationFrame)||function(t){var e,n=function(){clearTimeout(r),ot&&cancelAnimationFrame(e),setTimeout(t)},r=setTimeout(n,100);ot&&(e=requestAnimationFrame(n))})(rt)),M=null},e.__c=function(t,n){n.some((function(t){try{t.__h.forEach(lt),t.__h=t.__h.filter((function(t){return!t.__||_t(t)}))}catch(F){n.some((function(t){t.__h&&(t.__h=[])})),n=[],e.__e(F,t.__v)}})),G&&G(t,n)},e.unmount=function(t){Y&&Y(t);var n,r=t.__c;r&&r.__H&&(r.__H.__.forEach((function(t){try{lt(t)}catch(t){n=t}})),n&&e.__e(n,r.__v))};var ot="function"==typeof requestAnimationFrame;function lt(t){var e=M,n=t.__c;"function"==typeof n&&(t.__c=void 0,n()),M=e}function _t(t){var e=M;t.__c=t.__(),M=e}function it(t,e){return!t||t.length!==e.length||e.some((function(e,n){return e!==t[n]}))}function ut(t,e){return"function"==typeof e?e(t):e}let st;function ct(t){let e,n;return r=>{const[,o]=J(0),l=tt(n);if(e||(e=t().then((t=>n=t&&t.default||t))),void 0!==n)return h(n,r);throw l.current||(l.current=e.then((()=>o(1)))),e}}const at=e.__e;function ht(t){return this.__c=pt,this.componentDidCatch=t.onError,t.children}function pt(t){t.then((()=>this.forceUpdate()))}let dt;e.__e=(t,e,n)=>{if(t&&t.then){let r=e;for(;r=r.__;)if(r.__c&&r.__c.__c)return null==e.__e&&(e.__e=n.__e,e.__k=n.__k),e.__k||(e.__k=[]),r.__c.__c(t,e)}at&&at(t,e,n)};const ft=(t,e)=>{if(dt=void 0,e&&"click"===e.type){if(e.ctrlKey||e.metaKey||e.altKey||e.shiftKey||0!==e.button)return t;const n=e.target.closest("a[href]");if(!n||n.origin!=location.origin||/^#/.test(n.getAttribute("href"))||!/^(_?self)?$/i.test(n.target))return t;dt=!0,e.preventDefault(),e=n.href.replace(location.origin,"")}else"string"==typeof e?dt=!0:e=location.pathname+location.search;return!0===dt?history.pushState(null,"",e):!1===dt&&history.replaceState(null,"",e),e};function yt(t){const[e,n]=Q(ft,t.url||location.pathname+location.search),r=!0===dt,o=et((()=>{const t=new URL(e,location.origin),o=t.pathname.replace(/(.)\/$/g,"$1");return{url:e,path:o,query:Object.fromEntries(t.searchParams),route:n,wasPush:r}}),[e]);return X((()=>(addEventListener("click",n),addEventListener("popstate",n),()=>{removeEventListener("click",n),removeEventListener("popstate",n)})),[]),h(yt.ctx.Provider,{value:o},t.children)}const mt=Promise.resolve();function vt(t){const[e,n]=Q((t=>t+1),0),{url:r,query:o,wasPush:l,path:_}=kt(),{rest:i=_,params:u={}}=nt(wt),s=tt(!1),c=tt(_),a=tt(0),p=tt(),d=tt(),f=tt(),y=tt(!1),m=tt();m.current=!1,p.current=et((()=>{let e,n,r;return this.__v&&this.__v.__k&&this.__v.__k.reverse(),a.current++,d.current=p.current,k(t.children).some((t=>{if(((t,e,n)=>{t=t.split("/").filter(Boolean),e=(e||"").split("/").filter(Boolean);for(let r,o,l=0;l<Math.max(t.length,e.length);l++){let[,_,i,u]=(e[l]||"").match(/^(:?)(.*?)([+*?]?)$/);if(r=t[l],_||i!=r){if(!_&&r&&"*"==u){n.rest="/"+t.slice(l).map(decodeURIComponent).join("/");break}if(!_||!r&&"?"!=u&&"*"!=u)return;if(o="+"==u||"*"==u,o?r=t.slice(l).map(decodeURIComponent).join("/"):r&&(r=decodeURIComponent(r)),n.params[i]=r,i in n||(n[i]=r),o)break}}return n})(i,t.props.path,r={path:i,query:o,params:u,rest:""}))return e=D(t,r);t.props.default&&(n=D(t,r))})),h(wt.Provider,{value:r},e||n)}),[r]);const v=d.current;return d.current=null,this.__c=e=>{m.current=!0,d.current=v,t.onLoadStart&&t.onLoadStart(r),s.current=!0;let o=a.current;e.then((()=>{o===a.current&&(d.current=null,mt.then(n))}))},X((()=>{const e=this.__v&&this.__v.__e;m.current?y.current||f.current||(f.current=e):(!y.current&&f.current&&(f.current!==e&&f.current.remove(),f.current=null),y.current=!0,c.current!==_&&(l&&scrollTo(0,0),t.onLoadEnd&&s.current&&t.onLoadEnd(r),t.onRouteChange&&t.onRouteChange(r),s.current=!1,c.current=_))}),[_,l,e]),[h(gt,{r:p}),h(gt,{r:d})]}const gt=({r:t})=>t.current;vt.Provider=yt,yt.ctx=U({});const wt=U({}),bt=t=>h(t.component,t),kt=()=>nt(yt.ctx),xt=!("undefined"==typeof window||!window.document||!window.document.createElement),$t="/preact-wmr-twind-zero/";let Et=-1;const Tt="WMR TWIND PREACT VNODE:\n",Pt=(t,n)=>{-1===Et&&(Et=e.vnode);const r=Et,o=e=>{if(t){if(xt)throw new Error(`${Tt}initPreactVDOMHook > isTwindPair/getTwindPairVal with IS_CLIENT_SIDE?!`);return e._||e.tw}if(!xt)throw new Error(`${Tt}initPreactVDOMHook > isTwindPair/getTwindPairVal with IS_CLIENT_SIDE?!`);return e.tw};e.vnode=e=>{if(!e.type)return void(r&&r(e));const l=e.props;if(l.className&&!l.class&&!l["data-tw"]&&!l.tw&&!l["data-tw-shortcut"]&&!l["tw-shortcut"])return void(r&&r(e));const _=new Set;for(const r of["data-tw","tw","class","className","data-tw-shortcut","tw-shortcut"])if(r in l){const e=l[r];if(!e)continue;const u="data-tw-shortcut"===r||"tw-shortcut"===r,s=!("object"!=typeof(i=e)||void 0===i._||void 0===i.tw);if(s){if(u&&!e.$)throw new Error(`${Tt}isTwindPair/getTwindPairVal but expecting generated with twindShortcut!`);if(!u&&e.$)throw new Error(`${Tt}isTwindPair/getTwindPairVal but not expecting generated with twindShortcut!`)}const c=s?o(e):e,a=u?n?n(c):c:t?t(c):c;"string"==typeof a&&_.add(a),l[r]=void 0}var i;_.size&&(l.className=Array.from(_).join(" ").replace(/\s\s*/gm," ").trim()),r&&r(e)}},St=t=>W`<section><h2>Routed → 404 Not Found</h2><p class=${{_:"bg-yellow-300 text-black text-3xl",tw:"text-black bg-yellow-300 text-3xl"}}> This text has a <strong>yellow-300</strong> background (unique to this paragraph, not shared with any other route or component) </p></section>`,Ct=t=>W`<section><h2>Routed → Home</h2><p class=${{_:"bg-yellow-400 text-black text-3xl",tw:"text-black bg-yellow-400 text-3xl"}}> This text has a <strong>yellow-400</strong> background (unique to this paragraph, not shared with any other route or component) </p><div class=${{_:"",tw:"test-scope"}}><p> this is a paragraph <span>with a child span</span> element. </p><h4>heading</h4></div></section>`,Lt=t=>W`<section><h2>Routed → Non Lazy</h2><p class=${{_:"bg-yellow-600 text-black text-3xl",tw:"text-black bg-yellow-600 text-3xl"}}> This text has a <strong>yellow-600</strong> background (unique to this paragraph, not shared with any other route or component) </p><p class=${{_:"",tw:"text-4xl"}}> This text has a <strong>text-4xl</strong> size (unique to this paragraph, not shared with any other route or component) </p></section>`,Rt=ct((()=>new Promise((t=>{setTimeout((()=>{t(import("./chunks/island.8db517bb.js"))}),xt?1e3:0)})))),Ht=t=>{const[e,n]=J(!1);return W`${e?W`<${ht} onError=${t=>{console.log("ErrorBoundary onError (SuspendedLazy): ",t)}}><${Rt}/><//>`:W`<button class=${{_:"p-2 m-2 border-2 rounded border-dotted border-purple-500",tw:"m-2 p-2 border-purple-500 border-2 border-dotted rounded"}} onClick=${()=>{n(!0)}}> CLICK HERE TO LAZY-LOAD </button><span>(1s simulated network delay on first load, then "cache" hit)</span>`}`},At=t=>W`<section><h2>Routed → Route</h2><p class=${{_:"bg-yellow-700 text-black text-3xl",tw:"text-black bg-yellow-700 text-3xl"}}> This text has a <strong>yellow-700</strong> background (unique to this paragraph, not shared with any other route or component) </p><p tw-shortcut=${{$:1,_:"!text-center hover:underline cursor-pointer text-red-800 bg( green-50 !hover:red-100 ) w-1/2 ml-11",tw:"w-1/2 ~(!text-center,hover:underline,cursor-pointer,text-red-800,bg-green-50,hover:!bg-red-100,w-1/2,ml-11)"}}> This text has a unique custom Twind "shortcut" class based on the combination of the following utility styles: <strong>!text-center hover:underline cursor-pointer text-red-800 bg(green-50 !hover:red-100) w-1/2 ml-11</strong>. </p><${Ht}/></section>`,Nt=t=>W`<${ht} onError=${t=>{console.log("ErrorBoundary onError (sub router): ",t)}}><${vt}>${[W`<${Rt} path=${"/lazy/"}/>`]}<//><//>`,Dt=ct((()=>new Promise((t=>{setTimeout((()=>{t(import("./chunks/lazy.97dd98e8.js"))}),xt?1e3:0)})))),Ut=()=>{const[t,e]=J(!1);return W`<${yt}><h1>Router status:</h1><p class=${{_:"bg-pink-600 p-1.5 text-white text-3xl",tw:"text-white p-1.5 bg-pink-600 text-3xl"}}>${t?"SPA route (post-hydration)":"Initial route (static SSR / SSG)"}</p><h1>Router links:</h1><ul><li><span class=${{_:"inline-block text-yellow-400 mr-1.5",tw:"text-yellow-400 inline-block mr-1.5"}}> ███ </span><a href=${`${$t}`}>Routed Home</a></li><li><span class=${{_:"inline-block text-yellow-500 mr-1.5",tw:"text-yellow-500 inline-block mr-1.5"}}> ███ </span><a href=${`${$t}routed-lazy/`}>Routed Lazy</a> (1s simulated network delay on first load, then "cache" hit) </li><li><span class=${{_:"inline-block text-yellow-600 mr-1.5",tw:"text-yellow-600 inline-block mr-1.5"}}> ███ </span><a href=${`${$t}routed-non-lazy/`}>Routed Non Lazy</a></li><li><span class=${{_:"inline-block text-yellow-700 mr-1.5",tw:"text-yellow-700 inline-block mr-1.5"}}> ███ </span><a href=${`${$t}routed-route/`}>Routed Route</a> (contains lazy component) </li></ul><h1>Router content:</h1><div class=${{_:"border-solid border-4 border-pink-600 rounded",tw:"border-pink-600 border-4 border-solid rounded"}}><${ht} onError=${t=>{console.log("ErrorBoundary onError (top router): ",t)}}><${vt} onRouteChange=${()=>{e(!0)}}><${Ct} path=${`${$t}`}/><${Dt} path=${`${$t}routed-lazy/`}/><${Lt} path=${`${$t}routed-non-lazy/`}/><${bt} component=${At} path=${`${$t}routed-route/`}/><${St} default/><${Nt} path=${`${$t}suspended/*`}/><//><//></div><h1>Twind critical/secondary stylesheet tests:</h1><p class=${{_:"",tw:"text-3xl"}}> This paragraphs and others located in different routes share the same <strong>text-3xl</strong> Twind style, but it isn't duplicated in the pre-rendered "secondary" stylesheet, it is hoisted in the "critical" styles. </p><p class=${{_:"bg-yellow-200 text-black",tw:"text-black bg-yellow-200"}}> This text has a <strong>yellow-200</strong> background (unique to this paragraph, not shared with any other route or component) </p><h1>404 Not Found links:</h1><ul><li><span class=${{_:"inline-block text-yellow-300 mr-1.5",tw:"text-yellow-300 inline-block mr-1.5"}}> ███ </span><a href=${`${$t}not-found-blank`} rel="noreferrer noopener" target="_BLANK"> 404 (target BLANK) </a></li><li><span class=${{_:"inline-block text-yellow-300 mr-1.5",tw:"text-yellow-300 inline-block mr-1.5"}}> ███ </span><a href=${`${$t}not-found-inpage`} target="_top"> 404 (in page) </a></li></ul><p dir="rtl" class=${{_:"is-rtl:font-bold is-rtl:text-6xl",tw:"is-rtl:text-6xl is-rtl:font-bold"}}> RTL (bold) </p><//>`};if(xt){!!document.querySelector("script[type=isodata]")&&(Pt(),function(t,e){if("undefined"==typeof window)return;let n=document.querySelector("script[type=isodata]");e=e||n&&n.parentNode||document.body,!st&&n?N(t,e):A(t,e),st=!0}(W`<${Ut}/>`,document.body))}async function It(t){const{preactWmrPrerenderForTwind:e}=await import("./chunks/prerender.71987984.js"),n=await e(t.url,W`<${Ut} ...${t}/>`,{props:t}),r=new Set([{type:"meta",props:{property:"og:title",content:"SEO title"}},{type:"style",props:{id:n.cssId,children:n.cssTextContent}}]);return{html:n.html,links:n.links,data:{...t},head:{elements:r}}}export{Ut as App,D as B,d,Pt as i,e as l,W as m,It as prerender,h as v};