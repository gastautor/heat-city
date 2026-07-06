import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose on the local network so phones on the same WiFi can connect
    port: Number(process.env.PORT) || 5173, // respect an assigned port (e.g. preview tooling)
  },
})
