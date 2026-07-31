---
name: Vite workspace dep optimizer
description: @workspace/* packages with TypeScript source exports cause a blank page unless excluded from Vite's dep optimizer.
---

## Rule
Add every `@workspace/*` package to `optimizeDeps.exclude` in `vite.config.ts` and set `server.fs.strict: false`.

## Why
Vite's dep pre-bundler tries to produce a `.vite/deps/@workspace_<pkg>.js` file for each imported workspace package. When the package exports raw `.ts` source (as pnpm workspace packages in this monorepo do), Vite fails to produce the file. Any subsequent page load that requests the cached dep URL gets a "file does not exist in optimize deps directory" error, crashing the module graph. The result is a completely blank page with no visible error — only visible in Vite server stdout.

Setting `fs.strict: false` allows Vite to serve files from outside the artifact's root (needed for symlinked workspace packages).

## How to apply
```ts
optimizeDeps: {
  exclude: ['@workspace/api-client-react', '@workspace/api-zod', '@workspace/db'],
},
server: {
  fs: { strict: false },
  // ...rest of server config
}
```

After changing this, clear `.vite/deps` cache (`rm -rf artifacts/<slug>/node_modules/.vite`) and restart the workflow, otherwise the stale pre-bundle manifest re-triggers the error on the next browser request.
