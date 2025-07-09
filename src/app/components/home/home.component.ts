import {Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import { GetProductsPageAction} from "../../ngrx/productsState/product.actions";
import {map, Observable} from "rxjs";
import {ProductState, DataStateEnum} from "../../ngrx/productsState/products.reducer";
import {SelectedProductsState} from "../../ngrx/Selected-Products-State/SelectedProduct.reducer";
import {GetSelectedProductAction} from "../../ngrx/Selected-Products-State/SelectedProduct.action";
import {SecurityService} from "../../security/security.service";
import {FilterRequestPayload, PageSize} from "../../models/common.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  productState$? : Observable<ProductState> ;
  selectedProductsState$?: Observable<SelectedProductsState> ;
  public readonly ProductStateEnum = DataStateEnum ;
  constructor(private store:Store<any>, public securityService: SecurityService) {
  }
  ngOnInit(): void {
    this.productState$ = this.store.pipe(
      map(state => state.productState)
    )
    this.selectedProductsState$ = this.store.pipe(
      map(state => state.selectedProductsState)
    )

    const admin = this.securityService.hasRoleIn(['ADMIN']);
    const pageSize: PageSize = { page: 0, size: 8 };

// Build your filter payload
    const filterPayload: FilterRequestPayload = {
      admin: admin,
      // add other filter fields here if needed, e.g.:
      // priceRange: ..., color: ..., size: ...
    };

    this.store.dispatch(new GetProductsPageAction({
      pageSize,
      data: filterPayload
    }));


    // This is of the selected-new-products component... we won't need it in our App
    // this.store.dispatch(new GetSelectedProductAction({page: 0 , size:4}))
  }

}
