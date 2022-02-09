import {m}from'../index.6a42152c.js';const SuspendedStaticNoHydrateComp = (_props) => {
	return (
		m`<p dir="rtl" class="is-rtl:font-bold is-rtl:text-6xl"> RTL (bold) </p><p><button class=${'text-red-400'} onClick=${() => {
						alert('BUTTON CLICK: should only show in dev mode, no in pre-rendered build');
					}}> CLICK HERE TO TEST "StaticNoHydrate" (window.alert() should only work in dev mode, no in pre-rendered build) </button></p>`
	);
};export default SuspendedStaticNoHydrateComp;export{SuspendedStaticNoHydrateComp};