export type MoneyCents = number;

export function assertPositiveMoneyCents(value: MoneyCents, fieldName: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} must be a positive amount in cents.`);
  }
}
