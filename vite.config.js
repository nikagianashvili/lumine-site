import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Mirrors vercel.json / public/.htaccess clean-URL rewrites for the dev
// server. Without this, most /ka/* routes happen to resolve anyway because
// their path matches a real file once ".html" is appended, but bare "/ka"
// (the logo/home link on every Georgian page) has no such file — Vite's
// SPA fallback then silently serves the English index.html instead.
const CLEAN_ROUTES = {
  "/work": "/work.html",
  "/sample-project": "/sample-project.html",
  "/project": "/project.html",
  "/studio": "/studio.html",
  "/services": "/services.html",
  "/pricing": "/pricing.html",
  "/journal": "/journal.html",
  "/legal": "/legal.html",
  "/contact": "/contact.html",
  "/admin": "/admin.html",
  "/admin-login": "/admin-login.html",
  "/ka": "/ka/index.html",
  "/ka/work": "/ka/work.html",
  "/ka/sample-project": "/ka/sample-project.html",
  "/ka/project": "/ka/project.html",
  "/ka/studio": "/ka/studio.html",
  "/ka/services": "/ka/services.html",
  "/ka/pricing": "/ka/pricing.html",
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
        const [path, query] = req.url.split("?");
        const target = CLEAN_ROUTES[path];
        if (target) req.url = query ? `${target}?${query}` : target;
        next();
      });
    },
  };
}

function copyToDist() {
  return {
    name: "copy-non-bundled-js-assets",
    apply: "build",
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const distJsDir = resolve(distDir, "js");

      fs.mkdirSync(distJsDir, { recursive: true });

      fs.copyFileSync(
        resolve(__dirname, "js/wrappedgl.js"),
        resolve(distJsDir, "wrappedgl.js"),
      );
      fs.copyFileSync(
        resolve(__dirname, "js/simulator.js"),
        resolve(distJsDir, "simulator.js"),
      );

      fs.cpSync(
        resolve(__dirname, "js/shaders"),
        resolve(distJsDir, "shaders"),
        {
          recursive: true,
        },
      );
    },
  };
}

export default defineConfig({
  // react() + tailwindcss() only activate for files that opt in (.tsx
  // imports, `@import "tailwindcss"` in a stylesheet) — the vanilla public
  // pages and the old admin.css never reference either, so they're
  // unaffected. Scoped to /admin's rebuild only.
  plugins: [copyToDist(), devCleanUrls(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/admin"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        work: resolve(__dirname, "work.html"),
        "sample-project": resolve(__dirname, "sample-project.html"),
        project: resolve(__dirname, "project.html"),
        studio: resolve(__dirname, "studio.html"),
        services: resolve(__dirname, "services.html"),
        pricing: resolve(__dirname, "pricing.html"),
        journal: resolve(__dirname, "journal.html"),
        legal: resolve(__dirname, "legal.html"),
        contact: resolve(__dirname, "contact.html"),
        admin: resolve(__dirname, "admin.html"),
        "admin-login": resolve(__dirname, "admin-login.html"),
        "ka-main": resolve(__dirname, "ka/index.html"),
        "ka-work": resolve(__dirname, "ka/work.html"),
        "ka-sample-project": resolve(__dirname, "ka/sample-project.html"),
        "ka-project": resolve(__dirname, "ka/project.html"),
        "ka-studio": resolve(__dirname, "ka/studio.html"),
        "ka-services": resolve(__dirname, "ka/services.html"),
        "ka-pricing": resolve(__dirname, "ka/pricing.html"),
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
