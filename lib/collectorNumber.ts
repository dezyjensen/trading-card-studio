/** Every Keepsleeve card is a one-of-one — printed number is always 1/1. */
export const ONE_OF_ONE = "1/1";

export function formatCollectorNumber(
  _n?: number | null | undefined,
): string {
  return ONE_OF_ONE;
}

export function collectorLabel(_n?: number | null | undefined): string {
  return ONE_OF_ONE;
}
