import { Injectable } from '@angular/core';

export interface CustomerInfo {

  customerEmail: string
  customerId: string
  shippingAddress: string
  firstName: string
  lastName: string
  receiverFullName: string
  receiverEmail: string

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
