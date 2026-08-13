import { e as createComponent, f as createAstro, h as addAttribute, l as renderHead, p as renderSlot, n as renderScript, r as renderTemplate } from './astro/server_Dt6Kf5jJ.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title = "Boda Cesia & Luis \u2014 20 de Febrero 2027" } = Astro2.props;
  const description = "Celebramos nuestro amor. Acomp\xE1\xF1anos el 20 de febrero de 2027 en Casa Venuat, Valle de \xC1ngeles, Honduras.";
  const ogImage = "/images/optimos/_DSC3356.webp";
  return renderTemplate`<html lang="es" class="scroll-smooth"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(description, "content")}><meta name="robots" content="noindex, nofollow"><!-- Open Graph --><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(ogImage, "content")}><meta property="og:type" content="website"><!-- Favicon --><link rel="icon" type="image/svg+xml" href="/favicon.svg"><!-- Fonts: preload para evitar FOIT --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Great+Vibes&family=Lora:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"><title>${title}</title>${renderHead()}</head> <body class="bg-wedding-cream font-body antialiased overflow-x-hidden"> ${renderSlot($$result, $$slots["default"])}  ${renderScript($$result, "/Users/lavg98/Documents/GitHub/personal/InvitacionBodaLC/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")}</body></html>`;
}, "/Users/lavg98/Documents/GitHub/personal/InvitacionBodaLC/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
