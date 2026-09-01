---
name: Autoscale health checks and HTTPS redirects
description: Keep Replit's internal HTTP startup probe reachable while enforcing HTTPS for externally proxied traffic.
---

Replit Autoscale terminates TLS at the platform proxy and probes the application internally over HTTP. HTTPS redirect middleware must redirect only when `X-Forwarded-Proto` is explicitly present and reports HTTP; a missing header must be allowed through.

**Why:** Redirecting requests whenever the forwarded-protocol header was absent caused the startup probe to follow HTTPS to an internal HTTP port, fail repeatedly, and prevent promotion even though the build and application startup succeeded.

**How to apply:** For HTTP services on Autoscale, honor the provided production port, return HTTP 200 from `/` for direct internal probes, and rely on explicit proxy protocol headers when deciding whether to redirect external traffic.