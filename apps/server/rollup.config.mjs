import terser from '@rollup/plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'
import generatePackageJson from 'rollup-plugin-generate-package-json-v2'
import copy from 'rollup-plugin-copy'

const distDirectory = './dist'

export default {
  input: 'src/server.js',
  output: {
    dir: distDirectory,
    format: 'cjs',
  },
  plugins: [
    replace({
      preventAssignment: true,
      delimiters: ['', ''],
      values: {
        'process.env.NODE_ENV': process.env.NODE_ENV
          ? `"${process.env.NODE_ENV}"`
          : '"development"',
        '../mails/': './mails/',
        __buildDate__: () => JSON.stringify(new Date()),
      },
    }),
    resolve({ preferBuiltins: true }),
    commonjs({
      exclude: ['node_modules/**'],
      ignoreDynamicRequires: true,
    }),
    json(),
    babel({ babelHelpers: 'bundled' }),
    copy({
      targets: [
        { src: 'src/mails/**/*', dest: 'dist/mails' }
      ]
    })
    // terser()
  ],
}
