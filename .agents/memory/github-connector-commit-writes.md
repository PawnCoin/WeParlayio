---
name: GitHub connector commit writes
description: Reliable branch updates when GitHub REST Git-data responses fail inside the durable connector runtime.
---

Prefer GitHub GraphQL `createCommitOnBranch` for atomic multi-file updates when REST Git-data calls fail durable replay on nullable commit metadata.

**Why:** The REST blob/tree/commit sequence can fail with a durable-runtime pattern validation error on nullable response fields even though ordinary GitHub connector reads work.

**How to apply:** Build base64 additions and path deletions, provide the expected branch head OID, and request only non-null commit fields such as `oid` and `url`.