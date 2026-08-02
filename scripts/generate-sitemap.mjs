/* Builds public/sitemap.xml from the deployment's own route table.

   The hand-maintained sitemap had drifted badly: it listed 18 URLs for a
   site with 44 public routes, and the two best pages on it — the Questions
   page and the Tbilisi Zoo case study — were both missing, along with every
   one of the nine service pages in both languages. A list nobody remembers
   to update is worse than no list, because it looks maintained.

   So it is derived rather than written. vercel.json is the thing that
   actually decides what URLs exist in production, which makes it the only
   honest source for what belongs in a sitemap. Add a route there and it
   appears here on the next build; forget to, and it was never reachable
   anyway.

   Run by `npm run build` via prebuild. */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

/* One constant, because the site has no domain of its own yet. Every page's
   canonical currently claims lumine.ge while robots.txt and this file say
   vercel.app — when the real domain lands, that disagreement has to be
   settled here and in the page <head>s at the same time. */
const ORIGIN = "https://lumine-site.vercel.app";

/* Kept out of the index on purpose:
   - admin / portal        private, and already Disallow-ed in robots.txt
   - project               a template; it renders nothing without ?slug=
   - sample-project        a build demo, not real work */
const PRIVATE = /^\/(admin|admin-login|portal|portal-login)$/;
const NOT_CONTENT = /^\/(ka\/)?(project|sample-project)$/;

const vercel = JSON.parse(readFileSync(resolve(root, "vercel.json"), "utf8"));

const routes = [
  "/",
  ...vercel.rewrites
    .map((r) => r.source)
    .filter((s) => !PRIVATE.test(s) && !NOT_CONTENT.test(s)),
];

const seen = new Set();
const urls = routes.filter((r) => !seen.has(r) && seen.add(r));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((r) => `  <url><loc>${ORIGIN}${r === "/" ? "/" : r}</loc></url>`).join("\n")}
</urlset>
`;

writeFileSync(resolve(root, "public/sitemap.xml"), xml, "utf8");
console.log(`sitemap: ${urls.length} routes -> public/sitemap.xml`);
