# WeParlay delivery status

Status is only marked complete when it is production-ready. `Built` means code
exists but requires a provider, credentials, legal approval, or production test.

| Item | Status | Current state |
| --- | --- | --- |
| Live scoring and automatic settlement | Built | ESPN + TheSportsDB verification and protected sync paths; commercial provider coverage and true automated payout remain pending. |
| Custom-bet verification, disputes, payouts | Built | Escrow, refunds, disputes, atomic resolution, and verified-result queue are implemented; production settlement policy/provider integration remains pending. |
| Invitations by SMS, email, social | Built | Email and browser share flows exist; SMS is disabled pending a gambling-approved provider. |
| Tournament escrow, verification, tie split, payouts | Built | Funding, end-of-day hold, two-provider verification, refund, and split logic are implemented; provider scheduler remains pending. |
| Licensed live TV | Blocked | Requires broadcast-rights/provider agreement. |
| KYC, age, geolocation, responsible gaming, licensing | Blocked | Requires approved vendors and jurisdiction/legal decisions. |
| Debit-card payments and withdrawals | Deferred | Intentionally last; requires the compliance item above. |
| Crypto custody, deposits, payouts, monitoring | Blocked | Requires custody/wallet provider and compliance decisions. |
| Temporary P2P and watcher chat | Complete | 200-character P2P chat and tournament watcher chat close and clear at settlement. |
| Professional team/athlete assets | Built | Expanded verified team logos and ESPN athlete-headshot endpoint; coverage depends on provider availability. |
| Production ticker validation | Built | Today-only verified ticker is implemented; production credential validation remains pending. |
| Google Play wrapper and final package | Deferred | Listing/release materials drafted; Android wrapper, signing, and Play Console work wait until product/compliance completion. |
| Security, end-to-end, accessibility, launch audit | Blocked | Production build passes, but the full TypeScript check currently fails across legacy admin, payment, betting, storage, and schema code. Resolve that backlog before final audit. |
