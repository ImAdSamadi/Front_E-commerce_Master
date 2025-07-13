import {Component, OnInit} from '@angular/core';
import {OrderService} from "../../services/ordersService/order.service";
import {SecurityService} from "../../security/security.service";
import {ShoppingCartService} from "../../services/shoppingCartService/shopping-cart.service";
import {combineLatest, map, Observable} from "rxjs";
import {ShoppingCartState} from "../../ngrx/ShoppingCartState/cart.reducer";
import {DataStateEnum} from "../../ngrx/productsState/products.reducer";
import {Store} from "@ngrx/store";
import {CheckoutService} from "../../services/checkoutService/checkout.service";
import {FilterRequestPayload, PageSize} from "../../models/common.model";
import {GetProductsPageAction} from "../../ngrx/productsState/product.actions";
import {Router} from "@angular/router";
import {Coupon, CouponService} from "../../services/checkoutService/coupon.service";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  customerId = this.securityService.profile.id;

  billingInfo: any = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  };

  shippingInfo: any = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  };

  useDifferentShipping = false;

  // shoppingCart$?:Observable<ShoppingCartState>
  public readonly cartDataState = DataStateEnum;
  // total$?: Observable<string>;

  loading = false;
  error: string | null = null;

  constructor(
    private customerService: ShoppingCartService,
    private store: Store<any>, private router: Router,
    private orderService: OrderService, private couponService: CouponService,
    private checkoutService: CheckoutService,
    public securityService: SecurityService
  ) {}

  // ngOnInit(): void {
  //   this.loadCustomerData();
  //
  //   this.shoppingCart$ = this.store.pipe(
  //     map(state => state.shoppingCartState)
  //   )
  //
  //   this.total$ = this.shoppingCart$.pipe(
  //     map(cartState => {
  //       if (
  //         cartState.dataState === this.cartDataState.LOADED &&
  //         cartState.shoppingCart?.items?.length
  //       ) {
  //         const items = cartState.shoppingCart.items;
  //
  //         const total = items.reduce(
  //           (acc, item) =>
  //             item.selected
  //               ? acc + item.product.productPrice.price * item.quantity
  //               : acc,
  //           0
  //         );
  //
  //         const symbol = items[0].product.productPrice.symbol || '';
  //
  //         return `${symbol}${total}`;
  //       }
  //
  //       // Not loaded or empty
  //       return '';
  //     })
  //   );
  //
  // }


  shoppingCart$!: Observable<ShoppingCartState>;
  subtotal$!: Observable<number>;
  currencySymbol$!: Observable<string>;
  total$!: Observable<string>;
  coupon$!: Observable<Coupon>;


  ngOnInit(): void {
    this.loadCustomerData();

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
        cartState.shoppingCart?.items?.[0]?.product.productPrice.symbol || ''
      )
    );

    this.coupon$ = this.couponService.getCoupon$();

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



  loadCustomerData() {
    this.customerService.getCustomerById(this.customerId!).subscribe({
      next: (customer) => {
        this.billingInfo = {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          address: customer.shippingAddress,
          city: customer.city,
          state: customer.state,
          zipCode: customer.zipCode
        };
      },
      error: (err) => {
        console.error('Failed to fetch customer', err);
      }
    });
  }


  onShipToDifferentAddressChanged(event: any) {
    this.useDifferentShipping = event.target.checked;
  }

  onPlaceOrder() {

    const customerInfo = {
      firstName: this.securityService.profile.firstName!,
      lastName: this.securityService.profile.lastName!,
      customerEmail: this.securityService.profile.email!,
      shippingAddress: '',
      customerId: this.securityService.profile.id!,
      receiverFullName: '',
      receiverEmail: ''
    };

    if (this.useDifferentShipping) {
      // Shipping address from shipping form
      customerInfo.shippingAddress = `${this.shippingInfo.firstName} ${this.shippingInfo.lastName} - ${this.shippingInfo.address}, ${this.shippingInfo.city}, ${this.shippingInfo.state} ${this.shippingInfo.zipCode}, Morocco - Phone: ${this.shippingInfo.phoneNumber} - E-mail: ${this.shippingInfo.email}`;
      customerInfo.receiverFullName = `${this.shippingInfo.firstName} ${this.shippingInfo.lastName}`
      customerInfo.receiverEmail  = `${this.shippingInfo.email}`
    } else {
      // Shipping address same as billing
      customerInfo.shippingAddress = `${this.billingInfo.firstName} ${this.billingInfo.lastName} - ${this.billingInfo.address}, ${this.billingInfo.city}, ${this.billingInfo.state} ${this.billingInfo.zipCode}, Morocco - Phone: ${this.billingInfo.phoneNumber} - E-mail: ${this.billingInfo.email}`;
    }

    // Store in CheckoutService
    this.checkoutService.setCustomerInfo(customerInfo);

    this.loading = true;
    this.error = null;

    if (this.customerId) {

      const createOrderRequest = {
        customerId: this.securityService.profile.id!,
        shippingAddress: customerInfo.shippingAddress,
        receiverFullName: customerInfo.receiverFullName,
        receiverEmail: customerInfo.receiverEmail
      };

      this.orderService.placeOrder(createOrderRequest).subscribe({
        next: (orderId) => this.waitForApprovalUrl(orderId),
        error: (err) => {
          this.loading = false;
          this.error = 'Order failed. Try again.';
          console.error(err);
        }
      });


    }

  }

  private waitForApprovalUrl(orderId: string) {
    const eventSource = this.orderService.listenForApprovalUrl(orderId);

    eventSource.addEventListener('payment-url', (event: any) => {
      const approvalData = JSON.parse(event.data);
      eventSource.close();
      this.loading = false;
      window.location.href = approvalData.paymentUrl;
    });

    eventSource.onerror = (err) => {
      this.loading = false;
      this.error = 'Could not connect to server for payment.';
      console.error('SSE error:', err);
      eventSource.close();
    };
  }



  onShop() {
    const admin = this.securityService.hasRoleIn(['ADMIN']);
    const pageSize: PageSize = { page: 0, size: 9 };

    const filterPayload: FilterRequestPayload = {
      admin: admin,
    };

    this.store.dispatch(new GetProductsPageAction({
      pageSize,
      data: filterPayload
    }));

    this.router.navigateByUrl("/searched-products");
  }


}
