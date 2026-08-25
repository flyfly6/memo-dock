import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';

const sourceLoader = {
  name: 'source-loader',
  setup(build) {
    build.onLoad({ filter: /[\\/]src[\\/].*\.tsx?$/ }, async ({ path }) => ({
      contents: await readFile(path),
      loader: path.endsWith('.tsx') ? 'tsx' : 'ts',
    }));
  },
};

const builds = [
  {
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js',
    bundle: true,
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    plugins: [sourceLoader],
    sourcemap: true,
    target: 'node20',
  },
  {
    entryPoints: ['src/webview/index.tsx'],
    outfile: 'dist/webview.js',
    bundle: true,
    format: 'iife',
    platform: 'browser',
    plugins: [sourceLoader],
    conditions: ['style'],
    sourcemap: true,
    target: 'es2022',
  },
];

if (process.argv.includes('--watch')) {
  const contexts = await Promise.all(builds.map((options) => esbuild.context(options)));
  await Promise.all(contexts.map((context) => context.watch()));
} else {
  await Promise.all(builds.map((options) => esbuild.build(options)));
}
