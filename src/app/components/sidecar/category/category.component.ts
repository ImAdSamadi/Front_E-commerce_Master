import {Component, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {Router} from "@angular/router";
import {GetProductsPageByCategoryAction} from "../../../ngrx/productsState/product.actions";
import {map, Observable} from "rxjs";
import {ShoppingCartState} from "../../../ngrx/ShoppingCartState/cart.reducer";
import {DataStateEnum} from "../../../ngrx/productsState/products.reducer";
import {ShoppingCartService} from "../../../services/shoppingCartService/shopping-cart.service";
import {SecurityService} from "../../../security/security.service";
import {GetShoppingCartAction} from "../../../ngrx/ShoppingCartState/cart.actions";
import {Category} from "../../../models/category.model";
import {CategoryService} from "../../../services/productService/category.service";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit{

  // categories : string[] =  Object.values(ProductsCategory).map((color) => String(color));
  categories: Category[] = [];
  shoppingCart$? : Observable<ShoppingCartState>
  public readonly CartDataState = DataStateEnum ;
  constructor(private store:Store<any> , private router: Router , public shoppingCartService:ShoppingCartService ,
              private secService: SecurityService, private categoryService: CategoryService) {
  }

  ngOnInit(): void {
    this.categoryService.loadCategories().subscribe((cats) => {
      this.categories = cats;
    });
    if(this.secService.profile){
      if(this.secService.profile.id){
        this.store.dispatch(new GetShoppingCartAction(this.secService.profile.id))
        this.shoppingCart$ = this.store.pipe(
          map(state => state.shoppingCartState)
        )
      }
    }
  }
  onSearchByCategory(cat: string) {
    this.store.dispatch(new GetProductsPageByCategoryAction({pageSize:{page:0 , size:9} ,data:cat}))
    this.router.navigateByUrl("/searched-products")
  }

  goToShCart() {
    this.router.navigateByUrl("/cart") ;
  }
}
