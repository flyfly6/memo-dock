import * as esbuild from 'esbuild';

await Promise.all([
  esbuild.build({
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js',
    bundle: true,
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    sourcemap: true,
    target: 'node20',
  }),
  esbuild.build({
    entryPoints: ['src/webview/index.tsx'],
    outfile: 'dist/webview.js',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    sourcemap: true,
    target: 'es2022',
  }),
]);
