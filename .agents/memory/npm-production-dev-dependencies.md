---
name: Production environment omits dev dependencies
description: Package installation behavior when the workspace-level NODE_ENV is production.
---

The workspace-level environment sets `NODE_ENV=production`, so npm package installs can report success while omitting tools listed only as development dependencies.

**Why:** Database schema validation repeatedly could not find the Drizzle CLI even after a successful package-install report; npm was omitting the development dependency because of the workspace environment.

**How to apply:** When a command-line tool must run inside this workspace, verify its executable actually exists after installation. If it is required for routine workspace operations, ensure it is installed in the dependency set available under the production environment rather than repeatedly reinstalling it.