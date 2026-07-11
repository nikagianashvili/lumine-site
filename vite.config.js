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
