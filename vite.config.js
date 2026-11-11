import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // MediaPipe ships its own WASM loader; keep it out of dependency pre-bundling.
  optimizeDeps: { exclude: ['@mediapipe/tasks-vision'] },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('react-router')) return 'react';
          if (id.includes('framer-motion')) return 'motion';
        },
      },
    },
  },
  test: { environment: 'node', include: ['src/**/*.test.js'] },
});
