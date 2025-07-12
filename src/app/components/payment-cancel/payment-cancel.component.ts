import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ShoppingCartService} from "../../services/shoppingCartService/shopping-cart.service";
import {CheckoutService} from "../../services/checkoutService/checkout.service";
import {OrderService} from "../../services/ordersService/order.service";
import {Store} from "@ngrx/store";
import {SecurityService} from "../../security/security.service";
import confetti from "canvas-confetti";


@Component({
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.component.html',
  styleUrls: ['./payment-cancel.component.css']
})

export class PaymentCancelComponent implements OnInit {
  loading = true;
  error: string | null = null;
  message: string | null = null;

  orderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private cartService: ShoppingCartService,
    private checkoutService: CheckoutService,
    private orderService: OrderService,
    private store: Store<any>,
    public securityService: SecurityService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.orderId = this.route.snapshot.queryParamMap.get('orderId');

    if (!this.orderId) {
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

      orderId: this.orderId,
      customerId: customerInfo.customerId,
      customerEmailAddress: customerInfo.customerEmail,
      shippingAddress: customerInfo.shippingAddress,
      originatingAddress: "Abdelmalek Essaâdi University – Multidisciplinary Faculty – P.O. Box 745, Main Post Office 92004 – Larache – Morocco",
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      receiverFullName: customerInfo.receiverFullName,
      receiverEmail: customerInfo.receiverEmail

    };

    this.orderService.captureOrder(captureRequest).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Your payment went through unexpectedly.';
      },
      error: (err) => {
        console.error(err);

        this.message = 'Your payment was cancelled. You have not been charged.';
        this.error = null;
        this.loading = false;

        this.checkoutService.clear();
        this.launchCancelAnimation();
      }
    });

  }

  goBack(): void {
    this.router.navigate(['/checkout']);
  }

  goToCheckout(): void {
    // this.router.navigateByUrl("/cart")
    this.router.navigateByUrl("/checkout");
  }

  launchCancelAnimation(): void {
    this.playCancelSound();
    this.shakeScreen();
  }


  shakeScreen(): void {
    const el = document.querySelector('.cancel-page-container');
    if (!el) return;

    const keyframes = [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-10px, 0)' },
      { transform: 'translate(10px, 0)' },
      { transform: 'translate(-10px, 0)' },
      { transform: 'translate(10px, 0)' },
      { transform: 'translate(0, 0)' },
    ];

    const timing = { duration: 500, iterations: 1 };

    el.animate(keyframes, timing);
  }



  playCancelSound(): void {
    const audio = new Audio('assets/sounds/spin-fail.mp3');
    audio.volume = 0.2;
    audio.play().catch((e) => console.warn('Auto-play blocked:', e));
  }



}
