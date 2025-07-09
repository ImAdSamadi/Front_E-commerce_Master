import {Product, ProductPrice} from "./product.model";

export interface ShoppingCart {
  id:string ,
  customerId: string,
  items: ShoppingCartItem[]
}

export interface ShoppingCartItem{
  product : CartProduct ,
  quantity : number
}

export interface AddItemRequest{

  productId?:string
  customerId: string
  quantity? : number
  pickedSize?: string
  pickedColor?: string

}

export interface CartProduct {

  productId: string;
  name: string;
  productPrice: ProductPrice;
  originLocation: string;
  pickedColor?: string;       // Optional, since it might be null in Java
  pickedSize?: string;        // Optional, same as above
  productImagesBas64: string[];  // List of base64-encoded images as strings

}
