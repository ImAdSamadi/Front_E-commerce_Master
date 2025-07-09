import {Component, Input} from '@angular/core';
import {FetchMethode, ProductState} from "../../../ngrx/productsState/products.reducer";
import {Router} from "@angular/router";
import {createFeatureSelector, Store} from "@ngrx/store";
import {
  GetProductsByCategoryWithFiltersAction,
  GetProductsByKeywordWithFiltersAction, GetProductsPageAction
} from "../../../ngrx/productsState/product.actions";
import {FilterRequestWithPagination, PageInfo, PageSize} from "../../../models/common.model";
import {SecurityService} from "../../../security/security.service";
import {take} from "rxjs";

export const selectProductState = createFeatureSelector<ProductState>('productState');


@Component({
  selector: 'app-paggination',
  templateUrl: './paggination.component.html',
  styleUrls: ['./paggination.component.css']
})

export class PagginationComponent {
    @Input() pageInfo? : PageInfo ;
    @Input() fetchMethode? : FetchMethode ;
    @Input() payload!: string;

    constructor(private router: Router , private store: Store, public securityService: SecurityService) {
    }


  onPageHandle(index: number) {
    this.store.select(selectProductState).pipe(take(1)).subscribe(state => {
      if (!state.lastFilterPayload) {
        // fallback or just return
        return;
      }

      const updatedPayload: FilterRequestWithPagination = {
        pageSize: {
          page: index,
          size: state.lastFilterPayload.pageSize.size,
          sort: state.lastFilterPayload.pageSize.sort
        },
        data: state.lastFilterPayload.data
      };

      switch(state.fetchMethode) {
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
          this.router.navigateByUrl("/home") ; break;

      }
    });
  }


  nextPage() {
      if(this.pageInfo && this.pageInfo.number<this.pageInfo.totalPages - 1){
        console.log("ok")

         this.onPageHandle( this.pageInfo?.number+ 1)
      }
  }

  previousPage() {
    if(this.pageInfo && this.pageInfo.number>0){
      console.log("ok")
      this.onPageHandle( this.pageInfo?.number - 1)
    }
  }


}
