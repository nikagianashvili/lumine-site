import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Mirrors vercel.json / public/.htaccess clean-URL rewrites for the dev
// server. Without this, most /ka/* routes happen to resolve anyway because
// their path matches a real file once ".html" is appended, but bare "/ka"
// (the logo/home link on every Georgian page) has no such file — Vite's
// SPA fallback then silently serves the English index.html instead.
const CLEAN_ROUTES = {
  "/work": "/work.html",
  "/work/tbilisi-zoo": "/work-tbilisi-zoo.html",
  "/sample-project": "/sample-project.html",
  "/project": "/project.html",
  "/studio": "/studio.html",
  "/services": "/services.html",
  "/services/strategy": "/services/strategy.html",
  "/services/photography": "/services/photography.html",
  "/services/video": "/services/video.html",
  "/services/brand": "/services/brand.html",
  "/services/smm": "/services/smm.html",
  "/services/marketing": "/services/marketing.html",
  "/services/web": "/services/web.html",
  "/services/ai": "/services/ai.html",
  "/services/printing": "/services/printing.html",
  "/pricing": "/pricing.html",
  "/questions": "/questions.html",
  "/journal": "/journal.html",
  "/legal": "/legal.html",
  "/contact": "/contact.html",
  "/admin": "/admin.html",
  "/admin-login": "/admin-login.html",
  "/portal": "/portal.html",
  "/portal-login": "/portal-login.html",
  "/ka": "/ka/index.html",
  "/ka/work": "/ka/work.html",
  "/ka/work/tbilisi-zoo": "/ka/work-tbilisi-zoo.html",
  "/ka/sample-project": "/ka/sample-project.html",
  "/ka/project": "/ka/project.html",
  "/ka/studio": "/ka/studio.html",
  "/ka/services": "/ka/services.html",
  "/ka/services/strategy": "/ka/services/strategy.html",
  "/ka/services/photography": "/ka/services/photography.html",
  "/ka/services/video": "/ka/services/video.html",
  "/ka/services/brand": "/ka/services/brand.html",
  "/ka/services/smm": "/ka/services/smm.html",
  "/ka/services/marketing": "/ka/services/marketing.html",
  "/ka/services/web": "/ka/services/web.html",
  "/ka/services/ai": "/ka/services/ai.html",
  "/ka/services/printing": "/ka/services/printing.html",
  "/ka/pricing": "/ka/pricing.html",
  "/ka/questions": "/ka/questions.html",
  "/ka/journal": "/ka/journal.html",
  "/ka/legal": "/ka/legal.html",
  "/ka/contact": "/ka/contact.html",
};

function devCleanUrls() {
  return {
    name: "dev-clean-url-rewrites",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [rawPath, query] = req.url.split("?");
        // "/ka/" and "/ka" are the same route; "/" must stay "/"
        const path =
          rawPath.length > 1 ? rawPath.replace(/\/+$/, "") || "/" : rawPath;

        const target = CLEAN_ROUTES[path];
        if (target) {
          req.url = query ? `${target}?${query}` : target;
          return next();
        }

        /* Match production for unknown routes. Vite's SPA fallback otherwise
           serves index.html with a 200 for anything it does not recognise, so
           a typo'd URL silently renders the English home page and the 404 can
           never be seen or tested locally. Vercel serves dist/404.html for
           these, so the dev server does the same — and with a real 404 status,
           which the fallback does not give.

           Everything that legitimately has no CLEAN_ROUTES entry has to be
           let through first: the site root, anything with a file extension,
           Vite's own internals, the API, and the two React panels, which route
           their sub-paths on the client and genuinely do need the fallback. */
        const isSpa = /^\/(admin|portal)(\/|$)/.test(path);
        const isPage =
          req.method === "GET" &&
          path !== "/" &&
          !isSpa &&
          !path.startsWith("/@") &&
          !path.startsWith("/src") &&
          !path.startsWith("/node_modules") &&
          !path.startsWith("/api") &&
          !/\.[a-z0-9]+$/i.test(path) &&
          (req.headers.accept || "").includes("text/html");

        if (isPage) {
          req.url = "/404.html";
          /* Assigning res.statusCode here does not survive: Vite's own HTML
             middleware serves the transformed page and sets 200 on the way
             out, so the dev server would answer a miss with "200 Page Not
             Found" — the soft 404 this is meant to remove. Pinning the
             property is what actually holds. */
          Object.defineProperty(res, "statusCode", {
            get: () => 404,
            set: () => {},
            configurable: true,
          });
        }
        next();
      });
    },
  };
}

