import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {AddItemRequest, ShoppingCart} from "../../models/ShoppingCart";
import {DeleteProductReq} from "../../models/common.model";
import {environment} from "../../../environments/environment";
import {Customer} from "../../models/Customer.model";

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  private customerUrl:string =environment.customerService
  constructor(private http : HttpClient) { }

  getShoppingCartOfCustomer(customerId: string):Observable<ShoppingCart> {
        return  this.http.get<ShoppingCart>(this.customerUrl + "/customers/"+ customerId +"/shoppingCart") ;
  }

  calcTotalPrice(cart :ShoppingCart):number {
    let totalPrice:number = 0;
    // cart.items.forEach(
    //   value => totalPrice = totalPrice + (value.quantity * value.product.productPrice.price)
    // )
    return totalPrice ;
  }

  addProductToShoppingCart(addProductReq: AddItemRequest):Observable<ShoppingCart> {
    return  this.http.post<ShoppingCart>(this.customerUrl + "/api/v1/customers" , addProductReq) ;
  }

  deleteItemFromCart(req: DeleteProductReq):Observable<ShoppingCart>{
    return  this.http.delete<ShoppingCart>(this.customerUrl + "/api/v1/customers/" +req.customerId+"/"+req.productId+"/"+req.size+"/"+req.color) ;
  }

  registerCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.customerUrl + "/api/v1/customers/register", customer)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCustomerById(customerId: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.customerUrl}/api/v1/customers/${customerId}`);
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(
      `${this.customerUrl}/api/v1/customers/${customer.customerId}`,
      customer
    );
  }

  clearCustomerCart(customerId: string) {
    return this.http.delete(`${this.customerUrl}/${customerId}`);
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    // You can log the error or map it here if needed
    return throwError(() => error);
  }


}
