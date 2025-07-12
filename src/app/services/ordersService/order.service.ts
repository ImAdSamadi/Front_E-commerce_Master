import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";
import {Orders, Shipment} from "../../models/order.model";
import {PagedResponse} from "../../models/common.model";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private orderUrl:string = environment.orderService
  private paymentUrl:string = environment.paymentService
  private shipmentUrl:string = environment.shipmentService

  // private baseUrl = "http://localhost:8089/api/v1/orders";
  // private paymentUrl = "http://localhost:8082/api/v1/payments/capture";
  // private shipmentUrl = 'http://localhost:8085/api/v1/shipments';

  constructor(private http: HttpClient) {}


  placeOrder(createOrderRequest: any): Observable<string> {
    return this.http.post(
      `${this.orderUrl}/api/v1/orders`,
      createOrderRequest,
      { responseType: 'text' }  // <== important to get plain text response
    );
  }


  // getOrdersForCustomer(customerId: string): Observable<Orders[]> {
  //   return this.http.get<Orders[]>(`${this.baseUrl}/customer/${customerId}`);
  // }

  getOrdersForCustomer(
    customerId: string,
    page: number,
    size: number,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc',
    status?: string
  ): Observable<PagedResponse<Orders>> {
    let params: any = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir
    };

    if (status) {
      params.status = status;
    }

    return this.http.get<PagedResponse<Orders>>(`${this.orderUrl}/api/v1/orders/customer/${customerId}`, { params });
  }





  listenForApprovalUrl(orderId: string): EventSource {
    return new EventSource(`${this.paymentUrl}/api/v1/payments/${orderId}/events`);
  }

  captureOrder(captureRequest: any) {
    return this.http.post(`${this.paymentUrl}/api/v1/payments/capture`, captureRequest);
  }


  getShipmentByOrderId(orderId: string): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.shipmentUrl}/api/v1/shipments/order/${orderId}`);
  }


}
