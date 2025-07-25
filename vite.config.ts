import { defineConfig} from "vite";
// import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server/index";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist/spa",
    chunkSizeWarningLimit: 1000, // Aumenta el límite antes de lanzar warning
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .replace("@", "")
              .replace("/", "-");
          }
        },
      },
    },
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

// function expressPlugin(): Plugin {
//   return {
//     name: "express-plugin",
//     apply: "serve", // Only apply during development (serve mode)
//     configureServer(server) {
//       const app = createServer();

//       // Start Express server on port 3001
//       app.listen(3001, () => {
//         console.log("✅ Express API server running on http://localhost:3001");
//       });
//     },
//   };
// }
