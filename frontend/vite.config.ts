import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // base: "/~zbalah3/sae4-dweb-di-01-social-AddemZbalah/Cycle-B/frontend/dist/",
  plugins: [react(), tailwindcss()],
  preview: {
   port: 5173,
   strictPort: true,
  },
  server: {
   port: 5173,
   strictPort: true,
   host: true,
   origin: "http://localhost:8090",
   allowedHosts: ["sae-frontend"],
   proxy: {
     '/api': {
       target: 'http://localhost:8080',
       changeOrigin: true,
       rewrite: (path) => path.replace(/^\/api/, '/api'),
     }
   }
  },
});