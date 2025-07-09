import { Injectable } from '@angular/core';

export interface CustomerInfo {

  customerEmailAddress: string
  customerId: string
  shippingAddress: string
  firstname: string
  lastname: string

}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private storageKey = 'customerInfo';

  setCustomerInfo(info: CustomerInfo) {
    localStorage.setItem(this.storageKey, JSON.stringify(info));
  }

  getCustomerInfo(): CustomerInfo | null {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}
