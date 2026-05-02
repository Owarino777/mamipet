export const insuranceLevels = ["standard", "premium"] as const;

export type InsuranceLevel = (typeof insuranceLevels)[number];
