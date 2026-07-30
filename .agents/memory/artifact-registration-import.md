---
name: Artifact registration on GitHub import
description: When a project is imported from GitHub, artifact.toml files exist on disk but are not registered in Replit's routing system — the proxy shows "couldn't reach this app" even though the dev server is running.
---

## The rule
`listArtifacts()` returning empty despite `.replit-artifact/artifact.toml` files existing on disk means the artifacts were never registered. The Replit proxy cannot route to unregistered artifacts regardless of what's in artifact.toml.

**Why:** `createArtifact()` both bootstraps files AND registers the artifact in the platform registry. Importing a repo from GitHub brings over the files but skips registration.

## How to apply
When a GitHub-imported project shows "couldn't reach this app" and the dev server IS running (curl localhost:<port> returns 200), check `listArtifacts()` first. If empty:
1. Backup `artifacts/<slug>/` (excluding node_modules)
2. Delete `artifacts/<slug>/`
3. Call `createArtifact()` with the matching slug, previewPath, and type
4. Restore original source files (src/, index.html, package.json, vite.config.ts, tsconfig.json, etc.) over the scaffold — do NOT restore `.replit-artifact/artifact.toml`
5. Remove legacy `[[workflows.workflow]]` entries from `.replit` that duplicate the artifact's managed workflows (use verifyAndReplaceDotReplit)
6. Restart the managed workflow using the name from createArtifact result (e.g. `artifacts/landevo: web`)

## Port conflict note
Legacy workflows in .replit run on hardcoded ports (e.g. 8080). After removing them, the previously-occupied port may still be held briefly — kill the process with `lsof -ti:<port> | xargs kill -9` before restarting the managed workflow.
