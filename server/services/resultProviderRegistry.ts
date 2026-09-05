export type ResultProviderConfig = {
  id: string;
  role: "primary" | "corroborating";
  configured: boolean;
  enabled: boolean;
  requiresContract: boolean;
};

/**
 * One place to expose which result providers are ready. Provider adapters are
 * intentionally not guessed from environment names: each commercial provider
 * must be added only after its contract, API documentation, and permitted
 * jurisdictions are confirmed.
 */
export function getResultProviderRegistry(): ResultProviderConfig[] {
  return [
    { id: "espn", role: "primary", configured: true, enabled: true, requiresContract: false },
    { id: "thesportsdb", role: "corroborating", configured: Boolean(process.env.THESPORTSDB_API_KEY), enabled: true, requiresContract: false },
    { id: process.env.SPORTS_RESULTS_PRIMARY_PROVIDER || "commercial-primary", role: "primary", configured: Boolean(process.env.SPORTS_RESULTS_PRIMARY_PROVIDER && process.env.SPORTS_RESULTS_PRIMARY_API_KEY), enabled: Boolean(process.env.SPORTS_RESULTS_PRIMARY_ENABLED === "true"), requiresContract: true },
    { id: process.env.SPORTS_RESULTS_SECONDARY_PROVIDER || "commercial-secondary", role: "corroborating", configured: Boolean(process.env.SPORTS_RESULTS_SECONDARY_PROVIDER && process.env.SPORTS_RESULTS_SECONDARY_API_KEY), enabled: Boolean(process.env.SPORTS_RESULTS_SECONDARY_ENABLED === "true"), requiresContract: true },
  ];
}
