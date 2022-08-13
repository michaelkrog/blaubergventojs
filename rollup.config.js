import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

import { terser } from 'rollup-plugin-terser';

const name = require('./package.json').main.replace(/\.js$/, '')

const bundle = config => ({
  ...config,
  input: 'src/index.ts'
})

export default [
  bundle({
    plugins: [esbuild(), terser({
        ecma: 2015,
        mangle: { toplevel: true },
        compress: {
          module: true,
          toplevel: true,
          unsafe_arrows: true,
          drop_console: true,
          drop_debugger: true
        },
        output: { quote_style: 1 }
      })],
    output: [
      {
        file: `${name}.js`,
        format: 'umd',
        sourcemap: true,
        name: 'blaubergvento',
        esModule: false,
        globals: {}
      },
      {
        file: `${name}.mjs`,
        format: 'es',
        sourcemap: true
      },
    ],
    external: []
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: 'es'
    },
  }),
]