
import typescript from 'rollup-plugin-typescript2';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';
import commonjs from '@rollup/plugin-commonjs';

const version = require('./package.json').version;
const banner = `
/**
 * @license
 * itsa ${version}
 * Copyright ${new Date().getFullYear()} Josh Wright <https://www.joshwright.com> 
 * MIT LICENSE
 */
`;

export default [
  {
    input: 'src/index.ts',
    output: {
      name: 'Itsa',
      file: 'dist/itsa.min.js',
      format: 'umd',
      sourcemap: true,
      banner,
    },
    plugins: [
      terser({
        ecma: 2015,
      }),
      commonjs(),
      replace({
        preventAssignment: true,
        values: {
          __BUILD_ENV__: JSON.stringify('production'),
        }
      }),
      sourcemaps(),
      typescript({
        useTsconfigDeclarationDir: true
      }),
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      name: 'Itsa',
      file: 'dist/itsa.js',
      format: 'umd',
      sourcemap: true,
      banner,
    },
    plugins: [
      commonjs(),
      replace({
        preventAssignment: true,
        values: {
          __BUILD_ENV__: JSON.stringify('production'),
        }
      }),
      sourcemaps(),
      typescript({
        useTsconfigDeclarationDir: true
      }),
    ]
  },
  {
    input: './dist/types/index.d.ts',
    output: [{ file: './dist/itsa.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
