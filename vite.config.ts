import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'vue': 'vue' // Updated alias for Vue
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vuelidate/core',
      '@vuelidate/validators',
      '@supabase/supabase-js',
      'primevue/config',
      'primevue/resources/themes/lara-light-blue/theme.css',
      'primevue/resources/primevue.min.css',
      'primeicons/primeicons.css'
    ]
  }
})
