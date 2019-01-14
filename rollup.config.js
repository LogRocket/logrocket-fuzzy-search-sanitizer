import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';

import pkg from './package.json';

const name = 'logrocketFuzzySearchSanitizer';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name
    },
    {
      file: './demo/logrocket-fuzzy-search-sanitizer.js',
      format: 'iife',
      name
    }
  ],
  plugins: [
    commonjs(),
    typescript({
      typescript: require('typescript')
    })
  ]
}