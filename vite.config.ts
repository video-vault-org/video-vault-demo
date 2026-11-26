import { defineConfig } from 'vitest/config';
import { build } from 'vite';
import { readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const buildId = JSON.stringify(Date.now().toString());

const config = defineConfig({
  define: { __BUILD_ID__: buildId },
  plugins: [
    {
      name: 'static-demo-offline',
      apply: 'build',

      async closeBundle() {
        const root = resolve(import.meta.dirname, 'dist');
        await build({
          configFile: false,
          root: import.meta.dirname,
          publicDir: false,
          define: { __BUILD_ID__: buildId },
          build: {
            outDir: root,
            emptyOutDir: false,
            target: 'es2020',
            lib: { entry: resolve(import.meta.dirname, 'src/sw.ts'), name: 'VideoVaultDemoWorker', formats: ['iife'], fileName: () => 'sw.js' },
            rollupOptions: { output: { inlineDynamicImports: true } }
          }
        });
        const files = async function (path: string): Promise<string[]> {
          const entries = await readdir(resolve(root, path), { withFileTypes: true });
          return (await Promise.all(entries.map((entry) => (entry.isDirectory() ? files(`${path}${entry.name}/`) : [`/${path}${entry.name}`])))).flat();
        };

        await writeFile(resolve(root, 'precache.json'), JSON.stringify((await files('')).filter((path) => path !== '/precache.json')));
      }
    }
  ],
  test: { include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'], environment: 'jsdom', setupFiles: ['src/tests/setup.ts'], pool: 'forks', maxWorkers: 2 }
});

export default config;
