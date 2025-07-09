export interface ValueWithCount<T> {
  value: T;
  count: number;
}

export interface Category {
  categoryId: string;
  categoryName: string;
  categoryImageBase64: string;

  categoryColors: string[];
  categorySizes: string[];

  productsQuantity: number;
  categoryPrices: number[]; // number corresponds to Double in Java

  categoryProductsSizes: string[];
  categoryProductsColors: string[];

  // New count lists reflecting backend data
  categoryProductsSizesWithCount?: ValueWithCount<string>[];
  categoryProductsColorsWithCount?: ValueWithCount<string>[];
  categoryPricesWithCount?: ValueWithCount<number>[];
}

export interface PriceRange {
  label: string; // e.g. "$0 - $100"
  count: number; // total count in this range
}


/**
 * Convert raw pricesWithCount to price ranges with aggregated counts.
 * Example input: [{value:110.99, count:1}, {value:120.99, count:1}, ...]
 * Output buckets like: [{label: '$0 - $100', count: 10}, {label: '$100 - $200', count: 5}]
 */
function buildPriceRanges(pricesWithCount: ValueWithCount<number>[]): PriceRange[] {
  if (!pricesWithCount.length) return [];

  const bucketSize = 100;
  const buckets: Record<string, number> = {};

  pricesWithCount.forEach(({ value, count }) => {
    const bucketFloor = Math.floor(value / bucketSize) * bucketSize;
    const bucketCeil = bucketFloor + bucketSize;
    const label = `$${bucketFloor} - $${bucketCeil}`;
    buckets[label] = (buckets[label] || 0) + count;
  });

  return Object.entries(buckets).map(([label, count]) => ({ label, count }));
}
