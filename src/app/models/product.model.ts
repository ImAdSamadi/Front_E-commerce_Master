import {PageInfo, PageSize} from "./common.model";

export interface Product {
  productId: string;
  name: string;
  addingDate: string;
  brand: string;
  originLocation: string;
  categoryId: string;
  status: string;
  sizeVariants: SizeVariant[]; // New structure
  pickedColor : string | null
  pickedSize : string | null
}

export interface SizeVariant {
  size: string;                     // e.g., "M", "128GB"
  productPrice: ProductPrice;      // Depends on size
  description: string;             // Depends on size
  dimension: Dimension;            // Depends on size
  colorVariants: ColorVariant[];  // Colors for this size
}

export interface ColorVariant {
  color: string;                   // e.g., "Red"
  quantity: number;                // Stock for this size+color
  selected: boolean;               // Selected status
  productImagesBas64: string[];    // Photos specific to this variant
}


export interface Dimension{
  height : number ,
  width: number,
  larger: number ,
  weight : number
}
export interface ProductsPage{
  products: Product[] ,
  pageInfo : PageInfo ;
}


export interface ProductPrice{
  currency:string ,
  price: number ,
  symbol: string
}

export interface CreatedProduct{
  productId: string;
  name: string;
  addingDate: string;
  brand: string;
  originLocation: string;
  categoryId: string;
  status: string;
  sizeVariants: SizeVariant[]; // New structure
  pickedColor? : string
  pickedSize? : string
}

export interface ActionPayload<T>{
  pageSize:PageSize;
  data : T;
}

export interface Review {
  reviewId: string;
  productId: string;
  customerName: string;
  customerEmail: string;
  customerProfileImageBase64?: string;
  reviewText: string;
  rating: number;
  reviewDate: string; // ISO string or formatted date string from backend
  reviewImagesBase64?: string[]
}

export interface ReviewsPage {
  content: Review[];         // ✅ This is what the backend really returns
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

