import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

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
  plugins: [copyToDist()],
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
