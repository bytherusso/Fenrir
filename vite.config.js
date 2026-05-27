import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Fenrir/', // <-- Esto es vital, debe coincidir exactamente con el nombre de tu repo
})