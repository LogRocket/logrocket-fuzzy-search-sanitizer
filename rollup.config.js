import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';

import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'logrocketFuzzySearchSanitizer'
    }
  ],
  plugins: [
    commonjs(),
    typescript({
      typescript: require('typescript')
    })
  ]
}