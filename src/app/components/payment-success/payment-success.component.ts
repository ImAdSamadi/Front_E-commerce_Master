import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {OrderService} from "../../services/ordersService/order.service";
import {CheckoutService} from "../../services/checkoutService/checkout.service";
import confetti from 'canvas-confetti';
import {FilterRequestPayload, PageSize} from "../../models/common.model";
import {GetProductsPageAction} from "../../ngrx/productsState/product.actions";
import {Store} from "@ngrx/store";
import {SecurityService} from "../../security/security.service";
import {ShoppingCartService} from "../../services/shoppingCartService/shopping-cart.service";

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})


export class PaymentSuccessComponent implements OnInit {

  loading = true;
  error: string | null = null;
  message: string | null = null;

  paypalOrderId: string | null = null;
  orderId: string | null = null;

  constructor(
    private route: ActivatedRoute, private cartService: ShoppingCartService,
    private checkoutService: CheckoutService,
    private orderService: OrderService, private store :Store<any> ,
    public securityService: SecurityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.paypalOrderId = this.route.snapshot.queryParamMap.get('token');
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');


    if (!this.paypalOrderId || !this.orderId) {
      this.error = 'Missing payment details.';
      this.loading = false;
      return;
    }

    const customerInfo = this.checkoutService.getCustomerInfo();

    if (!customerInfo) {
      this.error = 'Customer info missing.';
      this.loading = false;
      return;
    }

    const captureRequest = {
      paypalOrderId: this.paypalOrderId,
      orderId: this.orderId,
      customerEmailAddress: customerInfo.customerEmailAddress,
      shippingAddress: customerInfo.shippingAddress,
      originatingAddress: "Abdelmalek Essaâdi University – Multidisciplinary Faculty – P.O. Box 745, Main Post Office 92004 – Larache – Morocco",
      firstname: customerInfo.firstname,
      lastname: customerInfo.lastname
    };


    // this.cartService.clearCustomerCart(customerInfo.customerId).subscribe({
    //     next: () => console.log('Cart cleared successfully'),
    //     error: (err) => console.error('Failed to clear cart', err),
    // });


    this.orderService.captureOrder(captureRequest).subscribe({
      next: (res: any) => {
        this.message = 'Payment processed successfully!';
        this.loading = false;
        this.checkoutService.clear();
        this.launchConfetti(); // 🎉 trigger animation
      },
      error: (err) => {
        this.error = 'Payment capture failed. Please contact support.';
        this.loading = false;
        console.error(err);
      }
    });


  }

  goBack() {
    this.router.navigate(['/checkout']);
  }

  launchConfetti(): void {
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#00C897', '#FFC107', '#007BFF', '#E91E63', '#FF5722'];

    // Play sound once at the start 🎶
    this.playSuccessSound();

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 100,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 100,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  playSuccessSound(): void {
    const audio = new Audio('assets/sounds/success-1.mp3');
    audio.volume = 0.4; // optional: control volume
    audio.play().catch(e => console.warn('Auto-play blocked:', e));
  }

  goToShop(): void {
  //   const admin = this.securityService.hasRoleIn(['ADMIN']);
  //   const pageSize: PageSize = { page: 0, size: 9 };
  //
  // // Build your filter payload
  //   const filterPayload: FilterRequestPayload = {
  //     admin: admin,
  //   };
  //
  //   this.store.dispatch(new GetProductsPageAction({
  //     pageSize,
  //     data: filterPayload
  //   }));

    // this.router.navigateByUrl("/searched-products");
    window.location.href = '/home';

  }


}
