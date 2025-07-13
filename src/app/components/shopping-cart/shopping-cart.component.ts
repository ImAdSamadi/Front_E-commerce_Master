import {Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {GetShoppingCartAction} from "../../ngrx/ShoppingCartState/cart.actions";
import {BehaviorSubject, combineLatest, map, Observable} from "rxjs";
import {ShoppingCartState} from "../../ngrx/ShoppingCartState/cart.reducer";
import {DataStateEnum} from "../../ngrx/productsState/products.reducer";
import {environment} from "../../../environments/environment";
import {SecurityService} from "../../security/security.service";
import {FilterRequestPayload, PageSize} from "../../models/common.model";
import {GetProductsPageAction} from "../../ngrx/productsState/product.actions";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Coupon, CouponService} from "../../services/checkoutService/coupon.service";

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})

export class ShoppingCartComponent implements OnInit {

  shoppingCart$?: Observable<ShoppingCartState>;
  public readonly cartDataState = DataStateEnum;

  subtotal$!: Observable<number>;
  currencySymbol$!: Observable<string>;
  total$!: Observable<string>;
  couponForm!: FormGroup;
  coupon$!: Observable<Coupon>;

  constructor(
    private store: Store<any>,
    private secService: SecurityService,
    private router: Router,
    private fb: FormBuilder,
    private couponService: CouponService
  ) {}

  showCouponAnimation = false;
  exploded = false;


  ngOnInit(): void {
    this.couponForm = this.fb.group({
      code: ['']
    });

    if (this.secService.profile.id) {
      this.shoppingCart$ = this.store.pipe(
        map(state => state.shoppingCartState)
      );

      this.subtotal$ = this.shoppingCart$.pipe(
        map(cartState => {
          if (
            cartState.dataState === this.cartDataState.LOADED &&
            cartState.shoppingCart?.items?.length
          ) {
            return cartState.shoppingCart.items
              .filter(item => item.selected)
              .reduce(
                (acc, item) =>
                  acc + item.product.productPrice.price * item.quantity,
                0
              );
          }
          return 0;
        })
      );

      this.currencySymbol$ = this.shoppingCart$.pipe(
        map(cartState =>
          cartState.shoppingCart?.items?.[0]?.product.productPrice.symbol || '$'
        )
      );

      // ✅ Observe the current coupon from the service
      this.coupon$ = this.couponService.getCoupon$();

      // ✅ Compute total dynamically
      this.total$ = combineLatest([
        this.subtotal$,
        this.currencySymbol$,
        this.coupon$
      ]).pipe(
        map(([subtotal, symbol, coupon]) => {
          const discount = coupon.discountAmount ?? 0;
          const final = Math.max(0, subtotal - discount);
          return `${symbol}${final.toFixed(2)}`;
        })
      );
    }
  }

  // applyCoupon(): void {
  //   const code = this.couponForm.value.code;
  //
  //   this.couponService.applyCoupon(code).subscribe({
  //     next: (coupon) => {
  //       console.log('✅ Coupon applied:', coupon);
  //       this.couponService.setCoupon(
  //         coupon.code,
  //         coupon.discountAmount.price,
  //         coupon.discountAmount.symbol
  //       );
  //     },
  //     error: (err) => {
  //       console.error('❌ Failed to apply coupon:', err.error?.message || err.message);
  //       this.couponService.clear();
  //     }
  //   });
  // }


  applyCoupon(): void {
    const code = this.couponForm.value.code?.trim();

    if (!code) return;

    this.couponService.applyCoupon(code).subscribe({
      next: (coupon) => {
        console.log('✅ Coupon applied:', coupon);

        this.couponService.setCoupon(
          coupon.code,
          coupon.discountAmount.price,
          coupon.discountAmount.symbol,
          coupon.expirationDate
        );

        if (coupon.ativated === false) {

          // 🎬 Start animation
          this.showCouponAnimation = true;
          this.exploded = false;

          // ⏱️ Trigger explosion after 1s
          setTimeout(() => {
            this.exploded = true;

            // ✅ Auto-close after explosion (4s after explode, 5s total)
            setTimeout(() => {
              this.showCouponAnimation = false;
              this.exploded = false;
            }, 4000);
          }, 1000);

        }

      },
      error: (err) => {
        console.error('❌ Failed to apply coupon:', err.error?.message || err.message);
        this.couponService.clear();
        this.showCouponAnimation = false;
        this.exploded = false;
      }
    });
  }




  onHome(): void {
    this.router.navigateByUrl('home');
  }

  onShop(): void {
    const admin = this.secService.hasRoleIn(['ADMIN']);
    const pageSize: PageSize = { page: 0, size: 9 };

    const filterPayload: FilterRequestPayload = {
      admin: admin
    };

    this.store.dispatch(
      new GetProductsPageAction({
        pageSize,
        data: filterPayload
      })
    );

    this.router.navigateByUrl('/searched-products');
  }

  onCheckout(): void {
    this.router.navigateByUrl('/checkout');
  }



}
