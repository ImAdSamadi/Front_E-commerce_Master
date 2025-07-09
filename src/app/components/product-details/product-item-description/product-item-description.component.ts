import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { Product, SizeVariant, ColorVariant } from '../../../models/product.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddProductToCartAction } from '../../../ngrx/ShoppingCartState/cart.actions';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { GetProductItemAction } from '../../../ngrx/Product-item-State/productItem.actions';
import { SecurityService } from '../../../security/security.service';
import {ReviewService} from "../../../services/productService/review.service";

@Component({
  selector: 'app-product-item-description',
  templateUrl: './product-item-description.component.html',
  styleUrls: ['./product-item-description.component.css']
})
export class ProductItemDescriptionComponent implements OnInit {


  @Input() product: Product | null = null;
  @Output() variantChange = new EventEmitter<{ size: string, color: string }>();
  @Input() selectedSize: string | null = null;
  @Input() selectedColor: string | null = null;

  addProductForm!: FormGroup;
  selectedSizeVariant: SizeVariant | null = null;
  selectedColorVariant: ColorVariant | null = null;

  firstLine: string = '';
  averageRating: number = 0;
  totalReviews: number = 0;

  constructor(
    private fb: FormBuilder,
    private store: Store<any>,
    private router: Router,
    private reviewService: ReviewService,
    public secService: SecurityService
  ) {}

  ngOnInit(): void {
    this.addProductForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      size: ['', Validators.required],
      color: ['', Validators.required]
    });

    if (this.product && this.product.sizeVariants.length > 0) {

      this.reviewService.getReviewStats(this.product.productId).subscribe({
        next: (res) => {
          this.averageRating = res.averageRating;
          this.totalReviews = res.totalReviews;
        },
        error: (err) => {
          console.error('Failed to load review stats', err);
        }
      });

      // Case 1: Size + color explicitly provided
      if (this.selectedSize && this.selectedColor) {
        const matchedSize = this.product.sizeVariants.find(sv => sv.size === this.selectedSize);
        const matchedColor = matchedSize?.colorVariants.find(cv => cv.color === this.selectedColor);

        if (matchedSize && matchedColor) {
          this.selectedSizeVariant = matchedSize;
          this.selectedColorVariant = matchedColor;

          this.addProductForm.patchValue({
            size: this.selectedSize,
            color: this.selectedColor
          });
          this.firstLine = this.selectedSizeVariant.description.split(/\r?\n/)[0];
          this.emitVariantChange();
          return; // ✅ early exit — combo is set
        }
      }

      // Case 2: Default fallback
      const firstSize = this.product.sizeVariants[0];
      this.onSizeChange(firstSize.size);
      this.addProductForm.patchValue({ size: firstSize.size });
    }



  }

  onSizeChange(size: string) {
    if (!this.product) return;

    this.selectedSizeVariant = this.product.sizeVariants.find(s => s.size === size) || null;

    // Patch size in form explicitly to make sure control is updated
    this.addProductForm.patchValue({ size });

    if (this.selectedSizeVariant && this.selectedSizeVariant.colorVariants.length > 0) {
      const firstColor = this.selectedSizeVariant.colorVariants[0];
      this.onColorChange(firstColor.color); // patch color too
      this.addProductForm.patchValue({ color: firstColor.color });
      this.firstLine = this.selectedSizeVariant.description.split(/\r?\n/)[0];
    }

    this.emitVariantChange();
  }


  onColorChange(color: string) {
    if (!this.selectedSizeVariant) return;
    this.selectedColorVariant = this.selectedSizeVariant.colorVariants.find(c => c.color === color) || null;

    this.emitVariantChange();
  }

  emitVariantChange() {
    if (this.selectedSizeVariant && this.selectedColorVariant) {
      this.variantChange.emit({
        size: this.selectedSizeVariant.size,
        color: this.selectedColorVariant.color
      });
    }
  }

  onAddProductToCart() {
    if (this.addProductForm.invalid || !this.product) return;

    const { quantity, size, color } = this.addProductForm.value;

    console.log('Add to cart - quantity:', quantity, 'size:', size, 'color:', color);

    if (this.secService.profile?.id) {
      this.store.dispatch(new AddProductToCartAction({
        productId: this.product.productId,
        quantity,
        customerId: this.secService.profile.id,
        pickedSize: size,
        pickedColor: color

      }));

      this.addProductForm.patchValue({ quantity: 1 });
    } else {
      this.secService.login();
    }
  }

  onEditProduct() {
    if (this.product) {
      this.store.dispatch(new GetProductItemAction(this.product));
      this.router.navigateByUrl('/edit-product');
    }
  }

  decrementQuantity() {
    const currentQty = this.addProductForm.get('quantity')?.value || 1;
    if (currentQty > 1) {
      this.addProductForm.get('quantity')?.setValue(currentQty - 1);
    }
  }

  incrementQuantity() {
    const currentQty = this.addProductForm.get('quantity')?.value || 1;
    const maxQty = this.selectedColorVariant?.quantity || 1;
    if (currentQty < maxQty) {
      this.addProductForm.get('quantity')?.setValue(currentQty + 1);
    }
  }

  onQuantityInput() {
    let currentQty = this.addProductForm.get('quantity')?.value;

    // Ensure it is at least 1
    if (!currentQty || currentQty < 1) {
      currentQty = 1;
    }

    // Ensure it does not exceed stock
    const maxQty = this.selectedColorVariant?.quantity || 1;
    if (currentQty > maxQty) {
      currentQty = maxQty;
    }

    // Update form control to corrected value
    this.addProductForm.get('quantity')?.setValue(currentQty, { emitEvent: false });
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



}
