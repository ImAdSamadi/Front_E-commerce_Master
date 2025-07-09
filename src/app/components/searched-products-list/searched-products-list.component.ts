import {Component, OnInit} from '@angular/core';
import {createFeatureSelector, Store} from "@ngrx/store";
import {map, Observable, take} from "rxjs";
import {DataStateEnum, FetchMethode, ProductState} from "../../ngrx/productsState/products.reducer";
import {ProductService} from "../../services/productService/product.service";
import {EventType, FilterRequestWithPagination} from "../../models/common.model";
import {SecurityService} from "../../security/security.service";
import {
  GetProductsByCategoryWithFiltersAction,
  GetProductsByKeywordWithFiltersAction, GetProductsPageAction
} from "../../ngrx/productsState/product.actions";
import {Router} from "@angular/router";


export const selectProductState = createFeatureSelector<ProductState>('productState');


@Component({
  selector: 'app-searched-products-list',
  templateUrl: './searched-products-list.component.html',
  styleUrls: ['./searched-products-list.component.css']
})
export class SearchedProductsListComponent implements OnInit{
    productState$? : Observable<ProductState> ;
  public readonly ProductStateEnum = DataStateEnum ;
  public readonly fetchMethode = FetchMethode ;
    constructor(private store:Store<any> , private productService : ProductService
                , private secSecurity : SecurityService, private router: Router) {
    }

  sidebarHidden = false;
  itemsPerPage = 9;

  selectedSortLabel = 'Latest'; // label shown in dropdown button
  selectedSortValue = 'addingDate,desc'; // default sort value sent to backend

  sortOptions = [
    { label: 'Latest', value: 'addingDate,desc' },
    // { label: 'Price ↑', value: 'price,asc' },
    // { label: 'Price ↓', value: 'price,desc' },
    { label: 'Name A-Z', value: 'name,asc' },
    { label: 'Name Z-A', value: 'name,desc' }
  ];

  filters: {
    sizes: string[],
    colors: string[],
    priceRanges: string[]
  } | null = null;



  ngOnInit(): void {
      this.productState$ = this.store.pipe(
        map(state => state.productState)
      )

      this.store.subscribe(
        s => {
          if(s.productState.dataState == this.ProductStateEnum.LOADED) {
           if(s.productState.products[0] && this.secSecurity.profile){
             if(this.secSecurity.profile.id){
             // if(s.productState.fetchMethode == FetchMethode.SEARCH_BY_CATEGORY )
             //   this.productService.publishEvent(s.productState.products[0].productId , EventType.SEARCH_BY_CATEGORY , this.secSecurity.profile.id)
             // if(s.productState.fetchMethode == FetchMethode.SEARCH_BY_KEYWORD)
             //   this.productService.publishEvent(s.productState.products[0].productId , EventType.SEARCH_BY_KEYWORD , this.secSecurity.profile.id)

           }}
          }
        })
    }


  onSidebarFiltersChanged(filters: { sizes: string[], colors: string[], priceRanges: string[] }) {
    console.log('Filters from sidebar:', filters);

    // Example: You can save them locally or use them elsewhere
    this.filters = filters;

  }




  setSidebarHidden(hidden: boolean): void {
    this.sidebarHidden = hidden;
    this.itemsPerPage = hidden ? 16 : 9;

    this.store.select(selectProductState).pipe(take(1)).subscribe(state => {
      if (!state.lastFilterPayload) {
        this.router.navigateByUrl("/home");
        return;
      }

      const currentPage = state.lastFilterPayload.pageSize.page;
      const currentSize = state.lastFilterPayload.pageSize.size;
      const startIndex = currentPage * currentSize;

      const newPage = Math.floor(startIndex / this.itemsPerPage);

      const updatedPayload: FilterRequestWithPagination = {
        pageSize: {
          page: newPage,
          size: this.itemsPerPage,
          sort: state.lastFilterPayload.pageSize.sort // preserve sort if set
        },
        data: state.lastFilterPayload.data
      };

      switch (state.fetchMethode) {
        case FetchMethode.SEARCH_BY_CATEGORY:
          this.store.dispatch(new GetProductsByCategoryWithFiltersAction(updatedPayload));
          break;
        case FetchMethode.SEARCH_BY_KEYWORD:
          this.store.dispatch(new GetProductsByKeywordWithFiltersAction(updatedPayload));
          break;
        case FetchMethode.PAGE:
          this.store.dispatch(new GetProductsPageAction(updatedPayload));
          break;
        default:
          this.router.navigateByUrl("/home");
          break;
      }
    });
  }


  get itemsPerPageOptions(): number[] {
    const base = this.sidebarHidden ? 16 : 9;
    return [base, base * 2, base * 3];
  }

  handleItemsPerPageChange(newSize: number): void {
    this.store.select(selectProductState).pipe(take(1)).subscribe(state => {
      if (!state.lastFilterPayload) return;

      const currentPage = state.lastFilterPayload.pageSize.page;
      const currentSize = state.lastFilterPayload.pageSize.size;

      // calculate the index of the first item in the current page
      const startIndex = currentPage * currentSize;

      // compute the new page index based on new page size
      const newPage = Math.floor(startIndex / newSize);

      // update the local value
      this.itemsPerPage = newSize;

      const updatedPayload: FilterRequestWithPagination = {
        pageSize: {
          page: newPage,
          size: newSize,
          sort: state.lastFilterPayload.pageSize.sort // preserve sort if any
        },
        data: state.lastFilterPayload.data
      };

      switch (state.fetchMethode) {
        case FetchMethode.SEARCH_BY_CATEGORY:
          this.store.dispatch(new GetProductsByCategoryWithFiltersAction(updatedPayload));
          break;
        case FetchMethode.SEARCH_BY_KEYWORD:
          this.store.dispatch(new GetProductsByKeywordWithFiltersAction(updatedPayload));
          break;
        case FetchMethode.PAGE:
          this.store.dispatch(new GetProductsPageAction(updatedPayload));
          break;
        default:
          this.router.navigateByUrl("/home");
      }
    });
  }



  handleSortChange(option: { label: string, value: string }): void {
    this.selectedSortLabel = option.label;
    this.selectedSortValue = option.value;

    // Dispatch with updated sort
    this.store.select(selectProductState).pipe(take(1)).subscribe(state => {
      if (!state.lastFilterPayload) return;

      const updatedPayload: FilterRequestWithPagination = {
        pageSize: {
          page: 0,
          size: this.itemsPerPage,
          sort: this.selectedSortValue
        },
        data: state.lastFilterPayload.data
      };

      switch (state.fetchMethode) {
        case FetchMethode.SEARCH_BY_CATEGORY:
          this.store.dispatch(new GetProductsByCategoryWithFiltersAction(updatedPayload));
          break;
        case FetchMethode.SEARCH_BY_KEYWORD:
          this.store.dispatch(new GetProductsByKeywordWithFiltersAction(updatedPayload));
          break;
        case FetchMethode.PAGE:
          this.store.dispatch(new GetProductsPageAction(updatedPayload));
          break;
        default:
          this.router.navigateByUrl("/home");
      }
    });
  }



}
