# Twind integration in Preact WMR (SSG / static SSR) with zero CSS-in-JS runtime

## Zero-runtime Twind?

The treemap graphics below were generated using Preact WMR's `--visualize` option (size comparisons with `gzip` compression). This bundle snapshot is a striking illustration of how webpages can benefit from eliminating Twind in the client runtime, BUT in fairness, this also gives a grossly exaggerated impression due to the relative size of dependencies in my minimal demo! In a real-worl full-size website, the impact of removing Twind's runtime will certainly not be as striking. That being said, read on for more information about "critical" vs. "secondary" CSS stylesheets, which is another strategy used to speed-up initial load times.

Technical note: we use Preact WMR's built-in support for code splitting (i.e. dynamic await module import), in order to isolate Twind and its dependencies into their own Javascript bundle. We only load this Twind runtime code in development mode (i.e. WMR server, instant on-demand incremental compilation of Javascript / Typescript modules), or at build time during the prerender pass (static SSR / SSG). At production runtime, the generated Twind bundle is not downloaded by the client. It stays on the server because Twind's Just-In-Time and CSS-in-JS features were executed during the build process and are not needed during client-side hydration. Read on for more information about the techniques used to achieve this ... and their caveats.

### Before optimisation (Twind JS included in client bundle)

![Before optimisation: client side Javscript bundle contains Twind runtime)](./doc/twind-bundle-before.png)

### After optimisation (Twind runtime only in server bundle)

![After optimisation: Twind runtime moved to server side Javscript bundle)](./doc/twind-bundle-after.png)

## Background Information

* **Preact WMR** https://github.com/preactjs/wmr/
* **Twind** https://github.com/tw-in-js/twind/

(original stream of consciousness in this discussion thread: https://github.com/tw-in-js/twind/discussions/147 )

This project aims to solve a very particular problem, it is not a general-purpose SSR/SSG solution. Caveat emptor :)

The basic premise of Preact WMR's prerendering method is that each statically SSR'ed / SSG'ed HTML page is a distinct "entry point" into a complete website. Once a content route gets hydrated on the client / by the web browser, the page becomes a SPA inside which other routes are resolved without actual network requests to their server URL endpoints (until the next "hard" page reload, of course). Preact WMR's isomorphic router also supports "lazy" / dynamic component imports based on the same principle as React's Suspense (i.e. thrown Promises). The use of awaited imports enables code splitting, which consequently minimises the footprint of the initial web app "shell". Preact WMR's server-side prerender build process is capable of awaiting lazy routes in order to generate their static rendition, whilst the client-side hydrated SPA implements deferred code bundle fetch and execution.

Twind's main appeal is that ; unlike - the early versions of - Tailwind ; it is primarily designed for "just in time" generation of a page's CSS stylesheet, based on usage of utility classes. Twind also offers several powerful CSS-in-JS features which help create a logical, composable and scalable organisation of component styles. By default, Twind's runtime is therefore required in web pages. That's absolutely fine in most cases, as Twind is relativaly lightweight given its feature set, and the runtime computations are fast. Plus, only required / actually-used CSS rules are dynamically generated into the "live" CSSOM stylesheet (no "purging" overhead).

It makes total sense to leverage Twind's "JIT" qualities during development (especially with Preact WMR's dev server), but I wanted to explore techniques that would allow me to reliably eliminate Twind in production builds ("reliably" === without leaving behind some unprocesed styles, e.g. dynamic component styles).

So, this small Preact WMR + Twind experiment demonstrates a set of techniques that achieve the following goals:

1) negate the need for Twind's client-side Javascript runtime in the HTML pages pre-rendered by Preact WMR on the server at build time (i.e. SSG / whole-site static SSR).
2) statically generate "critical" styles as an inline CSS stylesheet (i.e. in the document head), and "secondary" styles as a separate CSS stylesheet (i.e. external browser fetch, subject to HTTP cache etc.).

The CSS styles deemed "critical" are those required to render the current static route. The "secondary" stylesheet is populated with all the other styles that the SPA might need when the user navigates to another client-side route. The "critical" stylesheet is granted a high priority during the early browser loading stages, by virtue of being embedded directly in the document head. The "secondary" stylesheet (pre)loads in the background / asynchronously, to avoid blocking the main render thread. This is orchestrated by simple markup in each `index.html` route pages, and a tiny line of Javascript that signals the activation of the stylesheet so that the browser consumes it.

Here is a super-reduced network waterfall and performance flamechart report that illustrate the principle (note the parallelised fetch of JS and secondary CSS, relative to the timing of web vitals):

![HTML, CSS, JS network waterfall](./doc/PreactWMRTwind-NetworkWaterfall.png)

![HTML, CSS, JS network waterfall and performance flamechart](./doc/PreactWMRTwind-NetworkWaterfall-FlameChart.png)

Side note: multiple "secondary" stylesheets (i.e. individual payloads bound to dynamic components or routes) are currently not supported. With static SSR / SSG, we work on the assumption that the static entry point / HTML page requires its "critical" styling, and that from the moment the SPA is hydrated, we cannot predict which route / dynamic component will be loaded next. So we bundle the remainder CSS rules in the "secondary" stylesheet. Although we eliminate duplicates (i.e. shared utility classes), this "secondary" stylesheet covers the rest of the website so it can potentially grow large. We could of course segragate styling rules for each route / dynamic component, but this would likely introduce duplication (one of the "selling points" of utility classes is that they are very likely shared amongst components).

One obvious caveat when using this zero-runtime Twind integration recipe is that it works with dynamic class names / parameterized tokens only if they can predictably be enumerated during server-side pre-rendering. For example, if a button has "pressed" and "keyboard focused" states (aka. style variants) that can be expressed declaratively, then an enumeration of all possible states must be used to precompute the corresponding Twind classes, and to statically generate the required styles into the target stylesheet.

## Demonstration / test bed

This repository contains a minimal demo which makes it easy to manually inspect the generated HTML / CSS / JS:

* **Browse files:** https://github.com/danielweck/preact-wmr-twind-zero/tree/main/dist
* **View pages:** https://raw.githack.com/danielweck/preact-wmr-twind-zero/main/dist/index.html
* **Source code:** https://github.com/danielweck/preact-wmr-twind-zero/tree/main/public

## DOCUMENTATION TODO

1) Explain how the custom Preact 'options' VNode interceptor is used to invoke Twind's `tw()` and `shortcut()` functions in "dev" mode and during Preact WMR's prerender build step, after the Twind WMR plugin has transformed tagged template literals to resolved Twind objects (that is the key technique which makes all the difference with other "static extraction" methods) Code references: https://github.com/danielweck/preact-wmr-twind-zero/blob/main/wmr-plugin-twind.mjs and https://github.com/danielweck/preact-wmr-twind-zero/blob/main/public/preact-vnode-options-hook--twind.ts and https://github.com/danielweck/preact-wmr-twind-zero/blob/main/public/preact-vnode-options-hook.ts
2) Demonstrate Suspense / lazy components, other that Preact WMR's lazy routes (i.e.dynamic imports too, but for components in the render tree within already-loaded routes).
3) Document edge cases with nested / recursive (tagged) template literals.
4) Provide an example of predictable enumeration of possible dynamic Twind classes / declarative variants, and include a technical solution in the demo (Preact Context just like in my old pre-V1 code?).

## Quick Start

* `npm install`

### Static SSR / SSG prerender:

* `npm run build` (if "segfault", try again ... this is a known Preact WMR bug with Node 16)
* `npm run serve` (web browser at `http://127.0.0.1:8080`)

### Dev server:

* `npm run start` (web browser at `http://127.0.0.1:8080`)
