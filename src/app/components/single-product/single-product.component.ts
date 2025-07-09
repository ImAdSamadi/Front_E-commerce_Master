import {Component, Input, OnInit} from '@angular/core';
import {Product, SizeVariant} from "../../models/product.model";
import {Store} from "@ngrx/store";
import {Router} from "@angular/router";
import {GetProductItemAction} from "../../ngrx/Product-item-State/productItem.actions";
import {AddProductToCartAction} from "../../ngrx/ShoppingCartState/cart.actions";
import {AddItemRequest} from "../../models/ShoppingCart";
import {environment} from "../../../environments/environment";
import {ProductService} from "../../services/productService/product.service";
import {SecurityService} from "../../security/security.service";
import {GetProductsPageAction} from "../../ngrx/productsState/product.actions";
import {ProductWithSelectedFilters} from "../../models/common.model";
import {ReviewService} from "../../services/productService/review.service";


@Component({
  selector: 'app-single-product',
  templateUrl: './single-product.component.html',
  styleUrls: ['./single-product.component.css']
})
export class SingleProductComponent implements OnInit {

  @Input() product!: Product;
  @Input() filteredProduct?: ProductWithSelectedFilters;

  displayName!: string;
  displaySize!: string;
  displayPrice!: number;
  displayColor!: string;
  displayImages: string[] = [];

  averageRating: number = 0;
  totalReviews: number = 0;

  constructor(
    private store: Store<any>,
    private router: Router,
    private productService: ProductService,
    private reviewService: ReviewService,
    public secService: SecurityService
  ) {}

  ngOnInit() {
    // if (this.filteredProduct) {
    //   const p = this.filteredProduct.product;
    //
    //   this.displayName = this.filteredProduct.product.name
    //
    //   // Use matched size
    //   this.displaySize = this.filteredProduct.matchedSize ?? p.sizeVariants[0]?.size ?? 'N/A';
    //
    //   // Use matched price
    //   this.displayPrice = this.filteredProduct.matchedPrice ?? p.sizeVariants[0]?.productPrice.price ?? 0;
    //
    //   // Use matched color
    //   if (this.filteredProduct.matchedColor) {
    //     this.displayColor = this.filteredProduct.matchedColor;
    //
    //     const sizeVariant = p.sizeVariants.find(sv => sv.size === this.displaySize) || p.sizeVariants[0];
    //     const colorVariant = sizeVariant.colorVariants.find(cv => cv.color === this.displayColor);
    //
    //     this.displayImages = colorVariant?.productImagesBas64 ?? [];
    //   } else {
    //     const firstColorVariant = p.sizeVariants[0]?.colorVariants[0];
    //     this.displayColor = firstColorVariant?.color ?? 'N/A';
    //     this.displayImages = firstColorVariant?.productImagesBas64 ?? [];
    //   }
    //
    // }

    if (this.filteredProduct) {
      const p = this.filteredProduct.product;
      const matchedPrice = this.filteredProduct.matchedPrice;
      const matchedSize = this.filteredProduct.matchedSize;
      const matchedColor = this.filteredProduct.matchedColor;

      this.displayName = p.name;

      let sizeVariantByPrice: SizeVariant | undefined;
      let sizeVariantBySize: SizeVariant | undefined;
      let sizeVariantByColorOnly: SizeVariant | undefined;

      // Find sizeVariant by matched price
      if (matchedPrice !== undefined) {
        sizeVariantByPrice = p.sizeVariants.find(
          sv => sv.productPrice?.price === matchedPrice
        );
      }

      // Find sizeVariant by matched size
      if (matchedSize) {
        sizeVariantBySize = p.sizeVariants.find(
          sv => sv.size === matchedSize
        );
      }

      // Special case: only matchedColor exists
      const onlyColorMatched = matchedColor && !matchedSize && matchedPrice === undefined;
      if (onlyColorMatched) {
        sizeVariantByColorOnly = p.sizeVariants.find(sv =>
          sv.colorVariants.some(cv => cv.color === matchedColor)
        );
      }

      // Determine which sizeVariant to use for size & price
      const finalSizeVariant =
        sizeVariantBySize ??
        sizeVariantByPrice ??
        sizeVariantByColorOnly ??
        p.sizeVariants[0];

      this.displaySize = finalSizeVariant?.size ?? 'N/A';
      this.displayPrice = finalSizeVariant?.productPrice?.price ?? 0;

      // Handle displayColor & images
      if (matchedColor) {
        this.displayColor = matchedColor;
        const colorVariant = finalSizeVariant.colorVariants.find(
          cv => cv.color === matchedColor
        );
        this.displayImages = colorVariant?.productImagesBas64 ?? [];
      } else {
        const firstColorVariant = finalSizeVariant.colorVariants[0];
        this.displayColor = firstColorVariant?.color ?? 'N/A';
        this.displayImages = firstColorVariant?.productImagesBas64 ?? [];
      }

      // fetchReviewStats(): void {
        this.reviewService.getReviewStats(this.filteredProduct.product.productId).subscribe({
          next: (res) => {
            this.averageRating = res.averageRating;
            this.totalReviews = res.totalReviews;
          },
          error: (err) => {
            console.error('Failed to load review stats', err);
          }
        });
      // }


    }


    else {

      this.displayName = this.product.name
      // Fallback: use raw product defaults
      const firstSizeVariant = this.product.sizeVariants[0];
      const firstColorVariant = firstSizeVariant?.colorVariants[0];

      this.displaySize = firstSizeVariant?.size ?? 'N/A';
      this.displayPrice = firstSizeVariant?.productPrice.price ?? 0;
      this.displayColor = firstColorVariant?.color ?? 'N/A';
      this.displayImages = firstColorVariant?.productImagesBas64 ?? [];

      // fetchReviewStats(): void {
      this.reviewService.getReviewStats(this.product.productId).subscribe({
        next: (res) => {
          this.averageRating = res.averageRating;
          this.totalReviews = res.totalReviews;
        },
        error: (err) => {
          console.error('Failed to load review stats', err);
        }
      });
      // }


    }


  }



