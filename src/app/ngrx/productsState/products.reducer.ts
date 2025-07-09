import { Product} from "../../models/product.model";
import {
  GetProductsByCategoryWithFiltersAction,
  GetProductsByCategoryWithFiltersActionError,
  GetProductsByCategoryWithFiltersActionSuccess,
  GetProductsByKeywordWithFiltersAction,
  GetProductsByKeywordWithFiltersActionError,
  GetProductsByKeywordWithFiltersActionSuccess,
  GetProductsPageAction,
  GetProductsPageActionError,
  GetProductsPageActionSuccess,
  ProductAction,
  ProductsActionType
} from "./product.actions";
import {sample} from "rxjs";
import {Action} from "@ngrx/store";
import {FilterRequestWithPagination, PageInfo, ProductsPagePayload} from "../../models/common.model";

export enum DataStateEnum{
  LOADING="Loading",
  LOADED ="Loaded",
  ERROR = "Error",
  INITIAL="Initial",
  EDIT = "EDIT" ,
  EDITED = "EDITED" ,
}
export enum FetchMethode{
  ALL="ALL"  ,
  PAGE = "PAGE",
  SEARCH_BY_KEYWORD = "SEARCH_BY_KEYWORD",
  SEARCH_BY_CATEGORY= "SEARCH_BY_CATEGORY"
}
export interface ProductState{
  products: Product[] ,
  errorMessage: string ,
  dataState: DataStateEnum,
  pageInfo?: PageInfo ,
  fetchMethode?: FetchMethode,
  lastFilterPayload?: FilterRequestWithPagination;
}

