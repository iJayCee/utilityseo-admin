// Module hooks so node's test runner can import the admin app's JSX.
//
// Same job as frontend/test/screens/hooks.mjs: Vite normally transpiles JSX
// and substitutes import.meta.env at build time, and neither happens in a
// plain node process. esbuild comes in with Vite, so nothing new is
// installed. CSS imports become empty modules.
import { transformSync } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { existsSync, statSync } from 'node:fs';

const isSrc = (url) => url.startsWith('file:') && /[\\/]admin[\\/]src[\\/]/.test(fileURLToPath(url));

// Vite resolves './shared' to shared.jsx; node does not, so a relative import
// from src tries the extensions in turn.
const CANDIDATES = ['', '.js', '.jsx', '/index.js', '/index.jsx'];
export async function resolve(specifier, context, next) {
  if (specifier.endsWith('.css')) return { url: 'virtual:css', shortCircuit: true };
  if (specifier.startsWith('.') && context.parentURL && isSrc(context.parentURL)) {
    const base = new URL(specifier, context.parentURL).href;
    for (const ext of CANDIDATES) {
      const candidate = base + ext;
      if (existsSync(fileURLToPath(candidate)) && statSync(fileURLToPath(candidate)).isFile()) {
        return { url: candidate, shortCircuit: true, format: 'module' };
      }
    }
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  if (url === 'virtual:css') return { format: 'module', source: 'export default {};', shortCircuit: true };
  if (!isSrc(url) || !/\.(jsx|js)$/.test(url)) return next(url, context);
  const raw = await next(url, { ...context, format: 'module' });
  const src = String(raw.source).replace(/import\.meta\.env/g, 'globalThis.__VITE_ENV__');
  const { code } = transformSync(src, {
    loader: 'jsx', jsx: 'automatic', format: 'esm', target: 'node20',
    sourcefile: fileURLToPath(url),
  });
  return { format: 'module', source: code, shortCircuit: true };
}
