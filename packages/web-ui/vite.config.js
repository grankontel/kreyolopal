import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'WebUi',
      formats: ['es', 'umd'],
      fileName: (format) => `web-ui.${format}.js`,
      
    },
    rollupOptions: {
      external: [
        'bulma',
        'classnames',
        'feather-icons',
        'lodash',
        'react',
        'react-admin',
        'react-bulma-components',
        'react-dom',
      ],
      output: {
        sourcemap: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-admin': 'reactAdmin',
          'feather-icons': 'feather',
          'classnames': 'classNames',
          'react-bulma-components': 'reactBulmaComponents',
        },
      },
    },
  },
  resolve: {
    alias: {
      path: 'path-browserify',
    },
    // dedupe: ['react', 'react-router-dom']
  },
})
