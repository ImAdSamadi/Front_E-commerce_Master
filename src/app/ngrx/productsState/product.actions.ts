import {Action} from "@ngrx/store";
import {ActionPayload, Product} from "../../models/product.model";
import {
  ErrorPayload,
  FilterRequestPayload,
  FilterRequestWithPagination, PagedResponse,
  PageSize, ProductsPagePayload,
  ProductsPageRequest
} from "../../models/common.model";

export enum ProductsActionType  {
  GET_ALL_PRODUCTS = "*PRODUCTS* GET ALL PRODUCTS",
  GET_ALL_PRODUCTS_SUCCESS = "*PRODUCTS* GET ALL PRODUCTS [SUCCESS]",
  GET_ALL_PRODUCTS_ERROR = "*PRODUCTS* GET ALL PRODUCTS [ERROR]" ,

  GET_PRODUCTS_PAGE = "*PRODUCTS* GET  PRODUCTS PAGE ",
  GET_PRODUCT_PAGE_SUCCESS = "*PRODUCTS* GET  PRODUCTS PAGE [SUCCESS]",
  GET_PRODUCTS_PAGE_ERROR = "*PRODUCTS* GET  PRODUCTS PAGE [ERROR]  ",

  GET_PRODUCTS_PAGE_BY_KEYWORD= "*PRODUCTS* GET  PRODUCTS PAGE BY_KEYWORD",
  GET_PRODUCT_PAGE_BY_KEYWORD_SUCCESS = "*PRODUCTS* GET  PRODUCTS PAGE BY_KEYWORD [SUCCESS]",
  GET_PRODUCTS_PAGE_BY_KEYWORD_ERROR = "*PRODUCTS* GET  PRODUCTS PAGE BY_KEYWORD [ERROR]  ",

  GET_PRODUCTS_PAGE_BY_CATEGORY = "*PRODUCTS* GET  PRODUCTS PAGE BY_CATEGORY ",
  GET_PRODUCT_PAGE_BY_CATEGORY_SUCCESS = "*PRODUCTS* GET  PRODUCTS PAGE BY_CATEGORY [SUCCESS]",
  GET_PRODUCTS_PAGE_BY_CATEGORY_ERROR = "*PRODUCTS* GET  PRODUCTS PAGE BY_CATEGORY [ERROR]  ",

  ////////////////////////////////////////////////////////////////////////////////////////////
  GET_PRODUCTS_BY_CATEGORY_WITH_FILTERS = "*PRODUCTS* GET BY CATEGORY + FILTERS",
  GET_PRODUCTS_BY_CATEGORY_WITH_FILTERS_SUCCESS = "*PRODUCTS* GET BY CATEGORY + FILTERS [SUCCESS]",
  GET_PRODUCTS_BY_CATEGORY_WITH_FILTERS_ERROR = "*PRODUCTS* GET BY CATEGORY + FILTERS [ERROR]",

  GET_PRODUCTS_BY_KEYWORD_WITH_FILTERS = "*PRODUCTS* GET BY KEYWORD + FILTERS",
  GET_PRODUCTS_BY_KEYWORD_WITH_FILTERS_SUCCESS = "*PRODUCTS* GET BY KEYWORD + FILTERS [SUCCESS]",
  GET_PRODUCTS_BY_KEYWORD_WITH_FILTERS_ERROR = "*PRODUCTS* GET BY KEYWORD + FILTERS [ERROR]",
  /////////////////////////////////////////////////////////////////////////////////////////////


  DELETE_PRODUCT = "*PRODUCTS* DELETE_PRODUCT ",
  DELETE_PRODUCT_SUCCESS = "*PRODUCTS* DELETE_PRODUCT [SUCCESS]",
  DELETE_PRODUCT_ERROR = "*PRODUCTS* DELETE_PRODUCT [ERROR]  ",
}

/** GetAllProductAction **/
export class GetAllProductsAction implements Action{
  type: ProductsActionType = ProductsActionType.GET_ALL_PRODUCTS;
  constructor(public payload : any) {
  }
}
export class GetAllProductsActionSuccess implements Action{
  type: ProductsActionType = ProductsActionType.GET_ALL_PRODUCTS_SUCCESS;
  constructor(public payload : any) {
  }
}
export class GetAllProductsActionError implements Action{
  type: ProductsActionType = ProductsActionType.GET_ALL_PRODUCTS_ERROR;
  constructor(public payload : string) {
  }
}

/** GetProduct PAGE **/
export class GetProductsPageAction implements Action {
  type = ProductsActionType.GET_PRODUCTS_PAGE;
  constructor(public payload: FilterRequestWithPagination) {}
}

