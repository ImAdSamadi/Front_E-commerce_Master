import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Category, PriceRange, ValueWithCount} from "../../../models/category.model";
import {Subscription, take} from "rxjs";
import {CategoryService} from "../../../services/productService/category.service";
import {createFeatureSelector, Store} from "@ngrx/store";
import {FetchMethode, ProductState} from "../../../ngrx/productsState/products.reducer";
import {FilterRequestWithPagination} from "../../../models/common.model";
import {
  GetProductsByCategoryWithFiltersAction,
  GetProductsByKeywordWithFiltersAction, GetProductsPageAction
} from "../../../ngrx/productsState/product.actions";
import {ProductService} from "../../../services/productService/product.service";


export const selectProductState = createFeatureSelector<ProductState>('productState');


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {

  categories: Category[] = [];

  priceRanges: PriceRange[] = [];
  sizesWithCount: ValueWithCount<string>[] = [];
  colorsWithCount: ValueWithCount<string>[] = [];

  // Track selected filters
  selectedPriceRanges: Set<string> = new Set();
  selectedSizes: Set<string> = new Set();
  selectedColors: Set<string> = new Set();

  @Output() filtersChanged = new EventEmitter<{ sizes: string[], colors: string[], priceRanges: string[] }>();


  private updatedPayload: FilterRequestWithPagination = {
    pageSize: { page: 0, size: 10 }, // example default values
    data: {} // or a valid default according to your `data` type
  };

  private lastFetchMethod: FetchMethode | null = null;

  private currentCategoryId: string | null = null;

  private subscriptions = new Subscription();

  constructor(
    private categoryService: CategoryService,
    private store: Store, private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Load categories separately on init
    const catSub = this.categoryService.loadCategories()
      .pipe(take(1))
      .subscribe(categories => {
        this.categories = categories;
      });

    this.subscriptions.add(catSub);

    // Now subscribe to product filter payload changes separately
    this.subscribeToFilterPayload();
  }

  private subscribeToFilterPayload(): void {
    const filterSub = this.store.select(selectProductState)
      .subscribe(state => {
        if (!state?.lastFilterPayload) return;

        const categoryId = state.lastFilterPayload.data.categoryId;

        switch (state.fetchMethode) {
          case FetchMethode.SEARCH_BY_CATEGORY:
            this.lastFetchMethod = state.fetchMethode;
            this.updatedPayload = {
              pageSize: {
                page: 0,
                size: state.lastFilterPayload.pageSize.size
              },
              data: state.lastFilterPayload.data
            };

            if (categoryId && categoryId !== this.currentCategoryId) {
              this.currentCategoryId = categoryId;

              const category = this.categories.find(c => c.categoryId === categoryId);
              if (category) {
                this.updateFiltersFromCategory(category);

                // Restore selected filters from store payload
                const data = state.lastFilterPayload.data;
                this.selectedPriceRanges = new Set(data.priceRanges ?? []);
                this.selectedSizes = new Set(data.sizes ?? []);
                this.selectedColors = new Set(data.colors ?? []);
              }
            } else {
              // Also update selections when payload changes but category doesn't (to prevent reset)
              const data = state.lastFilterPayload.data;
              this.selectedPriceRanges = new Set(data.priceRanges ?? []);
              this.selectedSizes = new Set(data.sizes ?? []);
              this.selectedColors = new Set(data.colors ?? []);
            }
            break;

          case FetchMethode.SEARCH_BY_KEYWORD:
            this.lastFetchMethod = state.fetchMethode;
            const keywordPayload: FilterRequestWithPagination = {
              pageSize: { page: 0, size: 1 }, // Only need the first product
              data: {
                keyword: state.lastFilterPayload.data.keyword,
                admin: state.lastFilterPayload.data.admin || false,
                sizes: state.lastFilterPayload.data.sizes ?? [],
                colors: state.lastFilterPayload.data.colors ?? [],
                priceRanges: state.lastFilterPayload.data.priceRanges ?? []
              }
            };

            this.updatedPayload = {
              pageSize: {
                page: 0,
                size: state.lastFilterPayload.pageSize.size
              },
              data: state.lastFilterPayload.data
            };

            this.productService.getProductsByKeywordWithFilters(keywordPayload)
              .pipe(take(1))
              .subscribe(response => {
                if (!state?.lastFilterPayload) return;
                const firstProduct = response.content?.[0];
                if (!firstProduct) return;

                const categoryId = firstProduct.categoryId;

                if (categoryId && categoryId !== this.currentCategoryId) {
                  this.currentCategoryId = categoryId;

                  const category = this.categories.find(c => c.categoryId === categoryId);
                  if (category) {
                    this.updateFiltersFromCategory(category);

                    // Restore selected filters from store payload
                    const data = state.lastFilterPayload.data;
                    this.selectedPriceRanges = new Set(data.priceRanges ?? []);
                    this.selectedSizes = new Set(data.sizes ?? []);
                    this.selectedColors = new Set(data.colors ?? []);

                  } else {
                    // Also update selections when payload changes but category doesn't (to prevent reset)
                    const data = state.lastFilterPayload.data;
                    this.selectedPriceRanges = new Set(data.priceRanges ?? []);
                    this.selectedSizes = new Set(data.sizes ?? []);
                    this.selectedColors = new Set(data.colors ?? []);
                  }
                }
              });

            break;


          case FetchMethode.PAGE:
            this.lastFetchMethod = state.fetchMethode;

            this.updatedPayload = {
              pageSize: {
                page: 0,
                size: state.lastFilterPayload.pageSize.size
              },
              data: state.lastFilterPayload.data
            };

            // 1. Combine all pricesWithCount from all categories
            const allPricesWithCount = this.categories.flatMap(c => c.categoryPricesWithCount ?? []);

            // 2. Aggregate prices and counts by price value to avoid duplicates
            const priceCountMap = new Map<number, number>();
            allPricesWithCount.forEach(({ value, count }) => {
              priceCountMap.set(value, (priceCountMap.get(value) ?? 0) + count);
            });

            // 3. Convert map back to array
            const aggregatedPricesWithCount = Array.from(priceCountMap.entries())
              .map(([value, count]) => ({ value, count }))
              .sort((a, b) => a.value - b.value);  // Sort ascending by price

            // 4. Generate price ranges from aggregated prices
            this.priceRanges = this.buildPriceRanges(aggregatedPricesWithCount);

            // 5. Restore selected price ranges from store (if any)
            const data = state.lastFilterPayload.data;
            this.selectedPriceRanges = new Set(data.priceRanges ?? []);

            break;


          default:
            break;
        }
      });

    this.subscriptions.add(filterSub);
  }

  private updateFiltersFromCategory(category: Category): void {
    console.log('Updating filters from category:', category);

    this.sizesWithCount = category.categoryProductsSizesWithCount ?? [];
    this.colorsWithCount = category.categoryProductsColorsWithCount ?? [];
    this.priceRanges = this.buildPriceRanges(category.categoryPricesWithCount ?? []);

    console.log('sizesWithCount:', this.sizesWithCount);
    console.log('colorsWithCount:', this.colorsWithCount);
    console.log('priceRanges:', this.priceRanges);
  }

  private buildPriceRanges(pricesWithCount: ValueWithCount<number>[]): PriceRange[] {
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private resetSelections() {
    this.selectedPriceRanges.clear();
    this.selectedSizes.clear();
    this.selectedColors.clear();
  }

  // Check if "All Price" should be selected (no specific priceRanges selected)
  isAllPriceSelected(): boolean {
    return this.selectedPriceRanges.size === 0;
  }

  // Check if "All Color" should be selected (no colors selected)
  isAllColorSelected(): boolean {
    return this.selectedColors.size === 0;
  }

  // Check if "All Size" should be selected (no sizes selected)
  isAllSizeSelected(): boolean {
    return this.selectedSizes.size === 0;
  }

  // Called when clicking "All Price"
  onAllPriceToggle() {
    this.selectedPriceRanges.clear();
    this.applyFilters();
  }

  // Called when clicking "All Color"
  onAllColorToggle() {
    this.selectedColors.clear();
    this.applyFilters();
  }

  // Called when clicking "All Size"
  onAllSizeToggle() {
    this.selectedSizes.clear();
    this.applyFilters();
  }

  // Modify your existing toggles to uncheck "All" when something is selected
  onPriceRangeToggleEvent(label: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    if (checked) this.selectedPriceRanges.add(label);
    else this.selectedPriceRanges.delete(label);
    this.applyFilters();
  }

  onColorToggleEvent(color: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    if (checked) this.selectedColors.add(color);
    else this.selectedColors.delete(color);
    this.applyFilters();
  }

  onSizeToggleEvent(size: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    if (checked) this.selectedSizes.add(size);
    else this.selectedSizes.delete(size);
    this.applyFilters();
  }


  private applyFilters() {
    this.updatedPayload = {
      ...this.updatedPayload,
      data: {
        ...this.updatedPayload.data,
        sizes: Array.from(this.selectedSizes),
        colors: Array.from(this.selectedColors),
        priceRanges: Array.from(this.selectedPriceRanges),
      }
    };

    this.filtersChanged.emit({
      sizes: Array.from(this.selectedSizes),
      colors: Array.from(this.selectedColors),
      priceRanges: Array.from(this.selectedPriceRanges)
    });


    switch (this.lastFetchMethod) {
      case FetchMethode.SEARCH_BY_CATEGORY:
        this.store.dispatch(new GetProductsByCategoryWithFiltersAction(this.updatedPayload));
        break;

      case FetchMethode.SEARCH_BY_KEYWORD:
        this.store.dispatch(new GetProductsByKeywordWithFiltersAction(this.updatedPayload));
        break;

      case FetchMethode.PAGE:
        this.store.dispatch(new GetProductsPageAction(this.updatedPayload));
        break;

      default:
        console.warn("Unknown fetch method:", this.lastFetchMethod);
        break;
    }
  }


  get totalPriceCount(): number {
    return this.priceRanges.reduce((acc, p) => acc + p.count, 0);
  }

  get totalColorCount(): number {
    return this.colorsWithCount.reduce((acc, c) => acc + c.count, 0);
  }

  get totalSizeCount(): number {
    return this.sizesWithCount.reduce((acc, s) => acc + s.count, 0);
  }



}
