import {Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {GetShoppingCartAction} from "../../ngrx/ShoppingCartState/cart.actions";
import {map, Observable} from "rxjs";
import {ShoppingCartState} from "../../ngrx/ShoppingCartState/cart.reducer";
import {DataStateEnum} from "../../ngrx/productsState/products.reducer";
import {environment} from "../../../environments/environment";
import {SecurityService} from "../../security/security.service";
import {FilterRequestPayload, PageSize} from "../../models/common.model";
import {GetProductsPageAction} from "../../ngrx/productsState/product.actions";
import {Router} from "@angular/router";

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit{
  shoppingCart$?:Observable<ShoppingCartState>
  public readonly cartDataState = DataStateEnum;

  constructor(private store: Store<any> , private secService : SecurityService,
              private router : Router) {
  }

  total$?: Observable<string>; // mark as optional

  ngOnInit(): void {
    if(this.secService.profile.id) {

      this.shoppingCart$ = this.store.pipe(
        map(state => state.shoppingCartState)
      )

      this.total$ = this.shoppingCart$.pipe(
        map(cartState => {
          if (
            cartState.dataState === this.cartDataState.LOADED &&
            cartState.shoppingCart?.items?.length
          ) {
            const items = cartState.shoppingCart.items;

            const total = items.reduce(
              (acc, item) => acc + item.product.productPrice.price * item.quantity,
              0
            );

            const symbol = items[0].product.productPrice.symbol || '';

            return `${symbol}${total}`;
          }

          // Not loaded or empty
          return '';
        })
      );

    }
  }

  onHome() {
    this.router.navigateByUrl("home")
  }

  onShop() {
    const admin = this.secService.hasRoleIn(['ADMIN']);
    const pageSize: PageSize = { page: 0, size: 9 };

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

    this.router.navigateByUrl("/searched-products");
  }

  onCheckout(){
    this.router.navigateByUrl("/checkout");
  }


}