export default defineConfig({
  // react() + tailwindcss() only activate for files that opt in (.tsx
  // imports, `@import "tailwindcss"` in a stylesheet) — the vanilla public
  // pages and the old admin.css never reference either, so they're
  // unaffected. Scoped to /admin's rebuild only.
  plugins: [devCleanUrls(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/admin"),
      "@portal": resolve(__dirname, "src/portal"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        /* Vercel serves dist/404.html automatically for any path that matches
           no rewrite and no file, so this only has to be built — it needs no
           entry in vercel.json. It carries both locales itself. */
        "404": resolve(__dirname, "404.html"),
        work: resolve(__dirname, "work.html"),
        "work-tbilisi-zoo": resolve(__dirname, "work-tbilisi-zoo.html"),
        "sample-project": resolve(__dirname, "sample-project.html"),
        project: resolve(__dirname, "project.html"),
        studio: resolve(__dirname, "studio.html"),
        services: resolve(__dirname, "services.html"),
        "services-strategy": resolve(__dirname, "services/strategy.html"),
        "services-photography": resolve(__dirname, "services/photography.html"),
        "services-video": resolve(__dirname, "services/video.html"),
        "services-brand": resolve(__dirname, "services/brand.html"),
        "services-smm": resolve(__dirname, "services/smm.html"),
        "services-marketing": resolve(__dirname, "services/marketing.html"),
        "services-web": resolve(__dirname, "services/web.html"),
        "services-ai": resolve(__dirname, "services/ai.html"),
        "services-printing": resolve(__dirname, "services/printing.html"),
        pricing: resolve(__dirname, "pricing.html"),
        questions: resolve(__dirname, "questions.html"),
        journal: resolve(__dirname, "journal.html"),
        legal: resolve(__dirname, "legal.html"),
        contact: resolve(__dirname, "contact.html"),
        admin: resolve(__dirname, "admin.html"),
        "admin-login": resolve(__dirname, "admin-login.html"),
        portal: resolve(__dirname, "portal.html"),
        "portal-login": resolve(__dirname, "portal-login.html"),
        "ka-main": resolve(__dirname, "ka/index.html"),
        "ka-work": resolve(__dirname, "ka/work.html"),
        "ka-work-tbilisi-zoo": resolve(__dirname, "ka/work-tbilisi-zoo.html"),
        "ka-sample-project": resolve(__dirname, "ka/sample-project.html"),
        "ka-project": resolve(__dirname, "ka/project.html"),
        "ka-studio": resolve(__dirname, "ka/studio.html"),
        "ka-services": resolve(__dirname, "ka/services.html"),
        "ka-services-strategy": resolve(__dirname, "ka/services/strategy.html"),
        "ka-services-photography": resolve(__dirname, "ka/services/photography.html"),
        "ka-services-video": resolve(__dirname, "ka/services/video.html"),
        "ka-services-brand": resolve(__dirname, "ka/services/brand.html"),
        "ka-services-smm": resolve(__dirname, "ka/services/smm.html"),
        "ka-services-marketing": resolve(__dirname, "ka/services/marketing.html"),
        "ka-services-web": resolve(__dirname, "ka/services/web.html"),
        "ka-services-ai": resolve(__dirname, "ka/services/ai.html"),
        "ka-services-printing": resolve(__dirname, "ka/services/printing.html"),
        "ka-pricing": resolve(__dirname, "ka/pricing.html"),
        "ka-questions": resolve(__dirname, "ka/questions.html"),
        "ka-journal": resolve(__dirname, "ka/journal.html"),
        "ka-legal": resolve(__dirname, "ka/legal.html"),
        "ka-contact": resolve(__dirname, "ka/contact.html"),
      },
    },
    assetsInclude: [
      "**/*.jpeg",
      "**/*.jpg",
      "**/*.png",
      "**/*.svg",
      "**/*.gif",
    ],
    copyPublicDir: true,
  },
});
