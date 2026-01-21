import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://10.22.15.165:8082/", // 立哥
        // target: "http://10.22.12.152:8067", // 老唐
        // target: "http://10.22.13.93:8080", // 杰哥
        // target: "http://10.22.14.136:8080", // 浩哥
        changeOrigin: true,
        // pathRewrite: {
        //   "^/api": "",
        // },
      },
    },
  },
});
