import {Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {map, Observable} from "rxjs";
import {ProductItemState} from "../../ngrx/Product-item-State/productItem.reducers";
import {ProductService} from "../../services/productService/product.service";
import {DataStateEnum, FetchMethode} from "../../ngrx/productsState/products.reducer";
import {EventType} from "../../models/common.model";
import {SecurityService} from "../../security/security.service";
import {ColorVariant, Product, SizeVariant} from "../../models/product.model";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {


  // productItem$?:Observable<ProductItemState>
  // constructor(private store:Store<any> , private productService : ProductService , private secService: SecurityService) {
  // }
  // ngOnInit(): void {
  //   this.productItem$ = this.store.pipe(
  //     map(state => state.productItemState )
  //   )
  //
  //   this.store.subscribe(
  //     s => {
  //       if(s.productItemState.dataState == DataStateEnum.LOADED) {
  //         if(s.productItemState.product && this.secService.profile.id){
  //           // this.productService.publishEvent(s.productItemState.product.productId , EventType.CLICK_PRODUCT , this.secService.profile.id)
  //         }
  //       }
  //     })
  // }


  product$!: Observable<Product | null>;
  selectedSize: string | null = null;
  selectedColor: string | null = null;

  constructor(private route: ActivatedRoute, private store: Store<any>) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.selectedSize = params['size'] || null;
      this.selectedColor = params['color'] || null;
    });

    this.product$ = this.store.pipe(
      map(state => state.productItemState.product)
    );
  }

  onVariantChange(event: { size: string, color: string }) {
    this.selectedSize = event.size;
    this.selectedColor = event.color;
  }



}
