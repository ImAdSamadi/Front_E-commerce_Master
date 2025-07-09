import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Product} from "../../models/product.model";
import {ProductWithSelectedFilters} from "../../models/common.model";



@Component({
  selector: 'app-shop-products-list',
  templateUrl: './shop-products-list.component.html',
  styleUrls: ['./shop-products-list.component.css']
})
export class ShopProductsListComponent implements OnInit, OnChanges{

  @Input() products : Product[] | null=null ;

  filteredProductsWithFilters: ProductWithSelectedFilters[] = [];

  @Input() filters: {
    sizes: string[],
    colors: string[],
    priceRanges: string[]
  } | null = null;


  get areFiltersEmpty(): boolean {
    if (!this.filters) return true;
    return (
      this.filters.sizes.length === 0 &&
      this.filters.colors.length === 0 &&
      this.filters.priceRanges.length === 0
    );
  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes['products']) {
      console.log('products input changed:', this.products);
    }
    if (changes['filters']) {
      console.log('filters input changed:', this.filters);
    }

    if (this.products && this.filters) {
      this.filteredProductsWithFilters = filterProductsWithSelectedFilters(this.products, this.filters);

      console.log('Filtered products array length:', this.filteredProductsWithFilters.length);
      this.filteredProductsWithFilters.forEach((item, index) => {
        console.log(`Product ${index}:`, item.product.name, {
          matchedSize: item.matchedSize,
          matchedColor: item.matchedColor,
          matchedPriceRange: item.matchedPriceRange,
          matchedPrice: item.matchedPrice
        });
      });
    }
  }




  ngOnInit() {
    // console.log('Received filters:', this.filters);
  }



}

// Generic helper to get last matched filter from a list for a product
function getLastMatchedFilter(
  product: Product,
  filtersArray: string[],
  productHasFilterFunc: (product: Product, filterVal: string) => boolean
): string | undefined {
  for (let i = filtersArray.length - 1; i >= 0; i--) {
    const filterVal = filtersArray[i];
    if (productHasFilterFunc(product, filterVal)) {
      return filterVal;
    }
  }
  return undefined;
}

// Specific filter-checking functions

function productHasSize(product: Product, sizeFilter: string): boolean {
  return product.sizeVariants.some(sv => sv.size === sizeFilter);
}

function productHasColor(product: Product, colorFilter: string): boolean {
  return product.sizeVariants.some(sv =>
    sv.colorVariants.some(cv => cv.color === colorFilter)
  );
}

function productHasPriceRange(product: Product, priceRangeFilter: string): boolean {
  const match = priceRangeFilter.match(/\$(\d+)\s*-\s*\$(\d+)/);
  if (!match) return false;
  const minPrice = parseInt(match[1], 10);
  const maxPrice = parseInt(match[2], 10);

  return product.sizeVariants.some(sv =>
    sv.productPrice.price >= minPrice && sv.productPrice.price <= maxPrice
  );
}

// Main function: filters products and returns matched filters per product

function filterProductsWithSelectedFilters(
  products: Product[],
  filters: { sizes: string[]; colors: string[]; priceRanges: string[] }
): ProductWithSelectedFilters[] {
  return products
    .map(product => {
      const matchedSize = filters.sizes.length > 0
        ? getLastMatchedFilter(product, filters.sizes, productHasSize)
        : undefined;

      const matchedColor = filters.colors.length > 0
        ? getLastMatchedFilter(product, filters.colors, productHasColor)
        : undefined;

      const matchedPriceRange = filters.priceRanges.length > 0
        ? getLastMatchedFilter(product, filters.priceRanges, productHasPriceRange)
        : undefined;

      const sizeFilterEmpty = filters.sizes.length === 0;
      const colorFilterEmpty = filters.colors.length === 0;
      const priceFilterEmpty = filters.priceRanges.length === 0;

      if (
        (sizeFilterEmpty || matchedSize) &&
        (colorFilterEmpty || matchedColor) &&
        (priceFilterEmpty || matchedPriceRange)
      ) {
        const matchedPrice = getPriceForProduct(product, matchedSize, matchedColor, matchedPriceRange);

        return {
          product,
          matchedSize,
          matchedColor,
          matchedPriceRange,
          matchedPrice
        };
      }

      return null;
    })
    .filter(p => p !== null) as ProductWithSelectedFilters[];
}



function getPriceForProduct(
  product: Product,
  matchedSize: string | undefined,
  matchedColor: string | undefined,
  matchedPriceRangeLabel: string | undefined
): number | undefined {
  if (!matchedPriceRangeLabel) return undefined;

  // parse price range limits
  const match = matchedPriceRangeLabel.match(/\$(\d+)\s*-\s*\$(\d+)/);
  if (!match) return undefined;

  const minPrice = parseInt(match[1], 10);
  const maxPrice = parseInt(match[2], 10);

  // Helper to check if price in range
  const priceInRange = (price: number) => price >= minPrice && price <= maxPrice;

  if (!matchedColor) {
    // No color filter: return first sizeVariant price that fits in priceRange
    for (const sv of product.sizeVariants) {
      if (priceInRange(sv.productPrice.price)) return sv.productPrice.price;
    }
    return undefined;
  }

  // If color filter applied
  // If size filter applied: find price of that size+color combo
  if (matchedSize) {
    const sizeVariant = product.sizeVariants.find(sv => sv.size === matchedSize);
    if (!sizeVariant) return undefined;

    const colorVariant = sizeVariant.colorVariants.find(cv => cv.color === matchedColor);
    if (!colorVariant) return undefined;

    // Assuming price is stored in sizeVariant price (or somewhere else you track)
    // You might have per-color pricing — adjust if needed
    if (priceInRange(sizeVariant.productPrice.price)) return sizeVariant.productPrice.price;

    return undefined;
  }

  // No size filter, but color filter present:
  // find any sizeVariant that has this color and price in range
  for (const sv of product.sizeVariants) {
    const hasColor = sv.colorVariants.some(cv => cv.color === matchedColor);
    if (hasColor && priceInRange(sv.productPrice.price)) {
      return sv.productPrice.price;
    }
  }

  return undefined;
}

