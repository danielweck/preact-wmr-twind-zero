var e,t,n,r,o,l,i,_={},s=[],u=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a(e,t){for(var n in t)e[n]=t[n];return e}function c(e){var t=e.parentNode;t&&t.removeChild(e)}function h(t,n,r){var o,l,i,_={};for(i in n)"key"==i?o=n[i]:"ref"==i?l=n[i]:_[i]=n[i];if(arguments.length>2&&(_.children=arguments.length>3?e.call(arguments,2):r),"function"==typeof t&&null!=t.defaultProps)for(i in t.defaultProps)void 0===_[i]&&(_[i]=t.defaultProps[i]);return p(t,_,o,l,null)}function p(e,r,o,l,i){var _={type:e,props:r,key:o,ref:l,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==i?++n:i};return null==i&&null!=t.vnode&&t.vnode(_),_}function d(e){return e.children}function f(e,t){this.props=e,this.context=t}function m(e,t){if(null==t)return e.__?m(e.__,e.__.__k.indexOf(e)+1):null;for(var n;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e)return n.__e;return"function"==typeof e.type?m(e):null}function y(e){var t,n;if(null!=(e=e.__)&&null!=e.__c){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e){e.__e=e.__c.base=n.__e;break}return y(e)}}function v(e){(!e.__d&&(e.__d=!0)&&r.push(e)&&!g.__r++||l!==t.debounceRendering)&&((l=t.debounceRendering)||o)(g)}function g(){for(var e;g.__r=r.length;)e=r.sort((function(e,t){return e.__v.__b-t.__v.__b})),r=[],e.some((function(e){var t,n,r,o,l,i;e.__d&&(l=(o=(t=e).__v).__e,(i=t.__P)&&(n=[],(r=a({},o)).__v=o.__v+1,R(i,o,r,t.__n,void 0!==i.ownerSVGElement,null!=o.__h?[l]:null,n,null==l?m(o):l,o.__h),S(n,o),o.__e!=l&&y(o)))}))}function b(e,t,n,r,o,l,i,u,a,c){var h,f,y,v,g,b,w,$=r&&r.__k||s,E=$.length;for(n.__k=[],h=0;h<t.length;h++)if(null!=(v=n.__k[h]=null==(v=t[h])||"boolean"==typeof v?null:"string"==typeof v||"number"==typeof v||"bigint"==typeof v?p(null,v,null,null,v):Array.isArray(v)?p(d,{children:v},null,null,null):v.__b>0?p(v.type,v.props,v.key,null,v.__v):v)){if(v.__=n,v.__b=n.__b+1,null===(y=$[h])||y&&v.key==y.key&&v.type===y.type)$[h]=void 0;else for(f=0;f<E;f++){if((y=$[f])&&v.key==y.key&&v.type===y.type){$[f]=void 0;break}y=null}R(e,v,y=y||_,o,l,i,u,a,c),g=v.__e,(f=v.ref)&&y.ref!=f&&(w||(w=[]),y.ref&&w.push(y.ref,null,v),w.push(f,v.__c||g,v)),null!=g?(null==b&&(b=g),"function"==typeof v.type&&v.__k===y.__k?v.__d=a=k(v,a,e):a=x(e,v,y,$,g,a),"function"==typeof n.type&&(n.__d=a)):a&&y.__e==a&&a.parentNode!=e&&(a=m(y))}for(n.__e=b,h=E;h--;)null!=$[h]&&("function"==typeof n.type&&null!=$[h].__e&&$[h].__e==n.__d&&(n.__d=m(r,h+1)),A($[h],$[h]));if(w)for(h=0;h<w.length;h++)L(w[h],w[++h],w[++h])}function k(e,t,n){for(var r,o=e.__k,l=0;o&&l<o.length;l++)(r=o[l])&&(r.__=e,t="function"==typeof r.type?k(r,t,n):x(n,r,r,o,r.__e,t));return t}function w(e,t){return t=t||[],null==e||"boolean"==typeof e||(Array.isArray(e)?e.some((function(e){w(e,t)})):t.push(e)),t}function x(e,t,n,r,o,l){var i,_,s;if(void 0!==t.__d)i=t.__d,t.__d=void 0;else if(null==n||o!=l||null==o.parentNode)e:if(null==l||l.parentNode!==e)e.appendChild(o),i=null;else{for(_=l,s=0;(_=_.nextSibling)&&s<r.length;s+=2)if(_==o)break e;e.insertBefore(o,l),i=l}return void 0!==i?i:o.nextSibling}function $(e,t,n){"-"===t[0]?e.setProperty(t,n):e[t]=null==n?"":"number"!=typeof n||u.test(t)?n:n+"px"}function E(e,t,n,r,o){var l;e:if("style"===t)if("string"==typeof n)e.style.cssText=n;else{if("string"==typeof r&&(e.style.cssText=r=""),r)for(t in r)n&&t in n||$(e.style,t,"");if(n)for(t in n)r&&n[t]===r[t]||$(e.style,t,n[t])}else if("o"===t[0]&&"n"===t[1])l=t!==(t=t.replace(/Capture$/,"")),t=t.toLowerCase()in e?t.toLowerCase().slice(2):t.slice(2),e.l||(e.l={}),e.l[t+l]=n,n?r||e.addEventListener(t,l?T:C,l):e.removeEventListener(t,l?T:C,l);else if("dangerouslySetInnerHTML"!==t){if(o)t=t.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==t&&"list"!==t&&"form"!==t&&"tabIndex"!==t&&"download"!==t&&t in e)try{e[t]=null==n?"":n;break e}catch(e){}"function"==typeof n||(null!=n&&(!1!==n||"a"===t[0]&&"r"===t[1])?e.setAttribute(t,n):e.removeAttribute(t))}}function C(e){this.l[e.type+!1](t.event?t.event(e):e)}function T(e){this.l[e.type+!0](t.event?t.event(e):e)}function R(n,r,o,l,i,s,u,h,p){var y,v,g,k,w,x,$,C,T,R,S,L=r.type;if(void 0!==r.constructor)return null;null!=o.__h&&(p=o.__h,h=r.__e=o.__e,r.__h=null,s=[h]),(y=t.__b)&&y(r);try{e:if("function"==typeof L){if(C=r.props,T=(y=L.contextType)&&l[y.__c],R=y?T?T.props.value:y.__:l,o.__c?$=(v=r.__c=o.__c).__=v.__E:("prototype"in L&&L.prototype.render?r.__c=v=new L(C,R):(r.__c=v=new f(C,R),v.constructor=L,v.render=P),T&&T.sub(v),v.props=C,v.state||(v.state={}),v.context=R,v.__n=l,g=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=L.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=a({},v.__s)),a(v.__s,L.getDerivedStateFromProps(C,v.__s))),k=v.props,w=v.state,g)null==L.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else{if(null==L.getDerivedStateFromProps&&C!==k&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(C,R),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(C,v.__s,R)||r.__v===o.__v){v.props=C,v.state=v.__s,r.__v!==o.__v&&(v.__d=!1),v.__v=r,r.__e=o.__e,r.__k=o.__k,r.__k.forEach((function(e){e&&(e.__=r)})),v.__h.length&&u.push(v);break e}null!=v.componentWillUpdate&&v.componentWillUpdate(C,v.__s,R),null!=v.componentDidUpdate&&v.__h.push((function(){v.componentDidUpdate(k,w,x)}))}v.context=R,v.props=C,v.state=v.__s,(y=t.__r)&&y(r),v.__d=!1,v.__v=r,v.__P=n,y=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(l=a(a({},l),v.getChildContext())),g||null==v.getSnapshotBeforeUpdate||(x=v.getSnapshotBeforeUpdate(k,w)),S=null!=y&&y.type===d&&null==y.key?y.props.children:y,b(n,Array.isArray(S)?S:[S],r,o,l,i,s,u,h,p),v.base=r.__e,r.__h=null,v.__h.length&&u.push(v),$&&(v.__E=v.__=null),v.__e=!1}else null==s&&r.__v===o.__v?(r.__k=o.__k,r.__e=o.__e):r.__e=function(t,n,r,o,l,i,s,u){var a,h,p,d=r.props,f=n.props,y=n.type,v=0;if("svg"===y&&(l=!0),null!=i)for(;v<i.length;v++)if((a=i[v])&&"setAttribute"in a==!!y&&(y?a.localName===y:3===a.nodeType)){t=a,i[v]=null;break}if(null==t){if(null===y)return document.createTextNode(f);t=l?document.createElementNS("http://www.w3.org/2000/svg",y):document.createElement(y,f.is&&f),i=null,u=!1}if(null===y)d===f||u&&t.data===f||(t.data=f);else{if(i=i&&e.call(t.childNodes),h=(d=r.props||_).dangerouslySetInnerHTML,p=f.dangerouslySetInnerHTML,!u){if(null!=i)for(d={},v=0;v<t.attributes.length;v++)d[t.attributes[v].name]=t.attributes[v].value;(p||h)&&(p&&(h&&p.__html==h.__html||p.__html===t.innerHTML)||(t.innerHTML=p&&p.__html||""))}if(function(e,t,n,r,o){var l;for(l in n)"children"===l||"key"===l||l in t||E(e,l,null,n[l],r);for(l in t)o&&"function"!=typeof t[l]||"children"===l||"key"===l||"value"===l||"checked"===l||n[l]===t[l]||E(e,l,t[l],n[l],r)}(t,f,d,l,u),p)n.__k=[];else if(v=n.props.children,b(t,Array.isArray(v)?v:[v],n,r,o,l&&"foreignObject"!==y,i,s,i?i[0]:r.__k&&m(r,0),u),null!=i)for(v=i.length;v--;)null!=i[v]&&c(i[v]);u||("value"in f&&void 0!==(v=f.value)&&(v!==d.value||v!==t.value||"progress"===y&&!v)&&E(t,"value",v,d.value,!1),"checked"in f&&void 0!==(v=f.checked)&&v!==t.checked&&E(t,"checked",v,d.checked,!1))}return t}(o.__e,r,o,l,i,s,u,p);(y=t.diffed)&&y(r)}catch(n){r.__v=null,(p||null!=s)&&(r.__e=h,r.__h=!!p,s[s.indexOf(h)]=null),t.__e(n,r,o)}}function S(e,n){t.__c&&t.__c(n,e),e.some((function(n){try{e=n.__h,n.__h=[],e.some((function(e){e.call(n)}))}catch(e){t.__e(e,n.__v)}}))}function L(e,n,r){try{"function"==typeof e?e(n):e.current=n}catch(e){t.__e(e,r)}}function A(e,n,r){var o,l;if(t.unmount&&t.unmount(e),(o=e.ref)&&(o.current&&o.current!==e.__e||L(o,null,n)),null!=(o=e.__c)){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(e){t.__e(e,n)}o.base=o.__P=null}if(o=e.__k)for(l=0;l<o.length;l++)o[l]&&A(o[l],n,"function"!=typeof e.type);r||null==e.__e||c(e.__e),e.__e=e.__d=void 0}function P(e,t,n){return this.constructor(e,n)}function H(n,r,o){var l,i,s;t.__&&t.__(n,r),i=(l="function"==typeof o)?null:o&&o.__k||r.__k,s=[],R(r,n=(!l&&o||r).__k=h(d,null,[n]),i||_,_,void 0!==r.ownerSVGElement,!l&&o?[o]:i?null:r.firstChild?e.call(r.childNodes):null,s,!l&&o?o:i?i.__e:r.firstChild,l),S(s,n)}function N(e,t){H(e,t,N)}function U(t,n,r){var o,l,i,_=a({},t.props);for(i in n)"key"==i?o=n[i]:"ref"==i?l=n[i]:_[i]=n[i];return arguments.length>2&&(_.children=arguments.length>3?e.call(arguments,2):r),p(t.type,_,o||t.key,l||t.ref,null)}function D(e,t){var n={__c:t="__cC"+i++,__:e,Consumer:function(e,t){return e.children(t)},Provider:function(e){var n,r;return this.getChildContext||(n=[],(r={})[t]=this,this.getChildContext=function(){return r},this.shouldComponentUpdate=function(e){this.props.value!==e.value&&n.some(v)},this.sub=function(e){n.push(e);var t=e.componentWillUnmount;e.componentWillUnmount=function(){n.splice(n.indexOf(e),1),t&&t.call(e)}}),e.children}};return n.Provider.__=n.Consumer.contextType=n}e=s.slice,t={__e:function(e,t){for(var n,r,o;t=t.__;)if((n=t.__c)&&!n.__)try{if((r=n.constructor)&&null!=r.getDerivedStateFromError&&(n.setState(r.getDerivedStateFromError(e)),o=n.__d),null!=n.componentDidCatch&&(n.componentDidCatch(e),o=n.__d),o)return n.__E=n}catch(t){e=t}throw e}},n=0,f.prototype.setState=function(e,t){var n;n=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=a({},this.state),"function"==typeof e&&(e=e(a({},n),this.props)),e&&a(n,e),null!=e&&this.__v&&(t&&this.__h.push(t),v(this))},f.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),v(this))},f.prototype.render=d,r=[],o="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g.__r=0,i=0;var z=function(e,t,n,r){var o;t[0]=0;for(var l=1;l<t.length;l++){var i=t[l++],_=t[l]?(t[0]|=i?1:2,n[t[l++]]):t[++l];3===i?r[0]=_:4===i?r[1]=Object.assign(r[1]||{},_):5===i?(r[1]=r[1]||{})[t[++l]]=_:6===i?r[1][t[++l]]+=_+"":i?(o=e.apply(_,z(e,_,n,["",null])),r.push(o),_[0]?t[0]|=2:(t[l-2]=0,t[l]=o)):r.push(_)}return r},q=new Map;var I,B,O,F=function(e){var t=q.get(this);return t||(t=new Map,q.set(this,t)),(t=z(this,t.get(e)||(t.set(e,t=function(e){for(var t,n,r=1,o="",l="",i=[0],_=function(e){1===r&&(e||(o=o.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?i.push(0,e,o):3===r&&(e||o)?(i.push(3,e,o),r=2):2===r&&"..."===o&&e?i.push(4,e,0):2===r&&o&&!e?i.push(5,0,!0,o):r>=5&&((o||!e&&5===r)&&(i.push(r,0,o,n),r=6),e&&(i.push(r,e,0,n),r=6)),o=""},s=0;s<e.length;s++){s&&(1===r&&_(),_(s));for(var u=0;u<e[s].length;u++)t=e[s][u],1===r?"<"===t?(_(),i=[i],r=3):o+=t:4===r?"--"===o&&">"===t?(r=1,o=""):o=t+o[0]:l?t===l?l="":o+=t:'"'===t||"'"===t?l=t:">"===t?(_(),r=1):r&&("="===t?(r=5,n=o,o=""):"/"===t&&(r<5||">"===e[s][u+1])?(_(),3===r&&(i=i[0]),r=i,(i=i[0]).push(2,0,r),r=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(_(),r=2):o+=t),3===r&&"!--"===o&&(r=4,i=i[0])}return _(),i}(e)),t),arguments,[])).length>1?t:t[0]}.bind(h),K=0,W=[],M=t.__b,j=t.__r,Y=t.diffed,G=t.__c,V=t.unmount;function Z(e,n){t.__h&&t.__h(B,e,K||n),K=0;var r=B.__H||(B.__H={__:[],__h:[]});return e>=r.__.length&&r.__.push({}),r.__[e]}function J(e){return K=1,Q(se,e)}function Q(e,t,n){var r=Z(I++,2);return r.t=e,r.__c||(r.__=[n?n(t):se(void 0,t),function(e){var t=r.t(r.__[0],e);r.__[0]!==t&&(r.__=[t,r.__[1]],r.__c.setState({}))}],r.__c=B),r.__}function X(e,n){var r=Z(I++,4);!t.__s&&_e(r.__H,n)&&(r.__=e,r.__H=n,B.__h.push(r))}function ee(e){return K=5,te((function(){return{current:e}}),[])}function te(e,t){var n=Z(I++,7);return _e(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function ne(e){var t=B.context[e.__c],n=Z(I++,9);return n.c=e,t?(null==n.__&&(n.__=!0,t.sub(B)),t.props.value):e.__}function re(){for(var e;e=W.shift();)if(e.__P)try{e.__H.__h.forEach(le),e.__H.__h.forEach(ie),e.__H.__h=[]}catch(B){e.__H.__h=[],t.__e(B,e.__v)}}t.__b=function(e){B=null,M&&M(e)},t.__r=function(e){j&&j(e),I=0;var t=(B=e.__c).__H;t&&(t.__h.forEach(le),t.__h.forEach(ie),t.__h=[])},t.diffed=function(e){Y&&Y(e);var n=e.__c;n&&n.__H&&n.__H.__h.length&&(1!==W.push(n)&&O===t.requestAnimationFrame||((O=t.requestAnimationFrame)||function(e){var t,n=function(){clearTimeout(r),oe&&cancelAnimationFrame(t),setTimeout(e)},r=setTimeout(n,100);oe&&(t=requestAnimationFrame(n))})(re)),B=null},t.__c=function(e,n){n.some((function(e){try{e.__h.forEach(le),e.__h=e.__h.filter((function(e){return!e.__||ie(e)}))}catch(O){n.some((function(e){e.__h&&(e.__h=[])})),n=[],t.__e(O,e.__v)}})),G&&G(e,n)},t.unmount=function(e){V&&V(e);var n,r=e.__c;r&&r.__H&&(r.__H.__.forEach((function(e){try{le(e)}catch(e){n=e}})),n&&t.__e(n,r.__v))};var oe="function"==typeof requestAnimationFrame;function le(e){var t=B,n=e.__c;"function"==typeof n&&(e.__c=void 0,n()),B=t}function ie(e){var t=B;e.__c=e.__(),B=t}function _e(e,t){return!e||e.length!==t.length||t.some((function(t,n){return t!==e[n]}))}function se(e,t){return"function"==typeof t?t(e):t}let ue;function ae(e){let t,n;return r=>{const[,o]=J(0),l=ee(n);if(t||(t=e().then((e=>n=e&&e.default||e))),void 0!==n)return h(n,r);throw l.current||(l.current=t.then((()=>o(1)))),t}}const ce=t.__e;function he(e){return this.__c=pe,this.componentDidCatch=e.onError,e.children}function pe(e){e.then((()=>this.forceUpdate()))}let de;t.__e=(e,t,n)=>{if(e&&e.then){let r=t;for(;r=r.__;)if(r.__c&&r.__c.__c)return null==t.__e&&(t.__e=n.__e,t.__k=n.__k),t.__k||(t.__k=[]),r.__c.__c(e,t)}ce&&ce(e,t,n)};const fe=(e,t)=>{if(de=void 0,t&&"click"===t.type){if(t.ctrlKey||t.metaKey||t.altKey||t.shiftKey||0!==t.button)return e;const n=t.target.closest("a[href]");if(!n||n.origin!=location.origin||/^#/.test(n.getAttribute("href"))||!/^(_?self)?$/i.test(n.target))return e;de=!0,t.preventDefault(),t=n.href.replace(location.origin,"")}else"string"==typeof t?de=!0:t=location.pathname+location.search;return!0===de?history.pushState(null,"",t):!1===de&&history.replaceState(null,"",t),t};function me(e){const[t,n]=Q(fe,e.url||location.pathname+location.search),r=!0===de,o=te((()=>{const e=new URL(t,location.origin),o=e.pathname.replace(/(.)\/$/g,"$1");return{url:t,path:o,query:Object.fromEntries(e.searchParams),route:n,wasPush:r}}),[t]);return X((()=>(addEventListener("click",n),addEventListener("popstate",n),()=>{removeEventListener("click",n),removeEventListener("popstate",n)})),[]),h(me.ctx.Provider,{value:o},e.children)}const ye=Promise.resolve();function ve(e){const[t,n]=Q((e=>e+1),0),{url:r,query:o,wasPush:l,path:i}=we(),{rest:_=i,params:s={}}=ne(be),u=ee(!1),a=ee(i),c=ee(0),p=ee(),d=ee(),f=ee(),m=ee(!1),y=ee();y.current=!1,p.current=te((()=>{let t,n,r;return this.__v&&this.__v.__k&&this.__v.__k.reverse(),c.current++,d.current=p.current,w(e.children).some((e=>{if(((e,t,n)=>{e=e.split("/").filter(Boolean),t=(t||"").split("/").filter(Boolean);for(let r,o,l=0;l<Math.max(e.length,t.length);l++){let[,i,_,s]=(t[l]||"").match(/^(:?)(.*?)([+*?]?)$/);if(r=e[l],i||_!=r){if(!i&&r&&"*"==s){n.rest="/"+e.slice(l).map(decodeURIComponent).join("/");break}if(!i||!r&&"?"!=s&&"*"!=s)return;if(o="+"==s||"*"==s,o?r=e.slice(l).map(decodeURIComponent).join("/"):r&&(r=decodeURIComponent(r)),n.params[_]=r,_ in n||(n[_]=r),o)break}}return n})(_,e.props.path,r={path:_,query:o,params:s,rest:""}))return t=U(e,r);e.props.default&&(n=U(e,r))})),h(be.Provider,{value:r},t||n)}),[r]);const v=d.current;return d.current=null,this.__c=t=>{y.current=!0,d.current=v,e.onLoadStart&&e.onLoadStart(r),u.current=!0;let o=c.current;t.then((()=>{o===c.current&&(d.current=null,ye.then(n))}))},X((()=>{const t=this.__v&&this.__v.__e;y.current?m.current||f.current||(f.current=t):(!m.current&&f.current&&(f.current!==t&&f.current.remove(),f.current=null),m.current=!0,a.current!==i&&(l&&scrollTo(0,0),e.onLoadEnd&&u.current&&e.onLoadEnd(r),e.onRouteChange&&e.onRouteChange(r),u.current=!1,a.current=i))}),[i,l,t]),[h(ge,{r:p}),h(ge,{r:d})]}const ge=({r:e})=>e.current;ve.Provider=me,me.ctx=D({});const be=D({}),ke=e=>h(e.component,e),we=()=>ne(me.ctx);let xe=-1;const $e=e=>{-1===xe&&(xe=t.vnode);const n=xe;t.vnode=t=>{if(!t.type)return void(n&&n(t));const r=t.props,o=new Set;for(const n of["class","className"])if(n in r){const t=r[n];if(!t)continue;const l=e?e(t):t;"string"==typeof l&&o.add(l),r[n]=void 0}o.size&&(r.className=Array.from(o).join(" ").replace(/\s\s*/gm," ").trim()),n&&n(t)}},Ee=e=>F`<section><h2>Routed → 404 Not Found</h2><p class="bg-yellow-300 text-black text-3xl"> This text has a <strong>yellow-300</strong> background (unique to this paragraph, not shared with any other route or component) </p></section>`,Ce=e=>F`<section><h2>Routed → Home</h2><p class="bg-yellow-400 text-black non-twind-class-token text-3xl"> This text has a <strong>yellow-400</strong> background (unique to this paragraph, not shared with any other route or component) </p><div class="test-scope"><p> this is a paragraph <span class="child-span"> with a <span>child</span> span </span>  element. </p><h4>heading</h4></div></section>`,Te=e=>F`<section><h2>Routed → Non Lazy</h2><p class="bg-yellow-600 text-black text-3xl"> This text has a <strong>yellow-600</strong> background (unique to this paragraph, not shared with any other route or component) </p><p class="text-4xl"> This text has a <strong>text-4xl</strong> size (unique to this paragraph, not shared with any other route or component) </p></section>`,Re=!("undefined"==typeof window||!window.document||!window.document.createElement),Se="/preact-wmr-twind-zero/",Le=!Re||!!document.querySelector("script[type=isodata]"),Ae="KEYBOARD_INTERACT",Pe=ae((()=>new Promise((e=>{setTimeout((()=>{e(import("./chunks/island.e2fc7fb2.js"))}),Re?1e3:0)})))),He=e=>{const[t,n]=J(!1);return F`${t?F`<${he} onError=${e=>{console.log("ErrorBoundary onError (SuspendedLazy): ",e)}}><${Pe}/><//>`:F`<button class="p-2 m-2 border-2 rounded border-dotted border-purple-500" onClick=${()=>{n(!0)}}> CLICK HERE TO LAZY-LOAD </button><span>(1s simulated network delay on first load, then "cache" hit)</span>`}`},Ne=e=>F`<section><h2>Routed → Route</h2><p class=${"bg-yellow-700 \n        \n        text-black\n        \n        "} className="text-6xl"> This text has a <strong>yellow-700</strong> background (unique to this paragraph, not shared with any other route or component) </p><p class="~(!text-center,hover:underline,cursor-pointer,text-red-800,bg-green-50,hover:!bg-red-100,w-1/2,ml-11)"> This text has a unique custom Twind "shortcut" class based on the combination of the following utility styles: <strong>!text-center hover:underline cursor-pointer text-red-800 bg(green-50 !hover:red-100) w-1/2 ml-11</strong>. </p><${He}/></section>`,Ue=e=>Re&&Le?F`<div>${(Array.isArray(e.children)?e.children:[e.children]).filter((e=>null!=e)).map((e=>ze))}</div>`:F`<div>${e.children}</div>`,De={};const ze=h(class extends f{shouldComponentUpdate(){return!1}componentDidCatch(e){e===De&&(this.__d=!0)}render(){return h(qe,null,[])}},null,[]),qe=e=>{throw De},Ie=e=>F`<${he} onError=${e=>{console.log("ErrorBoundary onError (sub router): ",e)}}><${ve}>${[F`<${Pe} path=${"/lazy"+(Le?"/":"")}/>`]}<//><//>`,Be=ae((()=>new Promise((e=>{setTimeout((()=>{e(import("./chunks/lazy.a9922a81.js"))}),Re?1e3:0)})))),Oe=()=>{const[e,t]=J(!1);return F`<${me}><h1>Router status:</h1><p class="bg-pink-600 p-1.5 text-white text-3xl">${e?"SPA route (post-hydration)":"Initial route (static SSR / SSG)"}</p><h1>Router links:</h1><ul><li><span class="inline-block text-yellow-400 mr-1.5"> ███ </span><a href=${`${Se}?param=home#hash-home`}>Routed Home</a></li><li><span class="inline-block text-yellow-500 mr-1.5"> ███ </span><a href=${`${Se}routed-lazy${Le?"/":""}?param=lazy#hash-lazy`}>Routed Lazy</a> (1s simulated network delay on first load, then "cache" hit) </li><li><span class="inline-block text-yellow-600 mr-1.5"> ███ </span><a href=${`${Se}routed-non-lazy${Le?"/":""}?param=non-lazy#hash-non-lazy`}> Routed Non Lazy </a></li><li><span class="inline-block text-yellow-700 mr-1.5"> ███ </span><a href=${`${Se}routed-route${Le?"/":""}?param=route#hash-route`}>Routed Route</a>  (contains lazy component) </li></ul><h1>Router content:</h1><div class="border-solid border-4 border-pink-600 rounded"><${he} onError=${e=>{console.log("ErrorBoundary onError (top router): ",e)}}><${ve} onRouteChange=${()=>{t(!0)}}><${Ce} path=${`${Se}${Le?"/":""}`}/><${Be} path=${`${Se}routed-lazy${Le?"/":""}`}/><${Te} path=${`${Se}routed-non-lazy${Le?"/":""}`}/><${ke} component=${Ne} path=${`${Se}routed-route${Le?"/":""}`}/><${Ee} default/><${Ie} path=${`${Se}suspended/*`}/><//><//></div><h1>Twind critical/secondary stylesheet tests:</h1><p class="text-3xl"> This paragraphs and others located in different routes share the same <strong>text-3xl</strong> Twind style, but it isn't duplicated in the pre-rendered "secondary" stylesheet, it is hoisted in the "critical" styles. </p><p class="bg-yellow-200 text-black"> This text has a <strong>yellow-200</strong> background (unique to this paragraph, not shared with any other route or component) </p><h1>404 Not Found links:</h1><ul><li><span class="inline-block text-yellow-300 mr-1.5"> ███ </span><a href=${`${Se}not-found-blank`} rel="noreferrer noopener" target="_BLANK"> 404 (target BLANK) </a></li><li><span class="inline-block text-yellow-300 mr-1.5"> ███ </span><a href=${`${Se}not-found-inpage`} target="_top"> 404 (in page) </a></li></ul><${Ue}><p dir="rtl" class="is-rtl:font-bold is-rtl:text-6xl"> RTL (bold) </p><p><button onClick=${()=>{alert("BUTTON CLICKY")}}> CLICK HERE TO TEST "StaticSkipHydrate" </button><span class=${e?"text-red-600":"text-green-600"}>${e?"[onRouteChangeWasCalled] (this should never display)":"[!onRouteChangeWasCalled] (this should always display)"}</span></p><//><//>`};async function Fe(e){const{preactWmrPrerenderForTwind:t}=await import("./chunks/prerender.2b49ea56.js"),n=await t(e.url,F`<${Oe} ...${e}/>`,{props:e}),r=new Set([{type:"meta",props:{property:"og:title",content:"SEO title"}},{type:"style",props:{id:n.cssId,children:n.cssTextContent}},{type:"script",props:{type:"text/javascript",children:'if (!window.location.pathname.endsWith("/") && !/\\.html?/.test(window.location.pathname)) { window.location = window.location.origin + window.location.pathname + "/" + window.location.search + window.location.hash; }'}}]);return{html:n.html,links:n.links,data:{...e},head:{elements:r}}}Re&&(document.documentElement.addEventListener("mousedown",(e=>{document.documentElement.classList.remove("KEYBOARD_INTERACT")}),!0),document.addEventListener("keydown",(e=>{document.documentElement.classList.add("KEYBOARD_INTERACT")}),{once:!1,passive:!1,capture:!0}),document.addEventListener("keyup",(e=>{document.documentElement.classList.add("KEYBOARD_INTERACT")}),{once:!1,passive:!1,capture:!0}),Le&&($e(),function(e,t){if("undefined"==typeof window)return;let n=document.querySelector("script[type=isodata]");t=t||n&&n.parentNode||document.body,!ue&&n?N(e,t):H(e,t),ue=!0}(F`<${Oe}/>`,document.body)));export{Oe as App,U as B,Ae as K,d,$e as i,t as l,F as m,Fe as prerender,h as v};