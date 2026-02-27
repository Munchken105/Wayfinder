import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ["glottic-lucy-nonphonetically.ngrok-free.dev"],
      proxy:{
    "/api":{
      target: "http://localhost:5000",
      changeOrigin: true
    }
  }
  },

})
