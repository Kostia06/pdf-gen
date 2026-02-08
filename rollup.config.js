import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const external = ['jspdf', 'jspdf-autotable', 'puppeteer'];

export default [
  // Main entry
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.js', format: 'cjs', sourcemap: true },
      { file: 'dist/index.esm.js', format: 'esm', sourcemap: true }
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: true })
    ]
  },
  // Client entry
  {
    input: 'src/client/index.ts',
    output: [
      { file: 'dist/client/index.js', format: 'cjs', sourcemap: true },
      { file: 'dist/client/index.esm.js', format: 'esm', sourcemap: true }
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: true })
    ]
  },
  // Server entry
  {
    input: 'src/server/index.ts',
    output: [
      { file: 'dist/server/index.js', format: 'cjs', sourcemap: true },
      { file: 'dist/server/index.esm.js', format: 'esm', sourcemap: true }
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: true })
    ]
  }
];
