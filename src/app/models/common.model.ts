import {Product} from "./product.model";

export interface PageInfo {
  totalPages:number ,
  size:number ,
  totalElements:number ,
  number: number
}

export interface PageSize{
  page: number,
  size: number,
  sort?: string; // e.g. "price,asc" or "addingDate,desc"
}

export interface DeleteProductReq{
  customerId : string ,
  productId : string,
  size: string,
  color: string
}



export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export const CURRENCIES: Record<string, Currency> = {
  USD: { name: 'US Dollar', symbol: '$', code: 'USD' },
  EUR: { name: 'Euro', symbol: '€', code: 'EUR' },
  MAD: { name: 'Moroccan Dirham', symbol: 'DH', code: 'MAD' },
  GBP: { name: 'British Pound', symbol: '£', code: 'GBP' },
  JPY: { name: 'Japanese Yen', symbol: '¥', code: 'JPY' },
  CAD: { name: 'Canadian Dollar', symbol: '$', code: 'CAD' },
  AUD: { name: 'Australian Dollar', symbol: '$', code: 'AUD' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF', code: 'CHF' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', code: 'CNY' },
  INR: { name: 'Indian Rupee', symbol: '₹', code: 'INR' }
};


export enum EventType {
  SEARCH_BY_CATEGORY ="SEARCH_BY_CATEGORY" ,
  SEARCH_BY_KEYWORD = "SEARCH_BY_KEYWORD" ,
  CLICK_PRODUCT = "CLICK_PRODUCT"
}


export interface FilterRequestPayload {
  keyword?: string;
  categoryId?: string;
  sizes?: string[];
  colors?: string[];
  priceRanges?: string[]; // e.g. ["0-100", "200-300"]
  admin?: boolean;
}

export interface FilterRequestWithPagination {
  pageSize: PageSize; // ✅ use your existing one
  data: FilterRequestPayload;
}


export interface ProductWithSelectedFilters {
  product: Product;
  matchedSize?: string;
  matchedColor?: string;
  matchedPriceRange?: string;
  matchedPrice?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;

  last?: boolean;

}



export interface ErrorPayload {
  message: string;
  statusCode?: number;
  origin?: string;
}



export interface ProductsPagePayload {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;  // current page number
  size: number;    // page size
}

export interface ProductsPageRequest {
  pageSize: PageSize;
  admin: boolean;
}