const initState:ProductState = {
  products:[] ,
  errorMessage:"" ,
  dataState:DataStateEnum.INITIAL ,
}
export function productReducer(state:ProductState=initState , action : Action) : ProductState{
  switch (action.type){
    //get All Products
    case ProductsActionType.GET_ALL_PRODUCTS:
      return {...state , dataState:DataStateEnum.LOADING}
    case ProductsActionType.GET_ALL_PRODUCTS_SUCCESS:
      return  {...state , dataState:DataStateEnum.LOADED , products:(<ProductAction>(action)).payload._embedded.products ,pageInfo:(<ProductAction>(action)).payload.page , fetchMethode:FetchMethode.ALL };
    case ProductsActionType.GET_ALL_PRODUCTS_ERROR:
      return {...state , dataState:DataStateEnum.ERROR , errorMessage:(<ProductAction>(action)).payload}

    // //Get  Product Page
    // case ProductsActionType.GET_PRODUCTS_PAGE:
    //   return {...state , dataState:DataStateEnum.LOADING}
    // case ProductsActionType.GET_PRODUCT_PAGE_SUCCESS:
    //   return  {...state , dataState:DataStateEnum.LOADED , products:(<ProductAction>(action)).payload._embedded.products ,pageInfo:(<ProductAction>(action)).payload.page,fetchMethode:FetchMethode.PAGE };
    // case ProductsActionType.GET_PRODUCTS_PAGE_ERROR:
    //   return {...state , dataState:DataStateEnum.ERROR , errorMessage:(<ProductAction>(action)).payload}


    // Get Product Page
    // Reducer for GET_PRODUCTS_PAGE actions
    case ProductsActionType.GET_PRODUCTS_PAGE:
      return {
        ...state,
        dataState: DataStateEnum.LOADING,
        lastFilterPayload: (action as GetProductsPageAction).payload  // store current filters
      };

    case ProductsActionType.GET_PRODUCT_PAGE_SUCCESS:
      const payload = (action as GetProductsPageActionSuccess).payload;
      return {
        ...state,
        dataState: DataStateEnum.LOADED,
        products: payload.content,
        pageInfo: {
          totalElements: payload.totalElements,
          totalPages: payload.totalPages,
          size: payload.size,
          number: payload.number,
        },
        fetchMethode: FetchMethode.PAGE
      };

    case ProductsActionType.GET_PRODUCTS_PAGE_ERROR:
      return {
        ...state,
        dataState: DataStateEnum.ERROR,
        errorMessage: (action as GetProductsPageActionError).payload
      };



    //Get  Product Page by Keyword
    // case ProductsActionType.GET_PRODUCTS_PAGE_BY_KEYWORD:
    //   return {...state , dataState:DataStateEnum.LOADING}
    // case ProductsActionType.GET_PRODUCT_PAGE_BY_KEYWORD_SUCCESS:
    //   return  {...state , dataState:DataStateEnum.LOADED , products:(<ProductAction>(action)).payload._embedded.products ,pageInfo:(<ProductAction>(action)).payload.page , fetchMethode:FetchMethode.SEARCH_BY_KEYWORD };
    // case ProductsActionType.GET_PRODUCTS_PAGE_BY_KEYWORD_ERROR:
    //   return {...state , dataState:DataStateEnum.ERROR , errorMessage:(<ProductAction>(action)).payload}
    //
    //Get  Product Page by Category
    // case ProductsActionType.GET_PRODUCTS_PAGE_BY_CATEGORY:
    //   return {...state , dataState:DataStateEnum.LOADING}
    // case ProductsActionType.GET_PRODUCT_PAGE_BY_CATEGORY_SUCCESS:
    //   return  {...state , dataState:DataStateEnum.LOADED , products:(<ProductAction>(action)).payload._embedded.products ,pageInfo:(<ProductAction>(action)).payload.page ,fetchMethode:FetchMethode.SEARCH_BY_CATEGORY };
    // case ProductsActionType.GET_PRODUCTS_PAGE_BY_CATEGORY_ERROR:
    //   return {...state , dataState:DataStateEnum.ERROR , errorMessage:(<ProductAction>(action)).payload}
    //


    // Get Products by Category + Filters
    case ProductsActionType.GET_PRODUCTS_BY_CATEGORY_WITH_FILTERS:
      return {
        ...state,
        dataState: DataStateEnum.LOADING,
        lastFilterPayload: (action as GetProductsByCategoryWithFiltersAction).payload
      };


    case ProductsActionType.GET_PRODUCTS_BY_CATEGORY_WITH_FILTERS_SUCCESS:
      return {
        ...state,
        dataState: DataStateEnum.LOADED,
        products: (action as GetProductsByCategoryWithFiltersActionSuccess).payload.content,
        pageInfo: {
          totalElements: (action as GetProductsByCategoryWithFiltersActionSuccess).payload.totalElements,
          totalPages: (action as GetProductsByCategoryWithFiltersActionSuccess).payload.totalPages,
          size: (action as GetProductsByCategoryWithFiltersActionSuccess).payload.size,
          number: (action as GetProductsByCategoryWithFiltersActionSuccess).payload.number,
        },
        fetchMethode: FetchMethode.SEARCH_BY_CATEGORY
      };

    case ProductsActionType.GET_PRODUCTS_BY_CATEGORY_WITH_FILTERS_ERROR:
      return {
        ...state,
        dataState: DataStateEnum.ERROR,
        errorMessage: (action as GetProductsByCategoryWithFiltersActionError).payload.message
      };


// Get Products by Keyword + Filters
    case ProductsActionType.GET_PRODUCTS_BY_KEYWORD_WITH_FILTERS:
      return {
        ...state,
        dataState: DataStateEnum.LOADING,
        lastFilterPayload: (action as GetProductsByKeywordWithFiltersAction).payload
      };


    case ProductsActionType.GET_PRODUCTS_BY_KEYWORD_WITH_FILTERS_SUCCESS:
      return {
        ...state,
        dataState: DataStateEnum.LOADED,
        products: (action as GetProductsByKeywordWithFiltersActionSuccess).payload.content,
        pageInfo: {
          totalElements: (action as GetProductsByKeywordWithFiltersActionSuccess).payload.totalElements,
          totalPages: (action as GetProductsByKeywordWithFiltersActionSuccess).payload.totalPages,
          size: (action as GetProductsByKeywordWithFiltersActionSuccess).payload.size,
          number: (action as GetProductsByKeywordWithFiltersActionSuccess).payload.number,
        },
        fetchMethode: FetchMethode.SEARCH_BY_KEYWORD
      };

    case ProductsActionType.GET_PRODUCTS_BY_KEYWORD_WITH_FILTERS_ERROR:
      return {
        ...state,
        dataState: DataStateEnum.ERROR,
        errorMessage: (action as GetProductsByKeywordWithFiltersActionError).payload.message
      };



    default: return {...state}
  }
}
