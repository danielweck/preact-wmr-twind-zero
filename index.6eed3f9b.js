var e,t,n,o,r,l,i,s={},_=[],c=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function u(e,t){for(var n in t)e[n]=t[n];return e}function a(e){var t=e.parentNode;t&&t.removeChild(e)}function d(t,n,o){var r,l,i,s={};for(i in n)"key"==i?r=n[i]:"ref"==i?l=n[i]:s[i]=n[i];if(arguments.length>2&&(s.children=arguments.length>3?e.call(arguments,2):o),"function"==typeof t&&null!=t.defaultProps)for(i in t.defaultProps)void 0===s[i]&&(s[i]=t.defaultProps[i]);return p(t,s,r,l,null)}function p(e,o,r,l,i){var s={type:e,props:o,key:r,ref:l,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==i?++n:i};return null==i&&null!=t.vnode&&t.vnode(s),s}function h(e){return e.children}function f(e,t){this.props=e,this.context=t}function m(e,t){if(null==t)return e.__?m(e.__,e.__.__k.indexOf(e)+1):null;for(var n;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e)return n.__e;return"function"==typeof e.type?m(e):null}function y(e){var t,n;if(null!=(e=e.__)&&null!=e.__c){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e){e.__e=e.__c.base=n.__e;break}return y(e)}}function v(e){(!e.__d&&(e.__d=!0)&&o.push(e)&&!g.__r++||l!==t.debounceRendering)&&((l=t.debounceRendering)||r)(g)}function g(){for(var e;g.__r=o.length;)e=o.sort((function(e,t){return e.__v.__b-t.__v.__b})),o=[],e.some((function(e){var t,n,o,r,l,i;e.__d&&(l=(r=(t=e).__v).__e,(i=t.__P)&&(n=[],(o=u({},r)).__v=r.__v+1,A(i,r,o,t.__n,void 0!==i.ownerSVGElement,null!=r.__h?[l]:null,n,null==l?m(r):l,r.__h),S(n,r),r.__e!=l&&y(r)))}))}function b(e,t,n,o,r,l,i,c,u,a){var d,f,y,v,g,b,k,$=o&&o.__k||_,C=$.length;for(n.__k=[],d=0;d<t.length;d++)if(null!=(v=n.__k[d]=null==(v=t[d])||"boolean"==typeof v?null:"string"==typeof v||"number"==typeof v||"bigint"==typeof v?p(null,v,null,null,v):Array.isArray(v)?p(h,{children:v},null,null,null):v.__b>0?p(v.type,v.props,v.key,null,v.__v):v)){if(v.__=n,v.__b=n.__b+1,null===(y=$[d])||y&&v.key==y.key&&v.type===y.type)$[d]=void 0;else for(f=0;f<C;f++){if((y=$[f])&&v.key==y.key&&v.type===y.type){$[f]=void 0;break}y=null}A(e,v,y=y||s,r,l,i,c,u,a),g=v.__e,(f=v.ref)&&y.ref!=f&&(k||(k=[]),y.ref&&k.push(y.ref,null,v),k.push(f,v.__c||g,v)),null!=g?(null==b&&(b=g),"function"==typeof v.type&&v.__k===y.__k?v.__d=u=w(v,u,e):u=E(e,v,y,$,g,u),"function"==typeof n.type&&(n.__d=u)):u&&y.__e==u&&u.parentNode!=e&&(u=m(y))}for(n.__e=b,d=C;d--;)null!=$[d]&&("function"==typeof n.type&&null!=$[d].__e&&$[d].__e==n.__d&&(n.__d=m(o,d+1)),P($[d],$[d]));if(k)for(d=0;d<k.length;d++)R(k[d],k[++d],k[++d])}function w(e,t,n){for(var o,r=e.__k,l=0;r&&l<r.length;l++)(o=r[l])&&(o.__=e,t="function"==typeof o.type?w(o,t,n):E(n,o,o,r,o.__e,t));return t}function k(e,t){return t=t||[],null==e||"boolean"==typeof e||(Array.isArray(e)?e.some((function(e){k(e,t)})):t.push(e)),t}function E(e,t,n,o,r,l){var i,s,_;if(void 0!==t.__d)i=t.__d,t.__d=void 0;else if(null==n||r!=l||null==r.parentNode)e:if(null==l||l.parentNode!==e)e.appendChild(r),i=null;else{for(s=l,_=0;(s=s.nextSibling)&&_<o.length;_+=2)if(s==r)break e;e.insertBefore(r,l),i=l}return void 0!==i?i:r.nextSibling}function $(e,t,n){"-"===t[0]?e.setProperty(t,n):e[t]=null==n?"":"number"!=typeof n||c.test(t)?n:n+"px"}function C(e,t,n,o,r){var l;e:if("style"===t)if("string"==typeof n)e.style.cssText=n;else{if("string"==typeof o&&(e.style.cssText=o=""),o)for(t in o)n&&t in n||$(e.style,t,"");if(n)for(t in n)o&&n[t]===o[t]||$(e.style,t,n[t])}else if("o"===t[0]&&"n"===t[1])l=t!==(t=t.replace(/Capture$/,"")),t=t.toLowerCase()in e?t.toLowerCase().slice(2):t.slice(2),e.l||(e.l={}),e.l[t+l]=n,n?o||e.addEventListener(t,l?T:x,l):e.removeEventListener(t,l?T:x,l);else if("dangerouslySetInnerHTML"!==t){if(r)t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("href"!==t&&"list"!==t&&"form"!==t&&"tabIndex"!==t&&"download"!==t&&t in e)try{e[t]=null==n?"":n;break e}catch(e){}"function"==typeof n||(null!=n&&(!1!==n||"a"===t[0]&&"r"===t[1])?e.setAttribute(t,n):e.removeAttribute(t))}}function x(e){this.l[e.type+!1](t.event?t.event(e):e)}function T(e){this.l[e.type+!0](t.event?t.event(e):e)}function A(n,o,r,l,i,_,c,d,p){var y,v,g,w,k,E,$,x,T,A,S,R=o.type;if(void 0!==o.constructor)return null;null!=r.__h&&(p=r.__h,d=o.__e=r.__e,o.__h=null,_=[d]),(y=t.__b)&&y(o);try{e:if("function"==typeof R){if(x=o.props,T=(y=R.contextType)&&l[y.__c],A=y?T?T.props.value:y.__:l,r.__c?$=(v=o.__c=r.__c).__=v.__E:("prototype"in R&&R.prototype.render?o.__c=v=new R(x,A):(o.__c=v=new f(x,A),v.constructor=R,v.render=N),T&&T.sub(v),v.props=x,v.state||(v.state={}),v.context=A,v.__n=l,g=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=R.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=u({},v.__s)),u(v.__s,R.getDerivedStateFromProps(x,v.__s))),w=v.props,k=v.state,g)null==R.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else{if(null==R.getDerivedStateFromProps&&x!==w&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(x,A),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(x,v.__s,A)||o.__v===r.__v){v.props=x,v.state=v.__s,o.__v!==r.__v&&(v.__d=!1),v.__v=o,o.__e=r.__e,o.__k=r.__k,o.__k.forEach((function(e){e&&(e.__=o)})),v.__h.length&&c.push(v);break e}null!=v.componentWillUpdate&&v.componentWillUpdate(x,v.__s,A),null!=v.componentDidUpdate&&v.__h.push((function(){v.componentDidUpdate(w,k,E)}))}v.context=A,v.props=x,v.state=v.__s,(y=t.__r)&&y(o),v.__d=!1,v.__v=o,v.__P=n,y=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(l=u(u({},l),v.getChildContext())),g||null==v.getSnapshotBeforeUpdate||(E=v.getSnapshotBeforeUpdate(w,k)),S=null!=y&&y.type===h&&null==y.key?y.props.children:y,b(n,Array.isArray(S)?S:[S],o,r,l,i,_,c,d,p),v.base=o.__e,o.__h=null,v.__h.length&&c.push(v),$&&(v.__E=v.__=null),v.__e=!1}else null==_&&o.__v===r.__v?(o.__k=r.__k,o.__e=r.__e):o.__e=function(t,n,o,r,l,i,_,c){var u,d,p,h=o.props,f=n.props,y=n.type,v=0;if("svg"===y&&(l=!0),null!=i)for(;v<i.length;v++)if((u=i[v])&&"setAttribute"in u==!!y&&(y?u.localName===y:3===u.nodeType)){t=u,i[v]=null;break}if(null==t){if(null===y)return document.createTextNode(f);t=l?document.createElementNS("http://www.w3.org/2000/svg",y):document.createElement(y,f.is&&f),i=null,c=!1}if(null===y)h===f||c&&t.data===f||(t.data=f);else{if(i=i&&e.call(t.childNodes),d=(h=o.props||s).dangerouslySetInnerHTML,p=f.dangerouslySetInnerHTML,!c){if(null!=i)for(h={},v=0;v<t.attributes.length;v++)h[t.attributes[v].name]=t.attributes[v].value;(p||d)&&(p&&(d&&p.__html==d.__html||p.__html===t.innerHTML)||(t.innerHTML=p&&p.__html||""))}if(function(e,t,n,o,r){var l;for(l in n)"children"===l||"key"===l||l in t||C(e,l,null,n[l],o);for(l in t)r&&"function"!=typeof t[l]||"children"===l||"key"===l||"value"===l||"checked"===l||n[l]===t[l]||C(e,l,t[l],n[l],o)}(t,f,h,l,c),p)n.__k=[];else if(v=n.props.children,b(t,Array.isArray(v)?v:[v],n,o,r,l&&"foreignObject"!==y,i,_,i?i[0]:o.__k&&m(o,0),c),null!=i)for(v=i.length;v--;)null!=i[v]&&a(i[v]);c||("value"in f&&void 0!==(v=f.value)&&(v!==t.value||"progress"===y&&!v||"option"===y&&v!==h.value)&&C(t,"value",v,h.value,!1),"checked"in f&&void 0!==(v=f.checked)&&v!==t.checked&&C(t,"checked",v,h.checked,!1))}return t}(r.__e,o,r,l,i,_,c,p);(y=t.diffed)&&y(o)}catch(n){o.__v=null,(p||null!=_)&&(o.__e=d,o.__h=!!p,_[_.indexOf(d)]=null),t.__e(n,o,r)}}function S(e,n){t.__c&&t.__c(n,e),e.some((function(n){try{e=n.__h,n.__h=[],e.some((function(e){e.call(n)}))}catch(e){t.__e(e,n.__v)}}))}function R(e,n,o){try{"function"==typeof e?e(n):e.current=n}catch(e){t.__e(e,o)}}function P(e,n,o){var r,l;if(t.unmount&&t.unmount(e),(r=e.ref)&&(r.current&&r.current!==e.__e||R(r,null,n)),null!=(r=e.__c)){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(e){t.__e(e,n)}r.base=r.__P=null}if(r=e.__k)for(l=0;l<r.length;l++)r[l]&&P(r[l],n,"function"!=typeof e.type);o||null==e.__e||a(e.__e),e.__e=e.__d=void 0}function N(e,t,n){return this.constructor(e,n)}function H(n,o,r){var l,i,_;t.__&&t.__(n,o),i=(l="function"==typeof r)?null:r&&r.__k||o.__k,_=[],A(o,n=(!l&&r||o).__k=d(h,null,[n]),i||s,s,void 0!==o.ownerSVGElement,!l&&r?[r]:i?null:o.firstChild?e.call(o.childNodes):null,_,!l&&r?r:i?i.__e:o.firstChild,l),S(_,n)}function D(e,t){H(e,t,D)}function L(t,n,o){var r,l,i,s=u({},t.props);for(i in n)"key"==i?r=n[i]:"ref"==i?l=n[i]:s[i]=n[i];return arguments.length>2&&(s.children=arguments.length>3?e.call(arguments,2):o),p(t.type,s,r||t.key,l||t.ref,null)}function U(e,t){var n={__c:t="__cC"+i++,__:e,Consumer:function(e,t){return e.children(t)},Provider:function(e){var n,o;return this.getChildContext||(n=[],(o={})[t]=this,this.getChildContext=function(){return o},this.shouldComponentUpdate=function(e){this.props.value!==e.value&&n.some(v)},this.sub=function(e){n.push(e);var t=e.componentWillUnmount;e.componentWillUnmount=function(){n.splice(n.indexOf(e),1),t&&t.call(e)}}),e.children}};return n.Provider.__=n.Consumer.contextType=n}e=_.slice,t={__e:function(e,t,n,o){for(var r,l,i;t=t.__;)if((r=t.__c)&&!r.__)try{if((l=r.constructor)&&null!=l.getDerivedStateFromError&&(r.setState(l.getDerivedStateFromError(e)),i=r.__d),null!=r.componentDidCatch&&(r.componentDidCatch(e,o||{}),i=r.__d),i)return r.__E=r}catch(t){e=t}throw e}},n=0,f.prototype.setState=function(e,t){var n;n=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=u({},this.state),"function"==typeof e&&(e=e(u({},n),this.props)),e&&u(n,e),null!=e&&this.__v&&(t&&this.__h.push(t),v(this))},f.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),v(this))},f.prototype.render=h,o=[],r="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g.__r=0,i=0;var O=function(e,t,n,o){var r;t[0]=0;for(var l=1;l<t.length;l++){var i=t[l++],s=t[l]?(t[0]|=i?1:2,n[t[l++]]):t[++l];3===i?o[0]=s:4===i?o[1]=Object.assign(o[1]||{},s):5===i?(o[1]=o[1]||{})[t[++l]]=s:6===i?o[1][t[++l]]+=s+"":i?(r=e.apply(s,O(e,s,n,["",null])),o.push(r),s[0]?t[0]|=2:(t[l-2]=0,t[l]=r)):o.push(s)}return o},F=new Map;var I,W,z,M=function(e){var t=F.get(this);return t||(t=new Map,F.set(this,t)),(t=O(this,t.get(e)||(t.set(e,t=function(e){for(var t,n,o=1,r="",l="",i=[0],s=function(e){1===o&&(e||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?i.push(0,e,r):3===o&&(e||r)?(i.push(3,e,r),o=2):2===o&&"..."===r&&e?i.push(4,e,0):2===o&&r&&!e?i.push(5,0,!0,r):o>=5&&((r||!e&&5===o)&&(i.push(o,0,r,n),o=6),e&&(i.push(o,e,0,n),o=6)),r=""},_=0;_<e.length;_++){_&&(1===o&&s(),s(_));for(var c=0;c<e[_].length;c++)t=e[_][c],1===o?"<"===t?(s(),i=[i],o=3):r+=t:4===o?"--"===r&&">"===t?(o=1,r=""):r=t+r[0]:l?t===l?l="":r+=t:'"'===t||"'"===t?l=t:">"===t?(s(),o=1):o&&("="===t?(o=5,n=r,r=""):"/"===t&&(o<5||">"===e[_][c+1])?(s(),3===o&&(i=i[0]),o=i,(i=i[0]).push(2,0,o),o=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(s(),o=2):r+=t),3===o&&"!--"===r&&(o=4,i=i[0])}return s(),i}(e)),t),arguments,[])).length>1?t:t[0]}.bind(d),q=0,B=[],Y=t.__b,j=t.__r,K=t.diffed,V=t.__c,G=t.unmount;function J(e,n){t.__h&&t.__h(W,e,q||n),q=0;var o=W.__H||(W.__H={__:[],__h:[]});return e>=o.__.length&&o.__.push({}),o.__[e]}function X(e){return q=1,Z(ce,e)}function Z(e,t,n){var o=J(I++,2);return o.t=e,o.__c||(o.__=[n?n(t):ce(void 0,t),function(e){var t=o.t(o.__[0],e);o.__[0]!==t&&(o.__=[t,o.__[1]],o.__c.setState({}))}],o.__c=W),o.__}function Q(e,n){var o=J(I++,3);!t.__s&&_e(o.__H,n)&&(o.__=e,o.__H=n,W.__H.__h.push(o))}function ee(e,n){var o=J(I++,4);!t.__s&&_e(o.__H,n)&&(o.__=e,o.__H=n,W.__h.push(o))}function te(e){return q=5,ne((function(){return{current:e}}),[])}function ne(e,t){var n=J(I++,7);return _e(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function oe(e){var t=W.context[e.__c],n=J(I++,9);return n.c=e,t?(null==n.__&&(n.__=!0,t.sub(W)),t.props.value):e.__}function re(){for(var e;e=B.shift();)if(e.__P)try{e.__H.__h.forEach(ie),e.__H.__h.forEach(se),e.__H.__h=[]}catch(W){e.__H.__h=[],t.__e(W,e.__v)}}t.__b=function(e){W=null,Y&&Y(e)},t.__r=function(e){j&&j(e),I=0;var t=(W=e.__c).__H;t&&(t.__h.forEach(ie),t.__h.forEach(se),t.__h=[])},t.diffed=function(e){K&&K(e);var n=e.__c;n&&n.__H&&n.__H.__h.length&&(1!==B.push(n)&&z===t.requestAnimationFrame||((z=t.requestAnimationFrame)||function(e){var t,n=function(){clearTimeout(o),le&&cancelAnimationFrame(t),setTimeout(e)},o=setTimeout(n,100);le&&(t=requestAnimationFrame(n))})(re)),W=null},t.__c=function(e,n){n.some((function(e){try{e.__h.forEach(ie),e.__h=e.__h.filter((function(e){return!e.__||se(e)}))}catch(z){n.some((function(e){e.__h&&(e.__h=[])})),n=[],t.__e(z,e.__v)}})),V&&V(e,n)},t.unmount=function(e){G&&G(e);var n,o=e.__c;o&&o.__H&&(o.__H.__.forEach((function(e){try{ie(e)}catch(e){n=e}})),n&&t.__e(n,o.__v))};var le="function"==typeof requestAnimationFrame;function ie(e){var t=W,n=e.__c;"function"==typeof n&&(e.__c=void 0,n()),W=t}function se(e){var t=W;e.__c=e.__(),W=t}function _e(e,t){return!e||e.length!==t.length||t.some((function(t,n){return t!==e[n]}))}function ce(e,t){return"function"==typeof t?t(e):t}const ue=!("undefined"==typeof window||!window.document||!window.document.createElement);function ae(){const e={},t={},n=[];return{slots:e,owners:t,sub:(e,t)=>{const o=[e,t];return n.push(o),()=>{const e=n.indexOf(o);e>=0&&n.splice(e,1)}},pub:(o,r,l)=>{e[o]=r,t[o]=l,n.forEach((e=>{e[0]===o&&e[1](r)}))}}}const de=U({});de.displayName="Slot Context";const pe=e=>{const t=ne(ae,[]),{children:n,...o}=e;return d(de.Provider,{value:t,children:n,...o})},he=e=>{const t=e.name,{slots:n,sub:o}=oe(de),[r,l]=X(n[t]);return(ue?ee:Q)((()=>{const e=o(t,l);return()=>{e()}}),[t,o]),r};let fe=0;const me=e=>{const{owners:t,pub:n}=oe(de),o=te(null),r=te(0),l=te(!0),i=e.name,s=e.children;return r.current||(r.current=++fe,n(i,s,r.current)),o.current=s,(ue?ee:Q)((()=>(l.current||n(i,o.current,r.current),l.current=!1,()=>{t[i]===r.current&&n(i,null,0)})),[t,n,i]),null},ye=()=>{for(const e of"Hello")console.log(e);return"func other foo"};let ve;function ge(e){let t,n;return o=>{const[,r]=X(0),l=te(n);if(t||(t=e().then((e=>n=e&&e.default||e))),void 0!==n)return d(n,o);throw l.current||(l.current=t.then((()=>r(1)))),t}}const be=t.__e;function we(e){return this.__c=ke,this.componentDidCatch=e.onError,e.children}function ke(e){e.then((()=>this.forceUpdate()))}let Ee;t.__e=(e,t,n)=>{if(e&&e.then){let o=t;for(;o=o.__;)if(o.__c&&o.__c.__c)return null==t.__e&&(t.__e=n.__e,t.__k=n.__k),t.__k||(t.__k=[]),o.__c.__c(e,t)}be&&be(e,t,n)};const $e=(e,t)=>{if(Ee=void 0,t&&"click"===t.type){if(t.ctrlKey||t.metaKey||t.altKey||t.shiftKey||0!==t.button)return e;const n=t.target.closest("a[href]");if(!n||n.origin!=location.origin||/^#/.test(n.getAttribute("href"))||!/^(_?self)?$/i.test(n.target))return e;Ee=!0,t.preventDefault(),t=n.href.replace(location.origin,"")}else"string"==typeof t?Ee=!0:t=location.pathname+location.search;return!0===Ee?history.pushState(null,"",t):!1===Ee&&history.replaceState(null,"",t),t};function Ce(e){const[t,n]=Z($e,e.url||location.pathname+location.search),o=!0===Ee,r=ne((()=>{const e=new URL(t,location.origin),r=e.pathname.replace(/(.)\/$/g,"$1");return{url:t,path:r,query:Object.fromEntries(e.searchParams),route:n,wasPush:o}}),[t]);return ee((()=>(addEventListener("click",n),addEventListener("popstate",n),()=>{removeEventListener("click",n),removeEventListener("popstate",n)})),[]),d(Ce.ctx.Provider,{value:r},e.children)}const xe=Promise.resolve();function Te(e){const[t,n]=Z((e=>e+1),0),{url:o,query:r,wasPush:l,path:i}=Pe(),{rest:s=i,params:_={}}=oe(Se),c=te(!1),u=te(i),a=te(0),p=te(),h=te(),f=te(),m=te(!1),y=te();y.current=!1,p.current=ne((()=>{let t,n,o;return this.__v&&this.__v.__k&&this.__v.__k.reverse(),a.current++,h.current=p.current,k(e.children).some((e=>{if(((e,t,n)=>{e=e.split("/").filter(Boolean),t=(t||"").split("/").filter(Boolean);for(let o,r,l=0;l<Math.max(e.length,t.length);l++){let[,i,s,_]=(t[l]||"").match(/^(:?)(.*?)([+*?]?)$/);if(o=e[l],i||s!=o){if(!i&&o&&"*"==_){n.rest="/"+e.slice(l).map(decodeURIComponent).join("/");break}if(!i||!o&&"?"!=_&&"*"!=_)return;if(r="+"==_||"*"==_,r?o=e.slice(l).map(decodeURIComponent).join("/"):o&&(o=decodeURIComponent(o)),n.params[s]=o,s in n||(n[s]=o),r)break}}return n})(s,e.props.path,o={path:s,query:r,params:_,rest:""}))return t=L(e,o);e.props.default&&(n=L(e,o))})),d(Se.Provider,{value:o},t||n)}),[o]);const v=h.current;return h.current=null,this.__c=t=>{y.current=!0,h.current=v,e.onLoadStart&&e.onLoadStart(o),c.current=!0;let r=a.current;t.then((()=>{r===a.current&&(h.current=null,xe.then(n))}))},ee((()=>{const t=this.__v&&this.__v.__e;y.current?m.current||f.current||(f.current=t):(!m.current&&f.current&&(f.current!==t&&f.current.remove(),f.current=null),m.current=!0,u.current!==i&&(l&&scrollTo(0,0),e.onLoadEnd&&c.current&&e.onLoadEnd(o),e.onRouteChange&&e.onRouteChange(o),c.current=!1,u.current=i))}),[i,l,t]),[d(Ae,{r:p}),d(Ae,{r:h})]}const Ae=({r:e})=>e.current;Te.Provider=Ce,Ce.ctx=U({});const Se=U({}),Re=e=>d(e.component,e),Pe=()=>oe(Ce.ctx);let Ne=-1;const He=e=>{-1===Ne&&(Ne=t.vnode);const n=Ne,o=(t,n=!1)=>{const o=t.props||{},r=new Set;for(const l of["class","className","data-tw"])if(l in o){const t=o[l];if(!t)continue;if("string"!=typeof t)throw new Error(t);const n=e?e(t):t;"string"!=typeof n||"class"!==l&&"className"!==l||r.add(n),o[l]=void 0}r.size&&(o.className=Array.from(r).join(" ").replace(/\s\s*/gm," ").trim())},r=e=>{if("string"==typeof e.type&&o(e,!0),function(e){let t,n=e[0],o=1;for(;o<e.length;){const r=e[o],l=e[o+1];if(o+=2,("optionalAccess"===r||"optionalCall"===r)&&null==n)return;"access"===r||"optionalAccess"===r?(t=n,n=l(n)):"call"!==r&&"optionalCall"!==r||(n=l(((...e)=>n.call(t,...e))),t=void 0)}return n}([e,"access",e=>e.props,"optionalAccess",e=>e.children])&&Array.isArray(e.props.children)){const t=e.props.children;for(const e of t)e&&r(e)}};t.vnode=e=>{if(!e.type||"string"!=typeof e.type)return"function"==typeof e.type&&r(e),void(n&&n(e));o(e),n&&n(e)}},De=e=>M`<section><h2>Routed → 404 Not Found</h2><p class="text-black bg-yellow-300 text-3xl"> This text has a <strong>yellow-300</strong> background (unique to this paragraph, not shared with any other route or component) </p></section>`,Le=(e,t)=>e===t;function Ue(e,t,n=Le){if(e===t)return!0;if(!e||!t||e.length!==t.length)return!1;for(let o=0;o<e.length;o++)if(!n(e[o],t[o]))return!1;return!0}const Oe=[];const Fe=(e,t,n,o)=>{const[,r]=X(NaN);return function(e,t,n,o={},r){const l=!r;for(const c of Oe)if(Ue(t,c.asyncFuncArgs,c.isEqual)&&n===c.key){if(l)return;if(c.rejectedReason)return[void 0,c.rejectedReason];if(Object.prototype.hasOwnProperty.call(c,"fulfilledValue"))return[c.fulfilledValue,void 0];throw c.promise}const i="number"==typeof o.removeFromCacheTimeout&&o.removeFromCacheTimeout>0?o.removeFromCacheTimeout:void 0,s=e(...t).then((e=>(_.fulfilledValue=e,_.removeFromCacheTimeout&&setTimeout((()=>{Ie(_.asyncFuncArgs,_.key)}),_.removeFromCacheTimeout),e)),(e=>{_.rejectedReason=e})).finally((()=>{void 0!==o.hydrationValue&&(delete o.hydrationValue,r&&setTimeout((()=>{r()})))})),_={asyncFuncArgs:t,key:n,isEqual:o.isEqual,removeFromCacheTimeout:i,promise:s};if(Oe.push(_),!l){if(void 0!==o.hydrationValue)return o.hydrationValue;throw s}}(e,t,n,o,(()=>{r(NaN)}))},Ie=(e,t)=>{for(let n=0;n<Oe.length;n++){const o=Oe[n];if(Ue(e,o.asyncFuncArgs,o.isEqual)&&t===o.key)return Oe.splice(n,1),!0}return!1};t.__e;const We=t.unmount;function ze(e,t,n){return e&&(e.__c&&e.__c.__H&&(e.__c.__H.__.forEach((e=>{"function"==typeof e.__c&&e.__c()})),e.__c.__H=null),null!=(e=function(e,t){for(let n in t)e[n]=t[n];return e}({},e)).__c&&(e.__c.__P===n&&(e.__c.__P=t),e.__c=null),e.__k=e.__k&&e.__k.map((e=>ze(e,t,n)))),e}function Me(e,t,n){return e&&(e.__v=null,e.__k=e.__k&&e.__k.map((e=>Me(e,t,n))),e.__c&&e.__c.__P===t&&(e.__e&&n.insertBefore(e.__e,e.__d),e.__c.__e=!0,e.__c.__P=n)),e}function qe(){this.__u=0,this._suspenders=null,this.__b=null}t.unmount=function(e){const t=e.__c;t&&t.__R&&t.__R(),t&&!0===e.__h&&(e.type=null),We&&We(e)},qe.prototype=new f,qe.prototype.__c=function(e,t){const n=t.__c,o=this;null==o._suspenders&&(o._suspenders=[]),o._suspenders.push(n);const r=function(e){let t=e.__.__c;return t&&t.__e&&t.__e(e)}(o.__v);let l=!1;const i=()=>{l||(l=!0,n.__R=null,r?r(s):s())};n.__R=i;const s=()=>{if(!--o.__u){if(o.state.__e){const e=o.state.__e;o.__v.__k[0]=Me(e,e.__c.__P,e.__c.__O)}let e;for(o.setState({__e:o.__b=null});e=o._suspenders.pop();)e.forceUpdate()}},_=!0===t.__h;o.__u++||_||o.setState({__e:o.__b=o.__v.__k[0]}),e.then(i,i)},qe.prototype.componentWillUnmount=function(){this._suspenders=[]},qe.prototype.render=function(e,t){if(this.__b){if(this.__v.__k){const e=document.createElement("div"),t=this.__v.__k[0].__c;this.__v.__k[0]=ze(this.__b,e,t.__O=t.__P)}this.__b=null}const n=t.__e&&d(h,null,e.fallback);return n&&(n.__h=null),[d(h,null,t.__e?null:e.children),n]};ue&&"undefined"!=typeof customElements&&customElements.define("preact-hydrator",class extends HTMLElement{connectedCallback(){if(!this.parentNode)return;const e=this.getAttribute("href");if(!e)return;const[t,n]=e.split("#"),o=this.getAttribute("id");let r;try{r=this.firstElementChild?.textContent?JSON.parse(this.firstElementChild.textContent):void 0}catch(_){}const l=[];let i=this;for(;i=i?.previousSibling;)if(8!==i.nodeType)l.unshift(i);else if(i.data===o)break;const s=((e,t)=>{const n=e;{const o=Array.isArray(t)?t:[t],r=o[o.length-1].nextSibling;n.__k={firstChild:o[0],nodeType:1,parentNode:e,childNodes:o,insertBefore:(t,n)=>{e.insertBefore(t,n||r)},appendChild:t=>{e.insertBefore(t,r)},removeChild:t=>{e.removeChild(t)}}}return n.__k})(this.parentNode,l);new Function("s","return import(s)")(t).then((e=>(D(d((n?e[n]:void 0)||e.default,r,[]),s),null))).catch((e=>{}))}});const Be={};const Ye=d(class extends f{shouldComponentUpdate(){return!1}componentDidCatch(e){e===Be&&(this.__d=!0)}render(){return d(je,null,null)}},null,[]),je=e=>{throw Be},Ke=ue?1e3:0,Ve="/preact-wmr-twind-zero/",Ge=ue?document.querySelector("script[type=isodata]"):void 0,Je=!ue||!!Ge,Xe="KEYBOARD_INTERACT",Ze=async e=>new Promise((t=>{setTimeout((()=>{t(`Fulfilled: ${e} [${(new Date).toUTCString()}] ${ue?"CLIENT":"SERVER"}`)}),2e3)})),Qe=e=>{let t;if(Je&&ue){const e=window.PREACTWMR_HYDRATE_SUSPEND_CACHE;void 0!==e&&(t=[`_${e.data}_`,void 0],window.PREACTWMR_HYDRATE_SUSPEND_CACHE=void 0)}const[n,o]=Fe(Ze,[111],"my cache key",{hydrationValue:t});Je&&!ue&&void 0!==n&&(globalThis.PREACTWMR_HYDRATE_SUSPEND_CACHE=n);const r=void 0!==n?n:void 0!==o?`${o}`:"?!";return M`<p onClick=${()=>{alert(r)}}>${r}</p>`},et=e=>M`<section><h2>Routed → Home</h2><p class="non-twind-class-token text-black bg-yellow-400 text-3xl"> This text has a <strong>yellow-400</strong> background (unique to this paragraph, not shared with any other route or component) </p><${qe} fallback=${M`<p>SUSPENSE CACHE...</p>`}><${Qe}/><//><div class="test-scope"><p> this is a paragraph <span class="child-span"> with a <span>child</span> span </span>  element. </p><h4>heading</h4></div></section>`,tt=ue?window:{},nt=e=>{const t=te(!1);Q((()=>{t.current=!0}),[]);const n=tt.PREACTWMR_HYDRATED;return ue&&Je&&(!n||t.current)?(console.log(`NO_HYDRATE: ${e.label} (hydrated: ${String(n)}, hasRenderedAtLeastOnce: ${String(t.current)})`),Ye):M`<div class="bg-pink-200 border-pink-800 border-2 border-solid rounded" data-static-no-hydrate><div>${`hasRenderedAtLeastOnce: ${String(t.current)} (${e.label})`}</div>${e.children}</div>`},ot=ge((()=>new Promise((e=>{setTimeout((()=>{e(import("./chunks/island.2367796d.js"))}),Ke)})))),rt=e=>M`<${we} onError=${e=>{console.log("ErrorBoundary onError (SuspendedStaticNoHydrate): ",e)}}><${ot}/><//>`,lt=e=>M`<section><h2>Routed → Non Lazy</h2><p class="bg-yellow-600 text-3xl"> This text has a <strong>yellow-600</strong> background (unique to this paragraph, not shared with any other route or component) </p><p class="text-4xl"> This text has a <strong>text-4xl</strong> size (unique to this paragraph, not shared with any other route or component) </p><${nt} label="4"><p> STATIC NO HYDRATE (HTML/JSX component below is not shipped to client via the Javascript bundle on initial hydration, as it is considered static during pre-rendering. However the JS async component is lazy-loaded at subsequent route changes (SPA) </p><${rt}/><//></section>`,it=function(e){let t,n,o;function r(r){if(t||(t=e(),t.then((e=>{n=e.default||e}),(e=>{o=e}))),o)throw o;if(!n)throw t;return d(n,r)}return r.displayName="Lazy",r.__f=!0,r}((()=>new Promise((e=>{setTimeout((()=>{e(import("./chunks/island.c9ae49c9.js"))}),Ke)})))),st=e=>{const t="text-blue-500 bg-pink-400 text-3xl";return M`<${we} onError=${e=>{console.log("ErrorBoundary onError (SuspendedLazy): ",e)}}><${qe} data-tw=${t} fallback=${M`<${me} name="second slot"><p>(lifecycle: DURING-only lazy dynamic import, suspense fallback)</p><p><strong>Slot Content (1)</strong></p><p class="text-blue-500"><strong>Slot Content (2)</strong></p><//><p class=${"text-blue-500 bg-pink-400 text-3xl"}>LOADING...</p>`}><${it}/><//><//>`},_t=e=>{const[t,n]=X(!1);return M`${t?M`<${me} name="first slot"><p>(lifecycle: DURING and AFTER lazy dynamic import)</p><p>Slot Content (1)</p><p class="text-blue-400">Slot Content (2)</p><//><${st}/>`:M`<button data-tw="text-blue-400" class="m-2 p-2 border-purple-500 border-2 border-dotted rounded" onClick=${()=>{n(!0)}}> CLICK HERE TO LAZY-LOAD </button><span class=${"before:content-['zob']"}>(1s simulated network delay on first load, then "cache" hit)</span>`}`},ct=e=>M`<section><h2>Routed → Route</h2><p class=${"\n        \n        text-black\n        \n         bg-yellow-700 bg-yellow-700"} className="text-6xl"> This text has a <strong>yellow-700</strong> background (unique to this paragraph, not shared with any other route or component) </p><p class="~(!text-center,hover:underline,cursor-pointer,text-red-800,bg-green-50,hover:!bg-red-100,w-1/2,ml-11)"> This text has a unique custom Twind "shortcut" class based on the combination of the following utility styles: <strong>!text-center hover:underline cursor-pointer text-red-800 bg(green-50 !hover:red-100) w-1/2 ml-11</strong>. </p><${_t}/></section>`,ut=e=>M`<${we} onError=${e=>{console.log("ErrorBoundary onError (sub router): ",e)}}><${Te}><${st} path=${"/lazy"+(Je?"/":"")}/><${ot} path=${"/static-no-hydrate"+(Je?"/":"")}/><//><//>`;console.log(ye()),console.log(ye()),console.log("other foo"),console.log("other foo"),console.log("foo");const at=ue?window:{},dt=ge((()=>new Promise((e=>{setTimeout((()=>{e(import("./chunks/lazy.da960fc7.js"))}),Ke)})))),pt=({prerenderIndex:e})=>{const[t,n]=X(!1),o="text-red-600";return M`<${Ce}><${pe}><${nt} label="1"><p> .STATIC NO HYDRATE (in dev mode, this should be -1, in a prerendered build, this should be a fixed number corresponding to the SSG sequence index, NOT 999 which would otherwise indicate that the fragment has incorrectly been hydrated) </p><p>prerenderIndex: ${e}</p><//><h1>Router status:</h1><p class="text-text-3xl text-white p-1.5 bg-pink-600">${t?"SPA route (post-hydration)":"Initial route (static SSR / SSG)"}</p><${nt} label="2"><p>STATIC NO HYDRATE</p><span class=${t?o:"text-green-600"} data-tw=${o}>${t?"[onRouteChangeWasCalled] (this should NEVER display in prerender builds (does show in dev mode))":"[!onRouteChangeWasCalled] (this should ALWAYS display in prerender builds (does show in dev mode))"}</span><//><h1>Router links:</h1><ul><li><span class="text-yellow-400 inline-block mr-1.5"> ███ </span><a href=${`${Ve}?param=home#hash-home`}>Routed Home</a></li><li><span class="text-yellow-500 inline-block mr-1.5"> ███ </span><a href=${`${Ve}routed-lazy${Je?"/":""}?param=lazy#hash-lazy`}>Routed Lazy</a> (1s simulated network delay on first load, then "cache" hit) </li><li><span class="text-yellow-600 inline-block mr-1.5"> ███ </span><a href=${`${Ve}routed-non-lazy${Je?"/":""}?param=non-lazy#hash-non-lazy`}> Routed Non Lazy </a></li><li><span class="text-yellow-700 inline-block mr-1.5"> ███ </span><a href=${`${Ve}routed-route${Je?"/":""}?param=route#hash-route`}>Routed Route</a>  (contains lazy component and triggers slots / named portals) </li></ul><h1>First Slot:</h1><hr/><${he} name="first slot"/><hr/><h1>Second Slot:</h1><hr/><${he} name="second slot"/><hr/><h1>Router content:</h1><div class="border-pink-600 border-4 border-solid rounded"><${we} onError=${e=>{console.log("ErrorBoundary onError (top router): ",e)}}><${Te} onRouteChange=${()=>{n(!0)}}><${et} path=${`${Ve}`}/><${dt} path=${`${Ve}routed-lazy${Je?"/":""}`}/><${lt} path=${`${Ve}routed-non-lazy${Je?"/":""}`}/><${Re} component=${ct} path=${`${Ve}routed-route${Je?"/":""}`}/><${De} default/><${ut} path=${`${Ve}suspended/*`}/><//><//></div><h1>Twind critical/secondary stylesheet tests:</h1><p class=${"text-3xl"}> This paragraphs and others located in different routes share the same <strong>text-3xl</strong> Twind style, but it isn't duplicated in the pre-rendered "secondary" stylesheet, it is hoisted in the "critical" styles. </p><p class="text-black bg-yellow-200"> This text has a <strong>yellow-200</strong> background (unique to this paragraph, not shared with any other route or component) </p><h1>404 Not Found links:</h1><ul><li><span class="text-yellow-300 inline-block mr-1.5"> ███ </span><a href=${`${Ve}not-found-blank`} rel="noreferrer noopener" target="_BLANK"> 404 (target BLANK) </a></li><li><span class="text-yellow-300 inline-block mr-1.5"> ███ </span><a href=${`${Ve}not-found-inpage`} target="_top"> 404 (in page) </a></li></ul><//><//>`};ue&&(document.documentElement.addEventListener("mousedown",(e=>{document.documentElement.classList.remove("KEYBOARD_INTERACT")}),!0),document.addEventListener("keydown",(e=>{document.documentElement.classList.add("KEYBOARD_INTERACT")}),{once:!1,passive:!1,capture:!0}),document.addEventListener("keyup",(e=>{document.documentElement.classList.add("KEYBOARD_INTERACT")}),{once:!1,passive:!1,capture:!0}),Je&&(He(),function(e,t){if("undefined"==typeof window)return;let n=document.querySelector("script[type=isodata]");t=t||n&&n.parentNode||document.body,!ve&&n?D(e,t):H(e,t),ve=!0}(M`<${pt} prerenderIndex=${999}/>`,document.body),at.PREACTWMR_HYDRATED=!0));let ht=0;async function ft(e){const{preactWmrPrerenderForTwind:t}=await import("./chunks/prerender.1513d1a2.js");globalThis.PREACTWMR_HYDRATE_SUSPEND_CACHE=void 0;const n=await t(e.url,M`<${pt} prerenderIndex=${ht++}/>`,{props:e}),o=[{type:"meta",props:{property:"og:title",content:"SEO title"}},{type:"style",props:{id:n.cssId,children:n.cssTextContent}},{type:"script",props:{type:"text/javascript",children:'if (!window.location.pathname.endsWith("/") && !/\\.html?/.test(window.location.pathname)) { window.location = window.location.origin + window.location.pathname + "/" + window.location.search + window.location.hash; }'}}];globalThis.PREACTWMR_HYDRATE_SUSPEND_CACHE&&o.push({type:"script",props:{type:"text/javascript",children:`window.PREACTWMR_HYDRATE_SUSPEND_CACHE = JSON.parse('{"data":${JSON.stringify(globalThis.PREACTWMR_HYDRATE_SUSPEND_CACHE)}}');`}});const r=new Set(o);return{html:n.html,links:n.links,data:{...e},head:{elements:r}}}export{pt as App,L as B,Xe as K,nt as S,rt as a,me as b,h as d,He as i,t as l,M as m,ft as prerender,d as v};