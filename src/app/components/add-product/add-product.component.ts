import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {map, Observable, Subscription} from "rxjs";
import {CreatedProduct, Product} from "../../models/product.model";
import {Store} from "@ngrx/store";
import {GetProductItemAction, SaveProductAction} from "../../ngrx/Product-item-State/productItem.actions";
import {CURRENCIES, Currency} from "../../models/common.model";
import {ProductItemState} from "../../ngrx/Product-item-State/productItem.reducers";
import {DataStateEnum} from "../../ngrx/productsState/products.reducer";
import {Router} from "@angular/router";
import {Category} from "../../models/category.model";
import {CategoryService} from "../../services/productService/category.service";

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit{

  addProductFormGroup!: FormGroup;
  categories: Category[] = [];
  currencies: Currency[] = Object.values(CURRENCIES);
  filteredSizes: string[] = [];
  filteredColors: string[] = [];
  submitted:boolean = false ;
  savedProduct! : ProductItemState

  constructor(private fb: FormBuilder, private categoryService: CategoryService,
              private store : Store<any>, private router: Router) {}

  showConfirmModal: boolean = false;
  confirmMessage: string = '';
  confirmCallback: (() => void) | null = null;

  openConfirmModal(message: string, onConfirm: () => void) {
    this.confirmMessage = message;
    this.confirmCallback = onConfirm;
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
    this.confirmCallback = null;
  }

  confirmModalAction() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.closeConfirmModal();
  }


  ngOnInit(): void {

    this.categoryService.loadCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.addProductFormGroup = this.fb.group({
      productName: ['', Validators.required],
      productBrand: ['', Validators.required],
      originLocation: [''],
      productCategory: ['', Validators.required],
      sizeVariants: this.fb.array([])
    });

    this.addProductFormGroup.get('productCategory')?.valueChanges.subscribe(categoryId => {
      const selectedCategory = this.categories.find(c => c.categoryId === categoryId);
      this.filteredSizes = selectedCategory?.categorySizes ?? [];
      this.filteredColors = selectedCategory?.categoryColors ?? [];
      this.clearSizeVariants();
    });

    let confirmationShown = false;
    this.store.subscribe(

      s => {
        if(s.productItemState.dataState == DataStateEnum.LOADED)
          this.savedProduct = s.productItemState
        if(this.savedProduct && this.savedProduct.product  && !confirmationShown){
          console.log(this.savedProduct.product?.productId) ;

          confirmationShown = true;

          const message = `Product named "${this.savedProduct.product.name}" has been created Successfully. Confirm to see product details`;

          this.openConfirmModal(message, () => {
            this.router.navigateByUrl('/product-details');
            this.store.dispatch(new GetProductItemAction(this.savedProduct!.product!));
          });

          this.categoryService.refreshCategories().subscribe({
            next: (updatedCategories) => {
              console.log('Categories refreshed', updatedCategories);
              // Optionally do other stuff here
            },
            error: (err) => {
              console.error('Failed to refresh categories', err);
            }
          });



        }

      }
    )

  }

  get sizeVariants(): FormArray {
    return this.addProductFormGroup.get('sizeVariants') as FormArray;
  }

  clearSizeVariants() {
    while (this.sizeVariants.length !== 0) {
      this.sizeVariants.removeAt(0);
    }
  }

  getSizeVariantsControls(): AbstractControl[] {
    return this.sizeVariants.controls;
  }

  getColorVariants(sizeIndex: number): FormArray {
    return this.sizeVariants.at(sizeIndex).get('colorVariants') as FormArray;
  }

  getColorVariantsControls(sizeIndex: number): AbstractControl[] {
    return this.getColorVariants(sizeIndex).controls;
  }

  getProductImages(sizeIndex: number, colorIndex: number): FormArray {
    return this.getColorVariants(sizeIndex).at(colorIndex).get('productImagesBas64') as FormArray;
  }

  getProductImagesControls(sizeIndex: number, colorIndex: number): AbstractControl[] {
    return this.getProductImages(sizeIndex, colorIndex).controls;
  }

  toggleSizeSelection(size: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;

    if (checked) {
      this.sizeVariants.push(this.createSizeVariantGroup(size));
    } else {
      const index = this.sizeVariants.controls.findIndex(cg => cg.get('size')?.value === size);
      if (index !== -1) this.sizeVariants.removeAt(index);
    }
  }


  isSizeSelected(size: string): boolean {
    return this.sizeVariants.controls.some(cg => cg.get('size')?.value === size);
  }

  createSizeVariantGroup(size: string): FormGroup {
    const defaultCurrency = this.currencies[0];

    const productPriceGroup = this.fb.group({
      price: [null, Validators.required],
      currency: [defaultCurrency.code, Validators.required],
      symbol: [{ value: defaultCurrency.symbol, disabled: true }]
    });

    // 👇 Automatically update symbol when currency changes
    productPriceGroup.get('currency')?.valueChanges.subscribe(code => {
      const match = this.currencies.find(c => c.code === code);
      if (match) {
        productPriceGroup.get('symbol')?.setValue(match.symbol);
      }
    });

    // Now build and return the full form group
    return this.fb.group({
      size: [size],
      productPrice: productPriceGroup,
      description: ['', Validators.required],
      dimension: this.fb.group({
        height: [0, Validators.required],
        width: [0, Validators.required],
        larger: [0, Validators.required],
        weight: [0, Validators.required]
      }),
      colorVariants: this.fb.array([]),
      selectedColors: [[]]
    });
  }




  toggleColorSelection(sizeIndex: number, color: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;

    const sizeGroup = this.sizeVariants.at(sizeIndex);
    const selectedColors: string[] = sizeGroup.get('selectedColors')?.value ?? [];
    const colorVariants = sizeGroup.get('colorVariants') as FormArray;

    if (checked) {
      if (!selectedColors.includes(color)) {
        selectedColors.push(color);
        sizeGroup.get('selectedColors')?.setValue(selectedColors);
        colorVariants.push(this.createColorVariantGroup(color));
      }
    } else {
      const idx = selectedColors.indexOf(color);
      if (idx !== -1) {
        selectedColors.splice(idx, 1);
        sizeGroup.get('selectedColors')?.setValue(selectedColors);
        const colorIndex = colorVariants.controls.findIndex(cg => cg.get('color')?.value === color);
        if (colorIndex !== -1) colorVariants.removeAt(colorIndex);
      }
    }
  }


  isColorSelected(sizeIndex: number, color: string): boolean {
    const selectedColors: string[] = this.sizeVariants.at(sizeIndex).get('selectedColors')?.value ?? [];
    return selectedColors.includes(color);
  }

  createColorVariantGroup(color: string): FormGroup {
    return this.fb.group({
      color: [color, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0)]],
      selected: [false],
      productImagesBas64: this.fb.array(
        // Array(4).fill('').map(() => this.fb.control('', Validators.required))
        Array(4).fill('').map(() => this.fb.control(''))

  )
    });
  }

  onFileSelected(event: any, sizeIndex: number, colorIndex: number, imageIndex: number) {
    const file: File = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const imagesArray = this.getProductImages(sizeIndex, colorIndex);
      imagesArray.at(imageIndex).setValue(base64String);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  onSubmit() {
    if (this.addProductFormGroup.invalid) {
      this.addProductFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.addProductFormGroup.getRawValue();

    const product = {
      productId: this.generateUUID(),
      name: formValue.productName,
      addingDate: new Date().toISOString(),
      brand: formValue.productBrand,
      originLocation: formValue.originLocation || '',
      categoryId: formValue.productCategory,
      status: 'AVAILABLE',
      sizeVariants: formValue.sizeVariants.map((sv: any) => ({
        size: sv.size,
        productPrice: sv.productPrice,
        description: sv.description,
        dimension: sv.dimension,
        colorVariants: sv.colorVariants.map((cv: any) => ({
          color: cv.color,
          quantity: cv.quantity,
          selected: cv.selected,
          productImagesBas64: cv.productImagesBas64
        }))
      }))
    };

    console.log('Submitting product:', product);
    // TODO: send product to backend
    this.store.dispatch(new SaveProductAction(product));

  }

  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }




}
