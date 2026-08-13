import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BomuEZbI.mjs';
import { manifest } from './manifest_DBWE4CIw.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/admin.astro.mjs');
const _page3 = () => import('./pages/api/admin/guests.astro.mjs');
const _page4 = () => import('./pages/api/rsvp.astro.mjs');
const _page5 = () => import('./pages/invitacion/_slug_.astro.mjs');
const _page6 = () => import('./pages/save-the-date.astro.mjs');
const _page7 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/admin.astro", _page2],
    ["src/pages/api/admin/guests.ts", _page3],
    ["src/pages/api/rsvp.ts", _page4],
    ["src/pages/invitacion/[slug].astro", _page5],
    ["src/pages/save-the-date.astro", _page6],
    ["src/pages/index.astro", _page7]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "c808458a-5845-41ff-92e7-d945740cda5d",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
