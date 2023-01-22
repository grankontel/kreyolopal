import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'ReactZakari',
      formats: ['es', 'umd'],
      fileName: (format) => `react-zakari.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-router-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'reactRouterDom',
        },
      },
    },
  },
})
