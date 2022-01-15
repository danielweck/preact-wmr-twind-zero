# Twind integration in Preact WMR (SSG / static SSR) with zero CSS-in-JS runtime

## Background Information

* **Preact WMR** https://github.com/preactjs/wmr/
* **Twind** https://github.com/tw-in-js/twind/

(original stream of consciousness in this discussion thread: https://github.com/tw-in-js/twind/discussions/147 )

The basic premise of Preact WMR's prerendering method is that each statically SSR'ed / SSG'ed HTML page is a distinct "entry point" into the complete website. Once such a page route is hydrated, it becomes a SPA from which other routes are resolved client-side (i.e. no server-side route fetch until the next "hard" page reload). Preact WMR's isomorphic router also supports "lazy" / dynamic component imports, which enables code splitting and as such lightens the load of the initial web app "shell" (on-demand route code bundle fetch).

Twind's principal appeal is that (unlike Tailwind) it is primarily designed for "just in time" production of CSS stylesheet based on class / token usage. Twind also offers several powerful CSS-in-JS features which help create a logical, composable and scalable organisation of component styles. By default, Twind's runtime is therefore required in web pages.

This small PreactWMR + Twind experiment demonstrates a set of techniques that achieve the following goals:

1) negate the need for Twind's client-side Javascript runtime in the HTML pages pre-rendered on the server by Preact WMR (aka. SSG / whole-site static SSR) ...
2) ... by statically generating "critical" styles as an inline CSS stylesheet (i.e. in the document head), and "secondary" styles as a separate CSS stylesheet (i.e. external browser fetch, subject to HTTP cache etc.).

The CSS styles deemed "critical" are those required to render the current static route. The "secondary" stylesheet is populated with all the other styles that the SPA might need when the user navigates to another client-side route. The "critical" stylesheet is granted a high priority during the early browser loading stages, by virtue of being embedded directly in the document head. The "secondary" stylesheet (pre)loads in the background / asynchronously, to avoid blocking the main render thread. This is orchastrated by simple markup in each `index.html` route pages, and a tiny line of Javascript that signals the activation of the stylesheet so that the browser consumes it.

The obvious caveat when using this zero-runtime Twind integration recipe is that it works with dynamic class names / parameterized tokens only if they can predictably be enumerated during server-side pre-rendering. For example, if a button has "pressed" and "keyboard focused" states (aka. style variants) that can be expressed declaratively, then a server-side enumeration of all the possible states can be used to precompute the corresponding Twind classes and to statically generate the required styles into the target stylesheet.

This repository contains a minimal demo which makes it easy to manually inspect the generated HTML / CSS / JS:

* **Browse files:** https://github.com/danielweck/preact-wmr-twind-zero/tree/main/dist
* **View pages:** https://raw.githack.com/danielweck/preact-wmr-twind-zero/main/dist/index.html

## DOCUMENTATION TODO

1) Explain how the custom Preact 'options' VNode interceptor is used to invoke Twind's `tw()` and `apply()` functions in "dev" mode and during Preact WMR's prerender build step, after the Twind WMR plugin has transformed tagged template literals to resolved Twind objects (that is the key technique which makes all the difference with other "static extraction" methods)
2) Demonstrate Suspense (similar to lazy routes / dynamic imports, but for components within already-loaded routes)
3) Document edge cases with nested / recursive (tagged) template literals.
4) Provide an example of predictable enumeration of possible dynamic Twind classes / declarative variants, and include a technical solution in the demo (Preact Context?).
5) MIGRATE TO TWIND v1! :)   ---  (I should probably do this before introducing more complex logic which will inevitably be based on obsolete APIs)

## Quick Start

* `npm install`

### Static SSR / SSG prerender:

* `npm run build` (if "segfault" / `SIGEV`, try again, this is a Node 16 bug with Preact WMR)
* `npm run serve` (web browser at `http://127.0.0.1:8080`)

### Dev server:

* `npm run start` (web browser at `http://127.0.0.1:8080`)
