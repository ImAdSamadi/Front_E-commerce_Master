import {Component, Input} from '@angular/core';
import {Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {Store} from "@ngrx/store";
import {SecurityService} from "../../../security/security.service";
import {CategoryService} from "../../../services/productService/category.service";
import {FilterRequestPayload, PageSize} from "../../../models/common.model";
import {GetProductsPageAction} from "../../../ngrx/productsState/product.actions";

@Component({
  selector: 'app-searched-products-list-header',
  templateUrl: './searched-products-list-header.component.html',
  styleUrls: ['./searched-products-list-header.component.css']
})
export class SearchedProductsListHeaderComponent {

  constructor(private router : Router , private store :Store<any> ,
              public securityService: SecurityService,) {}

  @Input() productsNumber!: number ;


  onHome() {
    this.router.navigateByUrl("home")
  }

  onShop() {
    const admin = this.securityService.hasRoleIn(['ADMIN']);
    const pageSize: PageSize = { page: 0, size: 9 };

    const filterPayload: FilterRequestPayload = {
      admin: admin,
    };

    this.store.dispatch(new GetProductsPageAction({
      pageSize,
      data: filterPayload
    }));

    this.router.navigateByUrl("/searched-products");
  }

}
