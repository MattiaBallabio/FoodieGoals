const workersBinding = 'data:text/javascript,export const env = {};';

// Resolve the app's Vite aliases and Cloudflare binding in the Node test runner.
export function resolve(specifier, context, nextResolve) {
  if (specifier === 'cloudflare:workers') {
    return nextResolve(workersBinding, context);
  }

  if (specifier.startsWith('@/lib/')) {
    const path = new URL(`../../${specifier.slice(2)}.ts`, import.meta.url);
    return nextResolve(path.href, context);
  }

  if (
    specifier === './matching' &&
    context.parentURL === new URL('../../lib/database.ts', import.meta.url).href
  ) {
    return nextResolve(
      new URL('./matching.ts', context.parentURL).href,
      context,
    );
  }

  return nextResolve(specifier, context);
}