export class GetProductsPageActionSuccess implements Action {
  type: ProductsActionType = ProductsActionType.GET_PRODUCT_PAGE_SUCCESS;
  constructor(public payload: PagedResponse<Product>) {}  // typed payload
}

export class GetProductsPageActionError implements Action {
  type: ProductsActionType = ProductsActionType.GET_PRODUCTS_PAGE_ERROR;
  constructor(public payload: string) {}
}


/** GetAllProduct PAGE BY KEYWORD **/
export class GetProductsPageByKeyWordAction implements Action{
  type: ProductsActionType = ProductsActionType.GET_PRODUCTS_PAGE_BY_KEYWORD;
  constructor(public payload : ActionPayload<String>) {
  }
}
export class GetProductsPageByKeyWordActionSuccess implements Action{
  type: ProductsActionType = ProductsActionType.GET_PRODUCT_PAGE_BY_KEYWORD_SUCCESS;
  constructor(public payload : any) {
  }
}
export class GetProductsPageByKeyWordActionError implements Action{
  type: ProductsActionType = ProductsActionType.GET_PRODUCTS_PAGE_BY_KEYWORD_ERROR;
  constructor(public payload : string) {
  }
}

/** GetAllProduct PAGE BY CATEGORY **/
export class GetProductsPageByCategoryAction implements Action{
  type: ProductsActionType = ProductsActionType.GET_PRODUCTS_PAGE_BY_CATEGORY;
  constructor(public payload : ActionPayload<String>) {
  }
}
export class GetProductsPageByCategoryActionSuccess implements Action{
  type: ProductsActionType = ProductsActionType.GET_PRODUCT_PAGE_BY_CATEGORY_SUCCESS;
  constructor(public payload : any) {
  }
}
export class GetProductsPageByCategoryActionError implements Action{
  type: ProductsActionType = ProductsActionType.GET_PRODUCTS_PAGE_BY_CATEGORY_ERROR;
  constructor(public payload : string) {
  }
}


export class GetProductsByCategoryWithFiltersAction implements Action {
  readonly type = ProductsActionType.GET_PRODUCTS_BY_CATEGORY_WITH_FILTERS;
  constructor(public payload: FilterRequestWithPagination) {}
}

export class GetProductsByCategoryWithFiltersActionSuccess implements Action {
  readonly type = ProductsActionType.GET_PRODUCTS_BY_CATEGORY_WITH_FILTERS_SUCCESS;
  constructor(public payload: PagedResponse<Product>) {} // ✅ with PageInfo
}

export class GetProductsByCategoryWithFiltersActionError implements Action {
  readonly type = ProductsActionType.GET_PRODUCTS_BY_CATEGORY_WITH_FILTERS_ERROR;
  constructor(public payload: ErrorPayload) {}
}



export class GetProductsByKeywordWithFiltersAction implements Action {
  readonly type = ProductsActionType.GET_PRODUCTS_BY_KEYWORD_WITH_FILTERS;
  constructor(public payload: FilterRequestWithPagination) {}
}

export class GetProductsByKeywordWithFiltersActionSuccess implements Action {
  readonly type = ProductsActionType.GET_PRODUCTS_BY_KEYWORD_WITH_FILTERS_SUCCESS;
  constructor(public payload: PagedResponse<Product>) {}
}

export class GetProductsByKeywordWithFiltersActionError implements Action {
  readonly type = ProductsActionType.GET_PRODUCTS_BY_KEYWORD_WITH_FILTERS_ERROR;
  constructor(public payload: ErrorPayload) {}
}





// /** delete product by id **/
// export class DeleteProductAction implements Action{
//   type: ProductsActionType = ProductsActionType.DELETE_PRODUCT;
//   constructor(public payload : string) {
//   }
// }
// export class DeleteProductActionSuccess implements Action{
//   type: ProductsActionType = ProductsActionType.DELETE_PRODUCT_SUCCESS;
//   constructor(public payload : any) {
//   }
// }
// export class DeleteProductActionError implements Action{
//   type: ProductsActionType = ProductsActionType.DELETE_PRODUCT_ERROR;
//   constructor(public payload : string) {
//   }
// }
export type ProductAction = GetAllProductsAction | GetAllProductsActionSuccess | GetAllProductsActionError |
   GetProductsPageAction | GetProductsPageActionSuccess | GetProductsPageActionError |
   GetProductsPageByKeyWordAction | GetProductsPageByKeyWordActionSuccess | GetProductsPageByKeyWordActionError |
   GetProductsPageByCategoryAction | GetProductsPageByCategoryActionSuccess | GetProductsPageByCategoryActionError
   // |  DeleteProductAction | DeleteProductActionSuccess | DeleteProductActionError
;
