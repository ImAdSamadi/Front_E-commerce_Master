import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {SingleCategorieComponent} from "../single-categorie/single-categorie.component";
import {AsyncPipe, NgForOf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {Category} from "../../../models/category.model";
import {Store} from "@ngrx/store";
import {CategoryService} from "../../../services/productService/category.service";
import {
  GetProductsByCategoryWithFiltersAction,
  GetProductsPageByCategoryAction
} from "../../../ngrx/productsState/product.actions";
import {SecurityService} from "../../../security/security.service";
import {FilterRequestWithPagination} from "../../../models/common.model";

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    SingleCategorieComponent,
    NgForOf,
    AsyncPipe,
    RouterLink,
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit{

  categories: Category[] = [];
  constructor(private store:Store<any>, private router: Router, public securityService: SecurityService,
              private categoryService: CategoryService) {
  }

  ngOnInit(): void {

    this.categoryService.loadCategories().subscribe((cats) => {
      this.categories = cats;
    });

  }

  // onCategorieClicked(cat: string) {
  //   this.store.dispatch(new GetProductsPageByCategoryAction({pageSize:{page:0 , size:9} ,data:cat}))
  //   this.router.navigateByUrl("/searched-products")
  // }

  onCategorieClicked(cat: string) {

    let payload: FilterRequestWithPagination;

    const categoryId = cat
    const page = 0;
    const size = 9;
    const admin = this.securityService.hasRoleIn(['ADMIN']);
    const sizes: string[] = [];
    const colors: string[] = [];
    const priceRanges: string[] = [];

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


  }


}
