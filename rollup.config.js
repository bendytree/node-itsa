
import typescript from 'rollup-plugin-typescript2';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';

export default {
  input: 'test.ts',
  // input: 'src/index.ts',
  output: {
    name: 'Itsa',
    file: 'dist/itsa.js',
    format: 'umd',
    sourcemap: true,
  },
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        __BUILD_ENV__: JSON.stringify('production'),
      }
    }),
    sourcemaps(),
    typescript(),
    terser({
      ecma: 2015,
    }),
  ]
}
