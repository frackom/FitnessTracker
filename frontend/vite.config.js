import react from '@vitejs/plugin-react'
import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [
    react(),
    ...(command === "serve" && !isPreview ? [basicSsl()] : []),
  ],
}));
