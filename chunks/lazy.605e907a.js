import{m as t,S as e,a as o}from"../index.27688638.js";const a=a=>t`<section><h2>Routed → Lazy</h2><p class="text-black bg-yellow-500 text-3xl">This text has a <strong>yellow-500</strong> background (unique to this paragraph, not shared with any other route or component)</p><p class="text-2xl">This text has a <strong>text-2xl</strong> size (unique to this paragraph, not shared with any other route or component)</p><${e} label="3"><p>STATIC NO HYDRATE (HTML/JSX component below is not shipped to client via the Javascript bundle on initial hydration, as it is considered static during pre-rendering. However the JS async component is lazy-loaded at subsequent route changes (SPA)</p><${o}/><//></section>`;export default a;export{a as RoutedLazy};