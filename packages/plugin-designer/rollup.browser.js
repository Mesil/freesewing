import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import meta from "./package.json";

export default {
  input: "src/index.js",
  output: {
    file: "dist/theme.min.js",
    format: "iife",
    name: "freesewing_theme_designer"
  },
  plugins: [
    resolve({
      browser: true
    }),
    json(),
    commonjs(),
    babel({
      exclude: "node_modules/**"
    }),
    terser({
      output: {
        preamble: `/**\n * ${meta.name} | ${
          meta.description
        }\n * (c) ${new Date().getFullYear()} ${meta.author}\n * @license ${
          meta.license
        }\n */`
      }
    })
  ]
};