  onProductItem() {

    const actualProduct: Product = this.filteredProduct ? this.filteredProduct.product : this.product;
    this.productService.getProductById(actualProduct.productId).subscribe(fetchedProduct => {
      this.store.dispatch(new GetProductItemAction(fetchedProduct));
      this.router.navigate(['/product-details'], {
        queryParams: { size: this.displaySize, color: this.displayColor }
      });
    });

    // this.store.dispatch(new GetProductItemAction(this.product)) ;
    // this.router.navigateByUrl("/product-details") ;
  }

  addProductToCart() {
     if( this.secService.profile){
       if(this.secService.profile.id){
         let itemReq : AddItemRequest = {productId: this.product.productId  ,customerId : this.secService.profile.id  }
         this.store.dispatch(new AddProductToCartAction(itemReq))
       }

     }else {
       this.secService.login() ;
     }
  }

  deleteProduct() {
    const actualProduct: Product = this.filteredProduct ? this.filteredProduct.product : this.product;

    const confirmation = confirm(
      `Are you sure you want to delete the product * ${actualProduct.name} * ?`
    );

    if (confirmation) {
      this.productService.deleteProduct(actualProduct.productId).subscribe({
        next: () => {
          this.router.navigateByUrl("/home");
        }
      });
    }
  }


  getStarsArray(rating: number): string[] {
    const fullStars = Math.floor(rating); // absolute part
    const decimal = rating - fullStars;   // fractional part
    const stars: string[] = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push('fas fa-star');
    }

    // Decide based on decimal precision
    if (decimal >= 0.1 && decimal < 0.3) {
      stars.push('fas fa-star-half-alt'); // roughly 1/3 filled
    } else if (decimal >= 0.3 && decimal < 0.7) {
      stars.push('fas fa-star-half-alt'); // standard half
    } else if (decimal >= 0.7 && decimal < 0.9) {
      stars.push('fas fa-star-half-alt'); // roughly 3/4 filled
    } else if (decimal >= 0.9) {
      stars.push('fas fa-star'); // round to full
    }

    // Fill up the rest with empty stars
    while (stars.length < 5) {
      stars.push('far fa-star');
    }

    return stars;
  }

  onEditProduct() {
    if (this.product) {
      this.store.dispatch(new GetProductItemAction(this.product));
      this.router.navigateByUrl('/edit-product');
    }
    else {
      this.store.dispatch(new GetProductItemAction(this.filteredProduct?.product!));
      this.router.navigateByUrl('/edit-product');
    }
  }


}
