import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {Injectable} from "@angular/core";

// models/coupon.model.ts
export interface Coupon {
  code: string;
  discountAmount: number;
  currency: string,
  expirationDate: string;
}


@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private baseUrl = 'http://localhost:8084/api/v1/coupons';

  constructor(private http: HttpClient) {}

  applyCoupon(code: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/apply/${code}`, {});
  }


  // Storing the Coupon Locally
  private coupon$ =
    new BehaviorSubject<Coupon>({ code: '', discountAmount: 0, currency: '$', expirationDate: '' });

  // Set full coupon object
  setCoupon(code: string, amount: number, symbol: string, expirationDate: string): void {
    this.coupon$.next({ code, discountAmount: amount, currency: symbol, expirationDate });
  }

  // Observable to listen to changes
  getCoupon$(): Observable<Coupon> {
    return this.coupon$.asObservable();
  }

  // Sync accessors
  getCouponValue(): Coupon {
    return this.coupon$.getValue();
  }

  // Clear coupon
  clear(): void {
    this.coupon$.next({ code: '', discountAmount: 0, currency: '', expirationDate: '' });
  }


}
