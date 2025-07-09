import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Store} from "@ngrx/store";
import {
  GetProductsByCategoryWithFiltersAction, GetProductsByKeywordWithFiltersAction,
  GetProductsPageAction,
  GetProductsPageByCategoryAction,
  GetProductsPageByKeyWordAction
} from "../../ngrx/productsState/product.actions";
import {map, Observable} from "rxjs";
import {ShoppingCartState} from "../../ngrx/ShoppingCartState/cart.reducer";
import {GetShoppingCartAction} from "../../ngrx/ShoppingCartState/cart.actions";
import {DataStateEnum} from "../../ngrx/productsState/products.reducer";
import {environment} from "../../../environments/environment";
import {SecurityService} from "../../security/security.service";
import {Category} from "../../models/category.model";
import {CategoryService} from "../../services/productService/category.service";
import {FilterRequestPayload, FilterRequestWithPagination, PageSize} from "../../models/common.model";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{

  activeLink: string = '';
  // categories : string[] =  Object.values(ProductsCategory).map((color) => String(color));
  categories: Category[] = [];
  searchFormGroup? : FormGroup
  shoppingCart$? : Observable<ShoppingCartState>
  public readonly CartDataState = DataStateEnum ;
  constructor(private router : Router , private fb : FormBuilder , private store :Store<any> ,
              public securityService: SecurityService, private categoryService: CategoryService
              ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        if (url.includes('/cart')) this.activeLink = 'cart';
        else if (url.includes('/checkout')) this.activeLink = 'checkout';
        else if (url.includes('/searched-products')) this.activeLink = 'shop';
        else if (url.includes('/product-details')) this.activeLink = 'shop';
        else if (url.includes('/orders')) this.activeLink = 'orders';
        else if (url.includes('/payment-cancel')) this.activeLink = 'orders';
        else if (url.includes('/payment-success')) this.activeLink = 'orders';
        else if (url.includes('/contact')) this.activeLink = 'contact';
        else if (url.includes('/admin')) this.activeLink = 'dashboard';
        else if (url.includes('/addProduct')) this.activeLink = 'dashboard';
        else if (url.includes('/edit-product')) this.activeLink = 'dashboard';
        else this.activeLink = 'home';
      }
    });

  }


  ngOnInit(): void {

    this.categoryService.loadCategories().subscribe((cats) => {
      this.categories = cats;
    });
    this.searchFormGroup=this.fb.group(
      {
        keyword: [""],
        category:['ALL']
      }
    )
    this.shoppingCart$ = this.store.pipe(
      map(state => state.shoppingCartState)
    )

    // if(this.securityService.profile){
    //   if(this.securityService.profile.id)
    //     this.store.dispatch(new GetShoppingCartAction(this.securityService.profile.id )) ;
    // }
    // if(this.securityService.profile){
    //   console.log(this.securityService.profile.id)
    // }
  }

  onHome() {
    this.router.navigate(['/home']);
  }

  onContact() {
    this.router.navigate(['/contact']);
  }

  onSearchProduct(params: { categoryId?: string; keyword?: string }) {

    const { categoryId, keyword } = params;

    const page = 0;
    const size = 9;
    const admin = this.securityService.hasRoleIn(['ADMIN']);
    const sizes: string[] = [];
    const colors: string[] = [];
    const priceRanges: string[] = [];


    let payload: FilterRequestWithPagination;

    if (categoryId) {
      payload = {
        pageSize: { page, size },
        data: {
          categoryId,
          sizes,
          colors,
          priceRanges,
          admin,
        },
      };
      this.store.dispatch(new GetProductsByCategoryWithFiltersAction(payload));
      this.router.navigateByUrl("/searched-products");
    } else if (keyword) {
      payload = {
        pageSize: { page, size },
        data: {
          keyword,
          sizes,
          colors,
          priceRanges,
          admin,
        },
      };
      this.store.dispatch(new GetProductsByKeywordWithFiltersAction(payload));
      this.router.navigateByUrl("/searched-products");
      console.log("Searching by keyword:", keyword);
    } else {
      console.log('No search input');
    }

  }

  onShop() {
    const admin = this.securityService.hasRoleIn(['ADMIN']);
    const pageSize: PageSize = { page: 0, size: 9 };

// Build your filter payload
    const filterPayload: FilterRequestPayload = {
      admin: admin,
      // add other filter fields here if needed, e.g.:
      // priceRange: ..., color: ..., size: ...
    };

    this.store.dispatch(new GetProductsPageAction({
      pageSize,
      data: filterPayload
    }));

    this.router.navigateByUrl("/searched-products");
  }

  onShCart() {
    this.router.navigateByUrl("/cart")
  }

  onProfile() {
    this.router.navigateByUrl("/profile")
  }

  onOrders() {
    this.router.navigate(['/orders']);
  }

  onRegister() {
    this.router.navigateByUrl("register")
  }

  onAdmin() {
    this.router.navigateByUrl("/admin")
  }

  onCheckout() {
    this.router.navigate(['/checkout']);
  }


}
