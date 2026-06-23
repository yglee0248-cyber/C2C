import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    /* host,port,strictport 설정은 JAVA 컨트롤러
      @CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
      (프론트서버 5173으로 고정)
    */
    proxy: {
      "/api": {
        target: "https://apis.data.go.kr", // 진짜 공공데이터 서버 주소
        changeOrigin: true, // cors 에러(브라우저와 공공데이터 서버 사이의 통신 문제)를 막기 위해 VITE에서 링크요청을 보내는 척 출처를 속임
        rewrite: (path) => path.replace(/^\/api/, ""), // 요청 보낼 때 '/api' 글자는 빼고 보냄
      },
    },
  },
});
