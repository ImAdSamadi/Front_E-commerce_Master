import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Store} from "@ngrx/store";
import {ProductItemState} from "../../../ngrx/Product-item-State/productItem.reducers";

@Component({
  selector: 'app-product-picked-images',
  templateUrl: './product-picked-images.component.html',
  styleUrls: ['./product-picked-images.component.css']
})

// export class ProductPickedImagesComponent implements OnInit{
  // @Input() productImage1? : string ;
  // @Input() productImage2? : string ;
  // @Input() productImage3? : string ;
  // @Input() productName?: string;
  // productState! : ProductItemState
  // constructor(private store : Store<any>) {
  //   this.store.subscribe(
  //     state =>  {
  //       this.productState = state.productItemState
  //     }
  //   )
  // }
  // ngOnInit(): void {
  // }

export class ProductPickedImagesComponent {


  @Input() imagesBase64: string[] = [];
  @Output() imagesChange = new EventEmitter<string[]>();

  onFileSelected(event: any, index: number) {
    const file: File = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const updatedImages = [...this.imagesBase64];
      updatedImages[index] = base64;
      this.imagesBase64 = updatedImages;
      this.imagesChange.emit(this.imagesBase64);
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // reset input so same file can be re-uploaded if needed
  }

  removeImage(index: number) {
    const updatedImages = [...this.imagesBase64];
    updatedImages.splice(index, 1);
    this.imagesBase64 = updatedImages;
    this.imagesChange.emit(this.imagesBase64);
  }

}
