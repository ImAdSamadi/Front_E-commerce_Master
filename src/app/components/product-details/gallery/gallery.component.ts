import {Component, Input, OnChanges} from '@angular/core';
import {Product} from "../../../models/product.model";

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnChanges {
  // @Input() product: Product | null = null;
  // images: string[] = [];
  //
  // ngOnChanges(): void {
  //   if (this.product?.sizeVariants?.length) {
  //     const firstColor = this.product.sizeVariants[0].colorVariants[0];
  //     this.images = firstColor.productImagesBas64;
  //   }
  // }


  @Input() product: Product | null = null;
  @Input() selectedSize: string | null = null;
  @Input() selectedColor: string | null = null;
  images: string[] = [];

  ngOnChanges(): void {
    if (this.product && this.selectedSize && this.selectedColor) {
      const sizeVariant = this.product.sizeVariants.find(s => s.size === this.selectedSize);
      const colorVariant = sizeVariant?.colorVariants.find(c => c.color === this.selectedColor);

      this.images = colorVariant?.productImagesBas64 || [];
    }
  }
}
