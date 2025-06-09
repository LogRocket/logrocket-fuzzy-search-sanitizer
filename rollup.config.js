import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';

import pkg from './package.json' with { type: 'json' };

const name = 'logrocketFuzzySearchSanitizer';

export default(async () => ({
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name
    },
    // {
    //   file: './demo/logrocket-fuzzy-search-sanitizer.js',
    //   format: 'iife',
    //   name
    // }
  ],
  plugins: [
    commonjs(),
    typescript(),
    json(),
    nodeResolve(),
  ]
}))
