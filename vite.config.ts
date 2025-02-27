import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    // Expose env variables to the client
    'process.env.VITE_WALLET_CONNECT_PROJECT_ID': JSON.stringify(process.env.VITE_WALLET_CONNECT_PROJECT_ID),
    'process.env.VITE_CONTRACT_ADDRESS': JSON.stringify(process.env.VITE_CONTRACT_ADDRESS),
    'process.env.VITE_NEXUS_RPC_URL': JSON.stringify(process.env.VITE_NEXUS_RPC_URL)
  }
})
