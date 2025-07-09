import {ProductPrice} from "./product.model";

export interface Orders {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  priceAtPurchase: ProductPrice
  quantity: number;
  pickedColor: string;
  pickedSize: string;
  productImagesBase64: string[];
  originLocation?: string;
}

export interface Shipment {
  shipmentId: string;
  orderId: string;
  status: string; // or an enum if you have it defined
  shippedDate?: string; // ISO date string
  deliveredDate?: string;
  trackingNumber?: string;
  origin?: string;
  destination?: string;
  estimatedDeliveryDate?: string;
}
