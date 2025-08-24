// client/vite.config.js
import react from "@vitejs/plugin-react";
import builtins from "rollup-plugin-polyfill-node";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import restart from "vite-plugin-restart";
import UnoCSS from "unocss/vite";
import dns from "dns";

dns.setDefaultResultOrder("verbatim");

const builtinsPlugin = {
  ...builtins({ include: ["fs/promises"] }),
  name: "rollup-plugin-polyfill-node",
};

// Plugin: for HTML/doc requests in dev, avoid any 304 path
const devNoConditionalHTML = {
  name: "dev-no-conditional-html",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const acceptsHTML =
        (req.headers.accept && req.headers.accept.includes("text/html")) ||
        req.url === "/" ||
        req.url?.endsWith("/index.html");

      if (acceptsHTML) {
        // Prevent conditional GETs so we never return 304 for the document
        delete req.headers["if-none-match"];
        delete req.headers["if-modified-since"];

        // Ensure browser won’t cache the document in dev
        res.setHeader("Cache-Control", "no-store");

        // In case something upstream would add an ETag, drop it
        if (typeof res.removeHeader === "function") {
          res.removeHeader("ETag");
        }
      }
      next();
    });
  },
};

// Plugin: handle Vite heartbeat ping requests (Accept: text/x-vite-ping)
const devVitePingFix = {
  name: "dev-vite-ping-fix",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const accept = req.headers.accept || "";
      if (accept.includes("text/x-vite-ping")) {
        // Respond with proper 204, headers only, no body
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(204);
        return res.end();
      }
      next();
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ["@empirica/tajriba", "@empirica/core"],
  },
  server: {
    port: 8844,
    open: false,
    strictPort: true,
    host: "0.0.0.0",
    // ✅ Re-enable HMR and point the client to Vite (not Empirica:3000)
    hmr: {
      host: "localhost",
      port: 8844,
      clientPort: 8844,
      protocol: "ws",
    },
    fs: {
      allow: [
        // search up for workspace root
        searchForWorkspaceRoot(process.cwd()),
      ],
    },
    headers: {
      "Cache-Control": "no-store",
    },
  },
  build: {
    minify: false,
    target: "esnext",
    sourcemap: true,
    rollupOptions: {
      preserveEntrySignatures: "strict",
      plugins: [builtinsPlugin],
      output: {
        sourcemap: true,
      },
    },
  },
  clearScreen: false,
  plugins: [
    restart({
      restart: [
        "./uno.config.cjs",
        "./node_modules/@empirica/core/dist/**/*.{js,ts,jsx,tsx,css}",
        "./node_modules/@empirica/core/assets/**/*.css",
      ],
    }),
    UnoCSS(),
    react(),
    devNoConditionalHTML,
    devVitePingFix, // keep last
  ],
  define: {
    "process.env": {
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  },
});
