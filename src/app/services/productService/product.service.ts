import {Injectable, OnInit} from '@angular/core';
import {map, Observable, switchMap} from "rxjs";
import {ActionPayload, CreatedProduct, Product, ProductPrice, ProductsPage} from "../../models/product.model";
import {HttpClient, HttpParams} from "@angular/common/http";
import {
  EventType,
  FilterRequestPayload,
  FilterRequestWithPagination, PagedResponse,
  PageSize,
  ProductsPagePayload
} from "../../models/common.model";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductService implements OnInit{

  private productService:string = environment.productService
  ngOnInit(): void {
  }

  constructor(private http : HttpClient) { }

  public getAllProducts():Observable<Product[]>{
     return  this.http.get<Product[]>(this.productService + "/products")
  }


  public getProductsPage(filterRequest: FilterRequestWithPagination): Observable<PagedResponse<Product>> {
    const { pageSize, data } = filterRequest;

    let params = new HttpParams()
      .set('admin', String(data.admin || false))
      .set('page', pageSize.page.toString())
      .set('size', pageSize.size.toString());

    if (pageSize.sort) {
      params = params.set('sort', pageSize.sort); // add sort param
    }

    if (data.priceRanges?.length) {
      data.priceRanges.forEach(range => {
        params = params.append('priceRanges', range);
      });
    }

    return this.http.get<PagedResponse<Product>>(
      `${this.productService}/api/v1/products/all`,
      { params }
    );
  }

  getProductsByCategoryWithFilters(payload: FilterRequestWithPagination): Observable<PagedResponse<Product>> {
    const { pageSize, data } = payload;

    let params = new HttpParams()
      .set('categoryId', data.categoryId || '')
      .set('admin', String(data.admin || false))
      .set('page', pageSize.page.toString())
      .set('size', pageSize.size.toString());

    if (pageSize.sort) {
      params = params.set('sort', pageSize.sort); // add sort param
    }

    if (data.sizes?.length) params = params.set('sizes', data.sizes.join(','));
    if (data.colors?.length) params = params.set('colors', data.colors.join(','));
    if (data.priceRanges?.length) params = params.set('priceRanges', data.priceRanges.join(','));

    return this.http.get<PagedResponse<Product>>(this.productService + "/api/v1/products/by-category", { params });
  }


  getProductsByKeywordWithFilters(payload: FilterRequestWithPagination): Observable<PagedResponse<Product>> {
    const { pageSize, data } = payload;

    let params = new HttpParams()
      .set('keyword', data.keyword || '')
      .set('admin', String(data.admin || false))
      .set('page', pageSize.page.toString())
      .set('size', pageSize.size.toString());

    if (pageSize.sort) {
      params = params.set('sort', pageSize.sort); // add sort param
    }

    if (data.sizes?.length) params = params.set('sizes', data.sizes.join(','));
    if (data.colors?.length) params = params.set('colors', data.colors.join(','));
    if (data.priceRanges?.length) params = params.set('priceRanges', data.priceRanges.join(','));

    return this.http.get<PagedResponse<Product>>(this.productService + "/api/v1/products/search", { params });
  }

  public getProductById(productId : string): Observable<Product> {
    return this.http.get<Product>(this.productService + "/api/v1/products/find/" + productId)
  }

  public getSelectedProducts(pageSize : PageSize): Observable<Product[]> {
    return this.http.get<Product[]>(this.productService + "/products/search/findBySelected?selected=true&page=" + pageSize.page +"&size="+pageSize.size)
  }
  public getProductsPageByKeyword(payload : ActionPayload<String>): Observable<Product[]> {
    return this.http.get<Product[]>(this.productService + "/products/search/findByNameContainsIgnoreCase?keyword=" + payload.data +"&page=" + payload.pageSize.page +"&size="+payload.pageSize.size)
  }

  public getProductsPageByCategory(payload : ActionPayload<String>): Observable<Product[]> {
    return this.http.get<Product[]>(this.productService + "/products/search/findByCategoryId?category=" + payload.data +"&page=" + payload.pageSize.page +"&size="+payload.pageSize.size)
  }

  public publishEvent(productId : string , eventType : EventType , customerId : string){
      this.http.get<void>(this.productService + "/api/v1/products/event/"+productId +"/" + customerId + "/" + eventType.toString()).subscribe(value =>
      {
      })
  }

  public saveProduct(product : CreatedProduct):Observable<Product>{
    return this.http.post<Product>(this.productService + "/api/v1/products" , product) ;
  }

  public editProduct(product : CreatedProduct):Observable<Product>{
    return this.http.put<Product>(this.productService + "/api/v1/products" , product) ;
  }

  public deleteProduct(productId : string):Observable<Product>{
     return this.http.delete<Product>(this.productService + "/products/" + productId) ;
  }


  public getDate(product : Product){
    return product.addingDate.slice(0 ,10);
  }

  // getProductsByCategoryWithFilters(payload: FilterRequestWithPagination): Observable<PagedResponse<Product>> {
  //   const { pageSize, data } = payload;
  //
  //   let params = new HttpParams()
  //     .set('categoryId', data.categoryId || '')
  //     .set('admin', String(data.admin || false))
  //     .set('page', pageSize.page.toString())
  //     .set('size', pageSize.size.toString());
  //
  //   if (pageSize.sort) {
  //     params = params.set('sort', pageSize.sort); // add sort param
  //   }
  //
  //   if (data.sizes?.length) params = params.set('sizes', data.sizes.join(','));
  //   if (data.colors?.length) params = params.set('colors', data.colors.join(','));
  //   if (data.priceRanges?.length) params = params.set('priceRanges', data.priceRanges.join(','));
  //
  //   return this.http.get<PagedResponse<Product>>(this.productService + "/api/v1/products/by-category", { params });
  // }
  //
  //
  // getProductsByKeywordWithFilters(payload: FilterRequestWithPagination): Observable<PagedResponse<Product>> {
  //   const { pageSize, data } = payload;
  //
  //   let params = new HttpParams()
  //     .set('keyword', data.keyword || '')
  //     .set('admin', String(data.admin || false))
  //     .set('page', pageSize.page.toString())
  //     .set('size', pageSize.size.toString());
  //
  //   if (pageSize.sort) {
  //     params = params.set('sort', pageSize.sort); // add sort param
  //   }
  //
  //   if (data.sizes?.length) params = params.set('sizes', data.sizes.join(','));
  //   if (data.colors?.length) params = params.set('colors', data.colors.join(','));
  //   if (data.priceRanges?.length) params = params.set('priceRanges', data.priceRanges.join(','));
  //
  //   return this.http.get<PagedResponse<Product>>(this.productService + "/api/v1/products/search", { params });
  // }




}
