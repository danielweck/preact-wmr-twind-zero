var e,t,n,o,r,l,s,i={},_=[],c=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function u(e,t){for(var n in t)e[n]=t[n];return e}function a(e){var t=e.parentNode;t&&t.removeChild(e)}function p(t,n,o){var r,l,s,i={};for(s in n)"key"==s?r=n[s]:"ref"==s?l=n[s]:i[s]=n[s];if(arguments.length>2&&(i.children=arguments.length>3?e.call(arguments,2):o),"function"==typeof t&&null!=t.defaultProps)for(s in t.defaultProps)void 0===i[s]&&(i[s]=t.defaultProps[s]);return h(t,i,r,l,null)}function h(e,o,r,l,s){var i={type:e,props:o,key:r,ref:l,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==s?++n:s};return null==s&&null!=t.vnode&&t.vnode(i),i}function d(e){return e.children}function f(e,t){this.props=e,this.context=t}function m(e,t){if(null==t)return e.__?m(e.__,e.__.__k.indexOf(e)+1):null;for(var n;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e)return n.__e;return"function"==typeof e.type?m(e):null}function y(e){var t,n;if(null!=(e=e.__)&&null!=e.__c){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if(null!=(n=e.__k[t])&&null!=n.__e){e.__e=e.__c.base=n.__e;break}return y(e)}}function v(e){(!e.__d&&(e.__d=!0)&&o.push(e)&&!g.__r++||l!==t.debounceRendering)&&((l=t.debounceRendering)||r)(g)}function g(){for(var e;g.__r=o.length;)e=o.sort((function(e,t){return e.__v.__b-t.__v.__b})),o=[],e.some((function(e){var t,n,o,r,l,s;e.__d&&(l=(r=(t=e).__v).__e,(s=t.__P)&&(n=[],(o=u({},r)).__v=r.__v+1,S(s,r,o,t.__n,void 0!==s.ownerSVGElement,null!=r.__h?[l]:null,n,null==l?m(r):l,r.__h),A(n,r),r.__e!=l&&y(r)))}))}function b(e,t,n,o,r,l,s,c,u,a){var p,f,y,v,g,b,w,x=o&&o.__k||_,E=x.length;for(n.__k=[],p=0;p<t.length;p++)if(null!=(v=n.__k[p]=null==(v=t[p])||"boolean"==typeof v?null:"string"==typeof v||"number"==typeof v||"bigint"==typeof v?h(null,v,null,null,v):Array.isArray(v)?h(d,{children:v},null,null,null):v.__b>0?h(v.type,v.props,v.key,null,v.__v):v)){if(v.__=n,v.__b=n.__b+1,null===(y=x[p])||y&&v.key==y.key&&v.type===y.type)x[p]=void 0;else for(f=0;f<E;f++){if((y=x[f])&&v.key==y.key&&v.type===y.type){x[f]=void 0;break}y=null}S(e,v,y=y||i,r,l,s,c,u,a),g=v.__e,(f=v.ref)&&y.ref!=f&&(w||(w=[]),y.ref&&w.push(y.ref,null,v),w.push(f,v.__c||g,v)),null!=g?(null==b&&(b=g),"function"==typeof v.type&&v.__k===y.__k?v.__d=u=k(v,u,e):u=$(e,v,y,x,g,u),"function"==typeof n.type&&(n.__d=u)):u&&y.__e==u&&u.parentNode!=e&&(u=m(y))}for(n.__e=b,p=E;p--;)null!=x[p]&&("function"==typeof n.type&&null!=x[p].__e&&x[p].__e==n.__d&&(n.__d=m(o,p+1)),N(x[p],x[p]));if(w)for(p=0;p<w.length;p++)R(w[p],w[++p],w[++p])}function k(e,t,n){for(var o,r=e.__k,l=0;r&&l<r.length;l++)(o=r[l])&&(o.__=e,t="function"==typeof o.type?k(o,t,n):$(n,o,o,r,o.__e,t));return t}function w(e,t){return t=t||[],null==e||"boolean"==typeof e||(Array.isArray(e)?e.some((function(e){w(e,t)})):t.push(e)),t}function $(e,t,n,o,r,l){var s,i,_;if(void 0!==t.__d)s=t.__d,t.__d=void 0;else if(null==n||r!=l||null==r.parentNode)e:if(null==l||l.parentNode!==e)e.appendChild(r),s=null;else{for(i=l,_=0;(i=i.nextSibling)&&_<o.length;_+=2)if(i==r)break e;e.insertBefore(r,l),s=l}return void 0!==s?s:r.nextSibling}function x(e,t,n){"-"===t[0]?e.setProperty(t,n):e[t]=null==n?"":"number"!=typeof n||c.test(t)?n:n+"px"}function E(e,t,n,o,r){var l;e:if("style"===t)if("string"==typeof n)e.style.cssText=n;else{if("string"==typeof o&&(e.style.cssText=o=""),o)for(t in o)n&&t in n||x(e.style,t,"");if(n)for(t in n)o&&n[t]===o[t]||x(e.style,t,n[t])}else if("o"===t[0]&&"n"===t[1])l=t!==(t=t.replace(/Capture$/,"")),t=t.toLowerCase()in e?t.toLowerCase().slice(2):t.slice(2),e.l||(e.l={}),e.l[t+l]=n,n?o||e.addEventListener(t,l?T:C,l):e.removeEventListener(t,l?T:C,l);else if("dangerouslySetInnerHTML"!==t){if(r)t=t.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==t&&"list"!==t&&"form"!==t&&"tabIndex"!==t&&"download"!==t&&t in e)try{e[t]=null==n?"":n;break e}catch(e){}"function"==typeof n||(null!=n&&(!1!==n||"a"===t[0]&&"r"===t[1])?e.setAttribute(t,n):e.removeAttribute(t))}}function C(e){this.l[e.type+!1](t.event?t.event(e):e)}function T(e){this.l[e.type+!0](t.event?t.event(e):e)}function S(n,o,r,l,s,_,c,p,h){var y,v,g,k,w,$,x,C,T,S,A,R=o.type;if(void 0!==o.constructor)return null;null!=r.__h&&(h=r.__h,p=o.__e=r.__e,o.__h=null,_=[p]),(y=t.__b)&&y(o);try{e:if("function"==typeof R){if(C=o.props,T=(y=R.contextType)&&l[y.__c],S=y?T?T.props.value:y.__:l,r.__c?x=(v=o.__c=r.__c).__=v.__E:("prototype"in R&&R.prototype.render?o.__c=v=new R(C,S):(o.__c=v=new f(C,S),v.constructor=R,v.render=P),T&&T.sub(v),v.props=C,v.state||(v.state={}),v.context=S,v.__n=l,g=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=R.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=u({},v.__s)),u(v.__s,R.getDerivedStateFromProps(C,v.__s))),k=v.props,w=v.state,g)null==R.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else{if(null==R.getDerivedStateFromProps&&C!==k&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(C,S),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(C,v.__s,S)||o.__v===r.__v){v.props=C,v.state=v.__s,o.__v!==r.__v&&(v.__d=!1),v.__v=o,o.__e=r.__e,o.__k=r.__k,o.__k.forEach((function(e){e&&(e.__=o)})),v.__h.length&&c.push(v);break e}null!=v.componentWillUpdate&&v.componentWillUpdate(C,v.__s,S),null!=v.componentDidUpdate&&v.__h.push((function(){v.componentDidUpdate(k,w,$)}))}v.context=S,v.props=C,v.state=v.__s,(y=t.__r)&&y(o),v.__d=!1,v.__v=o,v.__P=n,y=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(l=u(u({},l),v.getChildContext())),g||null==v.getSnapshotBeforeUpdate||($=v.getSnapshotBeforeUpdate(k,w)),A=null!=y&&y.type===d&&null==y.key?y.props.children:y,b(n,Array.isArray(A)?A:[A],o,r,l,s,_,c,p,h),v.base=o.__e,o.__h=null,v.__h.length&&c.push(v),x&&(v.__E=v.__=null),v.__e=!1}else null==_&&o.__v===r.__v?(o.__k=r.__k,o.__e=r.__e):o.__e=function(t,n,o,r,l,s,_,c){var u,p,h,d=o.props,f=n.props,y=n.type,v=0;if("svg"===y&&(l=!0),null!=s)for(;v<s.length;v++)if((u=s[v])&&"setAttribute"in u==!!y&&(y?u.localName===y:3===u.nodeType)){t=u,s[v]=null;break}if(null==t){if(null===y)return document.createTextNode(f);t=l?document.createElementNS("http://www.w3.org/2000/svg",y):document.createElement(y,f.is&&f),s=null,c=!1}if(null===y)d===f||c&&t.data===f||(t.data=f);else{if(s=s&&e.call(t.childNodes),p=(d=o.props||i).dangerouslySetInnerHTML,h=f.dangerouslySetInnerHTML,!c){if(null!=s)for(d={},v=0;v<t.attributes.length;v++)d[t.attributes[v].name]=t.attributes[v].value;(h||p)&&(h&&(p&&h.__html==p.__html||h.__html===t.innerHTML)||(t.innerHTML=h&&h.__html||""))}if(function(e,t,n,o,r){var l;for(l in n)"children"===l||"key"===l||l in t||E(e,l,null,n[l],o);for(l in t)r&&"function"!=typeof t[l]||"children"===l||"key"===l||"value"===l||"checked"===l||n[l]===t[l]||E(e,l,t[l],n[l],o)}(t,f,d,l,c),h)n.__k=[];else if(v=n.props.children,b(t,Array.isArray(v)?v:[v],n,o,r,l&&"foreignObject"!==y,s,_,s?s[0]:o.__k&&m(o,0),c),null!=s)for(v=s.length;v--;)null!=s[v]&&a(s[v]);c||("value"in f&&void 0!==(v=f.value)&&(v!==t.value||"progress"===y&&!v||"option"===y&&v!==d.value)&&E(t,"value",v,d.value,!1),"checked"in f&&void 0!==(v=f.checked)&&v!==t.checked&&E(t,"checked",v,d.checked,!1))}return t}(r.__e,o,r,l,s,_,c,h);(y=t.diffed)&&y(o)}catch(n){o.__v=null,(h||null!=_)&&(o.__e=p,o.__h=!!h,_[_.indexOf(p)]=null),t.__e(n,o,r)}}function A(e,n){t.__c&&t.__c(n,e),e.some((function(n){try{e=n.__h,n.__h=[],e.some((function(e){e.call(n)}))}catch(e){t.__e(e,n.__v)}}))}function R(e,n,o){try{"function"==typeof e?e(n):e.current=n}catch(e){t.__e(e,o)}}function N(e,n,o){var r,l;if(t.unmount&&t.unmount(e),(r=e.ref)&&(r.current&&r.current!==e.__e||R(r,null,n)),null!=(r=e.__c)){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(e){t.__e(e,n)}r.base=r.__P=null}if(r=e.__k)for(l=0;l<r.length;l++)r[l]&&N(r[l],n,"function"!=typeof e.type);o||null==e.__e||a(e.__e),e.__e=e.__d=void 0}function P(e,t,n){return this.constructor(e,n)}function H(n,o,r){var l,s,_;t.__&&t.__(n,o),s=(l="function"==typeof r)?null:r&&r.__k||o.__k,_=[],S(o,n=(!l&&r||o).__k=p(d,null,[n]),s||i,i,void 0!==o.ownerSVGElement,!l&&r?[r]:s?null:o.firstChild?e.call(o.childNodes):null,_,!l&&r?r:s?s.__e:o.firstChild,l),A(_,n)}function L(e,t){H(e,t,L)}function D(t,n,o){var r,l,s,i=u({},t.props);for(s in n)"key"==s?r=n[s]:"ref"==s?l=n[s]:i[s]=n[s];return arguments.length>2&&(i.children=arguments.length>3?e.call(arguments,2):o),h(t.type,i,r||t.key,l||t.ref,null)}function F(e,t){var n={__c:t="__cC"+s++,__:e,Consumer:function(e,t){return e.children(t)},Provider:function(e){var n,o;return this.getChildContext||(n=[],(o={})[t]=this,this.getChildContext=function(){return o},this.shouldComponentUpdate=function(e){this.props.value!==e.value&&n.some(v)},this.sub=function(e){n.push(e);var t=e.componentWillUnmount;e.componentWillUnmount=function(){n.splice(n.indexOf(e),1),t&&t.call(e)}}),e.children}};return n.Provider.__=n.Consumer.contextType=n}e=_.slice,t={__e:function(e,t){for(var n,o,r;t=t.__;)if((n=t.__c)&&!n.__)try{if((o=n.constructor)&&null!=o.getDerivedStateFromError&&(n.setState(o.getDerivedStateFromError(e)),r=n.__d),null!=n.componentDidCatch&&(n.componentDidCatch(e),r=n.__d),r)return n.__E=n}catch(t){e=t}throw e}},n=0,f.prototype.setState=function(e,t){var n;n=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=u({},this.state),"function"==typeof e&&(e=e(u({},n),this.props)),e&&u(n,e),null!=e&&this.__v&&(t&&this.__h.push(t),v(this))},f.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),v(this))},f.prototype.render=d,o=[],r="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g.__r=0,s=0;var O=function(e,t,n,o){var r;t[0]=0;for(var l=1;l<t.length;l++){var s=t[l++],i=t[l]?(t[0]|=s?1:2,n[t[l++]]):t[++l];3===s?o[0]=i:4===s?o[1]=Object.assign(o[1]||{},i):5===s?(o[1]=o[1]||{})[t[++l]]=i:6===s?o[1][t[++l]]+=i+"":s?(r=e.apply(i,O(e,i,n,["",null])),o.push(r),i[0]?t[0]|=2:(t[l-2]=0,t[l]=r)):o.push(i)}return o},I=new Map;var U,z,q,B=function(e){var t=I.get(this);return t||(t=new Map,I.set(this,t)),(t=O(this,t.get(e)||(t.set(e,t=function(e){for(var t,n,o=1,r="",l="",s=[0],i=function(e){1===o&&(e||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?s.push(0,e,r):3===o&&(e||r)?(s.push(3,e,r),o=2):2===o&&"..."===r&&e?s.push(4,e,0):2===o&&r&&!e?s.push(5,0,!0,r):o>=5&&((r||!e&&5===o)&&(s.push(o,0,r,n),o=6),e&&(s.push(o,e,0,n),o=6)),r=""},_=0;_<e.length;_++){_&&(1===o&&i(),i(_));for(var c=0;c<e[_].length;c++)t=e[_][c],1===o?"<"===t?(i(),s=[s],o=3):r+=t:4===o?"--"===r&&">"===t?(o=1,r=""):r=t+r[0]:l?t===l?l="":r+=t:'"'===t||"'"===t?l=t:">"===t?(i(),o=1):o&&("="===t?(o=5,n=r,r=""):"/"===t&&(o<5||">"===e[_][c+1])?(i(),3===o&&(s=s[0]),o=s,(s=s[0]).push(2,0,o),o=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(i(),o=2):r+=t),3===o&&"!--"===r&&(o=4,s=s[0])}return i(),s}(e)),t),arguments,[])).length>1?t:t[0]}.bind(p),W=0,M=[],j=t.__b,K=t.__r,Y=t.diffed,G=t.__c,V=t.unmount;function J(e,n){t.__h&&t.__h(z,e,W||n),W=0;var o=z.__H||(z.__H={__:[],__h:[]});return e>=o.__.length&&o.__.push({}),o.__[e]}function X(e){return W=1,Z(ce,e)}function Z(e,t,n){var o=J(U++,2);return o.t=e,o.__c||(o.__=[n?n(t):ce(void 0,t),function(e){var t=o.t(o.__[0],e);o.__[0]!==t&&(o.__=[t,o.__[1]],o.__c.setState({}))}],o.__c=z),o.__}function Q(e,n){var o=J(U++,3);!t.__s&&_e(o.__H,n)&&(o.__=e,o.__H=n,z.__H.__h.push(o))}function ee(e,n){var o=J(U++,4);!t.__s&&_e(o.__H,n)&&(o.__=e,o.__H=n,z.__h.push(o))}function te(e){return W=5,ne((function(){return{current:e}}),[])}function ne(e,t){var n=J(U++,7);return _e(n.__H,t)&&(n.__=e(),n.__H=t,n.__h=e),n.__}function oe(e){var t=z.context[e.__c],n=J(U++,9);return n.c=e,t?(null==n.__&&(n.__=!0,t.sub(z)),t.props.value):e.__}function re(){for(var e;e=M.shift();)if(e.__P)try{e.__H.__h.forEach(se),e.__H.__h.forEach(ie),e.__H.__h=[]}catch(z){e.__H.__h=[],t.__e(z,e.__v)}}t.__b=function(e){z=null,j&&j(e)},t.__r=function(e){K&&K(e),U=0;var t=(z=e.__c).__H;t&&(t.__h.forEach(se),t.__h.forEach(ie),t.__h=[])},t.diffed=function(e){Y&&Y(e);var n=e.__c;n&&n.__H&&n.__H.__h.length&&(1!==M.push(n)&&q===t.requestAnimationFrame||((q=t.requestAnimationFrame)||function(e){var t,n=function(){clearTimeout(o),le&&cancelAnimationFrame(t),setTimeout(e)},o=setTimeout(n,100);le&&(t=requestAnimationFrame(n))})(re)),z=null},t.__c=function(e,n){n.some((function(e){try{e.__h.forEach(se),e.__h=e.__h.filter((function(e){return!e.__||ie(e)}))}catch(q){n.some((function(e){e.__h&&(e.__h=[])})),n=[],t.__e(q,e.__v)}})),G&&G(e,n)},t.unmount=function(e){V&&V(e);var n,o=e.__c;o&&o.__H&&(o.__H.__.forEach((function(e){try{se(e)}catch(e){n=e}})),n&&t.__e(n,o.__v))};var le="function"==typeof requestAnimationFrame;function se(e){var t=z,n=e.__c;"function"==typeof n&&(e.__c=void 0,n()),z=t}function ie(e){var t=z;e.__c=e.__(),z=t}function _e(e,t){return!e||e.length!==t.length||t.some((function(t,n){return t!==e[n]}))}function ce(e,t){return"function"==typeof t?t(e):t}const ue=!("undefined"==typeof window||!window.document||!window.document.createElement);function ae(){const e={},t={},n=[];return{slots:e,owners:t,sub:(e,t)=>{const o=[e,t];return n.push(o),()=>{const e=n.indexOf(o);e>=0&&n.splice(e,1)}},pub:(o,r,l)=>{e[o]=r,t[o]=l,n.forEach((e=>{e[0]===o&&e[1](r)}))}}}const pe=F({});pe.displayName="Slot Context";const he=e=>{const t=ne(ae,[]),{children:n,...o}=e;return p(pe.Provider,{value:t,children:n,...o})},de=e=>{const t=e.name,{slots:n,sub:o}=oe(pe),[r,l]=X(n[t]);return(ue?ee:Q)((()=>{const e=o(t,l);return()=>{e()}}),[t,o]),r};let fe=0;const me=e=>{const{owners:t,pub:n}=oe(pe),o=te(null),r=te(0),l=te(!0),s=e.name,i=e.children;return r.current||(r.current=++fe,n(s,i,r.current)),o.current=i,(ue?ee:Q)((()=>(l.current||n(s,o.current,r.current),l.current=!1,()=>{t[s]===r.current&&n(s,null,0)})),[t,n,s]),null},ye=()=>{for(const e of"Hello")console.log(e);return"func other foo"};let ve;function ge(e){let t,n;return o=>{const[,r]=X(0),l=te(n);if(t||(t=e().then((e=>n=e&&e.default||e))),void 0!==n)return p(n,o);throw l.current||(l.current=t.then((()=>r(1)))),t}}const be=t.__e;function ke(e){return this.__c=we,this.componentDidCatch=e.onError,e.children}function we(e){e.then((()=>this.forceUpdate()))}let $e;t.__e=(e,t,n)=>{if(e&&e.then){let o=t;for(;o=o.__;)if(o.__c&&o.__c.__c)return null==t.__e&&(t.__e=n.__e,t.__k=n.__k),t.__k||(t.__k=[]),o.__c.__c(e,t)}be&&be(e,t,n)};const xe=(e,t)=>{if($e=void 0,t&&"click"===t.type){if(t.ctrlKey||t.metaKey||t.altKey||t.shiftKey||0!==t.button)return e;const n=t.target.closest("a[href]");if(!n||n.origin!=location.origin||/^#/.test(n.getAttribute("href"))||!/^(_?self)?$/i.test(n.target))return e;$e=!0,t.preventDefault(),t=n.href.replace(location.origin,"")}else"string"==typeof t?$e=!0:t=location.pathname+location.search;return!0===$e?history.pushState(null,"",t):!1===$e&&history.replaceState(null,"",t),t};function Ee(e){const[t,n]=Z(xe,e.url||location.pathname+location.search),o=!0===$e,r=ne((()=>{const e=new URL(t,location.origin),r=e.pathname.replace(/(.)\/$/g,"$1");return{url:t,path:r,query:Object.fromEntries(e.searchParams),route:n,wasPush:o}}),[t]);return ee((()=>(addEventListener("click",n),addEventListener("popstate",n),()=>{removeEventListener("click",n),removeEventListener("popstate",n)})),[]),p(Ee.ctx.Provider,{value:r},e.children)}const Ce=Promise.resolve();function Te(e){const[t,n]=Z((e=>e+1),0),{url:o,query:r,wasPush:l,path:s}=Ne(),{rest:i=s,params:_={}}=oe(Ae),c=te(!1),u=te(s),a=te(0),h=te(),d=te(),f=te(),m=te(!1),y=te();y.current=!1,h.current=ne((()=>{let t,n,o;return this.__v&&this.__v.__k&&this.__v.__k.reverse(),a.current++,d.current=h.current,w(e.children).some((e=>{if(((e,t,n)=>{e=e.split("/").filter(Boolean),t=(t||"").split("/").filter(Boolean);for(let o,r,l=0;l<Math.max(e.length,t.length);l++){let[,s,i,_]=(t[l]||"").match(/^(:?)(.*?)([+*?]?)$/);if(o=e[l],s||i!=o){if(!s&&o&&"*"==_){n.rest="/"+e.slice(l).map(decodeURIComponent).join("/");break}if(!s||!o&&"?"!=_&&"*"!=_)return;if(r="+"==_||"*"==_,r?o=e.slice(l).map(decodeURIComponent).join("/"):o&&(o=decodeURIComponent(o)),n.params[i]=o,i in n||(n[i]=o),r)break}}return n})(i,e.props.path,o={path:i,query:r,params:_,rest:""}))return t=D(e,o);e.props.default&&(n=D(e,o))})),p(Ae.Provider,{value:o},t||n)}),[o]);const v=d.current;return d.current=null,this.__c=t=>{y.current=!0,d.current=v,e.onLoadStart&&e.onLoadStart(o),c.current=!0;let r=a.current;t.then((()=>{r===a.current&&(d.current=null,Ce.then(n))}))},ee((()=>{const t=this.__v&&this.__v.__e;y.current?m.current||f.current||(f.current=t):(!m.current&&f.current&&(f.current!==t&&f.current.remove(),f.current=null),m.current=!0,u.current!==s&&(l&&scrollTo(0,0),e.onLoadEnd&&c.current&&e.onLoadEnd(o),e.onRouteChange&&e.onRouteChange(o),c.current=!1,u.current=s))}),[s,l,t]),[p(Se,{r:h}),p(Se,{r:d})]}const Se=({r:e})=>e.current;Te.Provider=Ee,Ee.ctx=F({});const Ae=F({}),Re=e=>p(e.component,e),Ne=()=>oe(Ee.ctx);let Pe=-1;const He=e=>{-1===Pe&&(Pe=t.vnode);const n=Pe,o=(t,n=!1)=>{const o=t.props||{},r=new Set;for(const l of["class","className","data-tw"])if(l in o){const t=o[l];if(!t)continue;if("string"!=typeof t)throw new Error(t);const n=e?e(t):t;"string"!=typeof n||"class"!==l&&"className"!==l||r.add(n),o[l]=void 0}r.size&&(o.className=Array.from(r).join(" ").replace(/\s\s*/gm," ").trim())},r=e=>{if("string"==typeof e.type&&o(e,!0),function(e){let t,n=e[0],o=1;for(;o<e.length;){const r=e[o],l=e[o+1];if(o+=2,("optionalAccess"===r||"optionalCall"===r)&&null==n)return;"access"===r||"optionalAccess"===r?(t=n,n=l(n)):"call"!==r&&"optionalCall"!==r||(n=l(((...e)=>n.call(t,...e))),t=void 0)}return n}([e,"access",e=>e.props,"optionalAccess",e=>e.children])&&Array.isArray(e.props.children)){const t=e.props.children;for(const e of t)e&&r(e)}};t.vnode=e=>{if(!e.type||"string"!=typeof e.type)return"function"==typeof e.type&&r(e),void(n&&n(e));o(e),n&&n(e)}},Le=e=>B`<section><h2>Routed → 404 Not Found</h2><p class="text-black bg-yellow-300 text-3xl"> This text has a <strong>yellow-300</strong> background (unique to this paragraph, not shared with any other route or component) </p></section>`,De=(e,t)=>e===t;function Fe(e,t,n=De){if(e===t)return!0;if(!e||!t||e.length!==t.length)return!1;for(let o=0;o<e.length;o++)if(!n(e[o],t[o]))return!1;return!0}const Oe=[];const Ie=(e,t,n,o)=>function(e,t,n,o={},r=!1){for(const _ of Oe)if(Fe(t,_.asyncFuncArgs,_.isEqual)&&n===_.key){if(r)return;if(_.rejectedReason)throw _.rejectedReason;if(Object.prototype.hasOwnProperty.call(_,"fulfilledValue"))return _.fulfilledValue;throw _.promise}const l="number"==typeof o.removeFromCacheTimeout&&o.removeFromCacheTimeout>0?o.removeFromCacheTimeout:void 0,s=e(...t).then((e=>(i.fulfilledValue=e,i.removeFromCacheTimeout&&setTimeout((()=>{Ue(i.asyncFuncArgs,i.key)}),i.removeFromCacheTimeout),e)),(e=>{i.rejectedReason=e})),i={asyncFuncArgs:t,key:n,isEqual:o.isEqual,removeFromCacheTimeout:l,promise:s};if(Oe.push(i),!r)throw s}(e,t,n,o,!1),Ue=(e,t)=>{for(let n=0;n<Oe.length;n++){const o=Oe[n];if(Fe(e,o.asyncFuncArgs,o.isEqual)&&t===o.key)return Oe.splice(n,1),!0}return!1};t.__e;const ze=t.unmount;function qe(e,t,n){return e&&(e.__c&&e.__c.__H&&(e.__c.__H.__.forEach((e=>{"function"==typeof e.__c&&e.__c()})),e.__c.__H=null),null!=(e=function(e,t){for(let n in t)e[n]=t[n];return e}({},e)).__c&&(e.__c.__P===n&&(e.__c.__P=t),e.__c=null),e.__k=e.__k&&e.__k.map((e=>qe(e,t,n)))),e}function Be(e,t,n){return e&&(e.__v=null,e.__k=e.__k&&e.__k.map((e=>Be(e,t,n))),e.__c&&e.__c.__P===t&&(e.__e&&n.insertBefore(e.__e,e.__d),e.__c.__e=!0,e.__c.__P=n)),e}function We(){this.__u=0,this._suspenders=null,this.__b=null}t.unmount=function(e){const t=e.__c;t&&t.__R&&t.__R(),t&&!0===e.__h&&(e.type=null),ze&&ze(e)},We.prototype=new f,We.prototype.__c=function(e,t){const n=t.__c,o=this;null==o._suspenders&&(o._suspenders=[]),o._suspenders.push(n);const r=function(e){let t=e.__.__c;return t&&t.__e&&t.__e(e)}(o.__v);let l=!1;const s=()=>{l||(l=!0,n.__R=null,r?r(i):i())};n.__R=s;const i=()=>{if(!--o.__u){if(o.state.__e){const e=o.state.__e;o.__v.__k[0]=Be(e,e.__c.__P,e.__c.__O)}let e;for(o.setState({__e:o.__b=null});e=o._suspenders.pop();)e.forceUpdate()}},_=!0===t.__h;o.__u++||_||o.setState({__e:o.__b=o.__v.__k[0]}),e.then(s,s)},We.prototype.componentWillUnmount=function(){this._suspenders=[]},We.prototype.render=function(e,t){if(this.__b){if(this.__v.__k){const e=document.createElement("div"),t=this.__v.__k[0].__c;this.__v.__k[0]=qe(this.__b,e,t.__O=t.__P)}this.__b=null}const n=t.__e&&p(d,null,e.fallback);return n&&(n.__h=null),[p(d,null,t.__e?null:e.children),n]};ue&&"undefined"!=typeof customElements&&customElements.define("preact-hydrator",class extends HTMLElement{connectedCallback(){if(!this.parentNode)return;const e=this.getAttribute("href");if(!e)return;const[t,n]=e.split("#"),o=this.getAttribute("id");let r;try{r=this.firstElementChild?.textContent?JSON.parse(this.firstElementChild.textContent):void 0}catch(_){}const l=[];let s=this;for(;s=s?.previousSibling;)if(8!==s.nodeType)l.unshift(s);else if(s.data===o)break;const i=((e,t)=>{const n=e;{const o=Array.isArray(t)?t:[t],r=o[o.length-1].nextSibling;n.__k={firstChild:o[0],nodeType:1,parentNode:e,childNodes:o,insertBefore:(t,n)=>{e.insertBefore(t,n||r)},appendChild:t=>{e.insertBefore(t,r)},removeChild:t=>{e.removeChild(t)}}}return n.__k})(this.parentNode,l);new Function("s","return import(s)")(t).then((e=>(L(p((n?e[n]:void 0)||e.default,r,[]),i),null))).catch((e=>{}))}});const Me={};const je=p(class extends f{shouldComponentUpdate(){return!1}componentDidCatch(e){e===Me&&(this.__d=!0)}render(){return p(Ke,null,null)}},null,[]),Ke=e=>{throw Me},Ye=ue?1e3:0,Ge="/preact-wmr-twind-zero/",Ve=ue?document.querySelector("script[type=isodata]"):void 0,Je=!ue||!!Ve,Xe="KEYBOARD_INTERACT",Ze=async e=>new Promise((t=>{setTimeout((()=>{t(`Fulfilled: ${e} ${ue?"CLIENT":"SERVER"}`)}),1e3)})),Qe=e=>{const t=Ie(Ze,[111],"my cache key");return B`<p>${t}</p>`},et=e=>B`<section><h2>Routed → Home</h2><p class="non-twind-class-token text-black bg-yellow-400 text-3xl"> This text has a <strong>yellow-400</strong> background (unique to this paragraph, not shared with any other route or component) </p><${We} fallback=${B`<p>SUSPENSE CACHE...</p>`}><${Qe}/><//><div class="test-scope"><p> this is a paragraph <span class="child-span"> with a <span>child</span> span </span>  element. </p><h4>heading</h4></div></section>`,tt=ue?window:{},nt=e=>{const t=te(!1);Q((()=>{t.current=!0}),[]);const n=tt.PREACTWMR_HYDRATED;return ue&&Je&&(!n||t.current)?(console.log(`NO_HYDRATE: ${e.label} (hydrated: ${String(n)}, hasRenderedAtLeastOnce: ${String(t.current)})`),je):B`<div class="bg-pink-200 border-pink-800 border-2 border-solid rounded" data-static-no-hydrate><div>${`hasRenderedAtLeastOnce: ${String(t.current)} (${e.label})`}</div>${e.children}</div>`},ot=ge((()=>new Promise((e=>{setTimeout((()=>{e(import("./chunks/island.11905785.js"))}),Ye)})))),rt=e=>B`<${ke} onError=${e=>{console.log("ErrorBoundary onError (SuspendedStaticNoHydrate): ",e)}}><${ot}/><//>`,lt=e=>B`<section><h2>Routed → Non Lazy</h2><p class="bg-yellow-600 text-3xl"> This text has a <strong>yellow-600</strong> background (unique to this paragraph, not shared with any other route or component) </p><p class="text-4xl"> This text has a <strong>text-4xl</strong> size (unique to this paragraph, not shared with any other route or component) </p><${nt} label="4"><p> STATIC NO HYDRATE (HTML/JSX component below is not shipped to client via the Javascript bundle on initial hydration, as it is considered static during pre-rendering. However the JS async component is lazy-loaded at subsequent route changes (SPA) </p><${rt}/><//></section>`,st=function(e){let t,n,o;function r(r){if(t||(t=e(),t.then((e=>{n=e.default||e}),(e=>{o=e}))),o)throw o;if(!n)throw t;return p(n,r)}return r.displayName="Lazy",r.__f=!0,r}((()=>new Promise((e=>{setTimeout((()=>{e(import("./chunks/island.e5b2c080.js"))}),Ye)})))),it=e=>{const t="text-blue-500 bg-pink-400 text-3xl";return B`<${ke} onError=${e=>{console.log("ErrorBoundary onError (SuspendedLazy): ",e)}}><${We} data-tw=${t} fallback=${B`<${me} name="second slot"><p>(lifecycle: DURING-only lazy dynamic import, suspense fallback)</p><p><strong>Slot Content (1)</strong></p><p class="text-blue-500"><strong>Slot Content (2)</strong></p><//><p class=${"text-blue-500 bg-pink-400 text-3xl"}>LOADING...</p>`}><${st}/><//><//>`},_t=e=>{const[t,n]=X(!1);return B`${t?B`<${me} name="first slot"><p>(lifecycle: DURING and AFTER lazy dynamic import)</p><p>Slot Content (1)</p><p class="text-blue-400">Slot Content (2)</p><//><${it}/>`:B`<button data-tw="text-blue-400" class="m-2 p-2 border-purple-500 border-2 border-dotted rounded" onClick=${()=>{n(!0)}}> CLICK HERE TO LAZY-LOAD </button><span class=${"before:content-['zob']"}>(1s simulated network delay on first load, then "cache" hit)</span>`}`},ct=e=>B`<section><h2>Routed → Route</h2><p class=${"\n        \n        text-black\n        \n         bg-yellow-700 bg-yellow-700"} className="text-6xl"> This text has a <strong>yellow-700</strong> background (unique to this paragraph, not shared with any other route or component) </p><p class="~(!text-center,hover:underline,cursor-pointer,text-red-800,bg-green-50,hover:!bg-red-100,w-1/2,ml-11)"> This text has a unique custom Twind "shortcut" class based on the combination of the following utility styles: <strong>!text-center hover:underline cursor-pointer text-red-800 bg(green-50 !hover:red-100) w-1/2 ml-11</strong>. </p><${_t}/></section>`,ut=e=>B`<${ke} onError=${e=>{console.log("ErrorBoundary onError (sub router): ",e)}}><${Te}><${it} path=${"/lazy"+(Je?"/":"")}/><${ot} path=${"/static-no-hydrate"+(Je?"/":"")}/><//><//>`;console.log(ye()),console.log(ye()),console.log("other foo"),console.log("other foo"),console.log("foo");const at=ue?window:{},pt=ge((()=>new Promise((e=>{setTimeout((()=>{e(import("./chunks/lazy.4898eaf1.js"))}),Ye)})))),ht=({prerenderIndex:e})=>{const[t,n]=X(!1),o="text-red-600";return B`<${Ee}><${he}><${nt} label="1"><p> .STATIC NO HYDRATE (in dev mode, this should be -1, in a prerendered build, this should be a fixed number corresponding to the SSG sequence index, NOT 999 which would otherwise indicate that the fragment has incorrectly been hydrated) </p><p>prerenderIndex: ${e}</p><//><h1>Router status:</h1><p class="text-text-3xl text-white p-1.5 bg-pink-600">${t?"SPA route (post-hydration)":"Initial route (static SSR / SSG)"}</p><${nt} label="2"><p>STATIC NO HYDRATE</p><span class=${t?o:"text-green-600"} data-tw=${o}>${t?"[onRouteChangeWasCalled] (this should NEVER display in prerender builds (does show in dev mode))":"[!onRouteChangeWasCalled] (this should ALWAYS display in prerender builds (does show in dev mode))"}</span><//><h1>Router links:</h1><ul><li><span class="text-yellow-400 inline-block mr-1.5"> ███ </span><a href=${`${Ge}?param=home#hash-home`}>Routed Home</a></li><li><span class="text-yellow-500 inline-block mr-1.5"> ███ </span><a href=${`${Ge}routed-lazy${Je?"/":""}?param=lazy#hash-lazy`}>Routed Lazy</a> (1s simulated network delay on first load, then "cache" hit) </li><li><span class="text-yellow-600 inline-block mr-1.5"> ███ </span><a href=${`${Ge}routed-non-lazy${Je?"/":""}?param=non-lazy#hash-non-lazy`}> Routed Non Lazy </a></li><li><span class="text-yellow-700 inline-block mr-1.5"> ███ </span><a href=${`${Ge}routed-route${Je?"/":""}?param=route#hash-route`}>Routed Route</a>  (contains lazy component and triggers slots / named portals) </li></ul><h1>First Slot:</h1><hr/><${de} name="first slot"/><hr/><h1>Second Slot:</h1><hr/><${de} name="second slot"/><hr/><h1>Router content:</h1><div class="border-pink-600 border-4 border-solid rounded"><${ke} onError=${e=>{console.log("ErrorBoundary onError (top router): ",e)}}><${Te} onRouteChange=${()=>{n(!0)}}><${et} path=${`${Ge}`}/><${pt} path=${`${Ge}routed-lazy${Je?"/":""}`}/><${lt} path=${`${Ge}routed-non-lazy${Je?"/":""}`}/><${Re} component=${ct} path=${`${Ge}routed-route${Je?"/":""}`}/><${Le} default/><${ut} path=${`${Ge}suspended/*`}/><//><//></div><h1>Twind critical/secondary stylesheet tests:</h1><p class=${"text-3xl"}> This paragraphs and others located in different routes share the same <strong>text-3xl</strong> Twind style, but it isn't duplicated in the pre-rendered "secondary" stylesheet, it is hoisted in the "critical" styles. </p><p class="text-black bg-yellow-200"> This text has a <strong>yellow-200</strong> background (unique to this paragraph, not shared with any other route or component) </p><h1>404 Not Found links:</h1><ul><li><span class="text-yellow-300 inline-block mr-1.5"> ███ </span><a href=${`${Ge}not-found-blank`} rel="noreferrer noopener" target="_BLANK"> 404 (target BLANK) </a></li><li><span class="text-yellow-300 inline-block mr-1.5"> ███ </span><a href=${`${Ge}not-found-inpage`} target="_top"> 404 (in page) </a></li></ul><//><//>`};ue&&(document.documentElement.addEventListener("mousedown",(e=>{document.documentElement.classList.remove("KEYBOARD_INTERACT")}),!0),document.addEventListener("keydown",(e=>{document.documentElement.classList.add("KEYBOARD_INTERACT")}),{once:!1,passive:!1,capture:!0}),document.addEventListener("keyup",(e=>{document.documentElement.classList.add("KEYBOARD_INTERACT")}),{once:!1,passive:!1,capture:!0}),Je&&(He(),function(e,t){if("undefined"==typeof window)return;let n=document.querySelector("script[type=isodata]");t=t||n&&n.parentNode||document.body,!ve&&n?L(e,t):H(e,t),ve=!0}(B`<${ht} prerenderIndex=${999}/>`,document.body),at.PREACTWMR_HYDRATED=!0));let dt=0;async function ft(e){const{preactWmrPrerenderForTwind:t}=await import("./chunks/prerender.43e3fb39.js"),n=await t(e.url,B`<${ht} prerenderIndex=${dt++}/>`,{props:e}),o=new Set([{type:"meta",props:{property:"og:title",content:"SEO title"}},{type:"style",props:{id:n.cssId,children:n.cssTextContent}},{type:"script",props:{type:"text/javascript",children:'if (!window.location.pathname.endsWith("/") && !/\\.html?/.test(window.location.pathname)) { window.location = window.location.origin + window.location.pathname + "/" + window.location.search + window.location.hash; }'}}]);return{html:n.html,links:n.links,data:{...e},head:{elements:o}}}export{ht as App,D as B,Xe as K,nt as S,rt as a,me as b,d,He as i,t as l,B as m,ft as prerender,p as v};