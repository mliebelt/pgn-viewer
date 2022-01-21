import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const config = {
    input: './lib/pgn.js',
    output: {
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'pgnReader',
    },
    plugins: [commonjs(), resolve()],
}

export default config