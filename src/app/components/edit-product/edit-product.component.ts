import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CURRENCIES, Currency} from "../../models/common.model";
import {Store} from "@ngrx/store";
import {DataStateEnum, ProductState} from "../../ngrx/productsState/products.reducer";
import {map, Observable} from "rxjs";
import {ProductItemState} from "../../ngrx/Product-item-State/productItem.reducers";
import {EditProductAction, GetProductItemAction} from "../../ngrx/Product-item-State/productItem.actions";
import {Router} from "@angular/router";
import {CreatedProduct} from "../../models/product.model";
import {CategoryService} from "../../services/productService/category.service";
import {Category} from "../../models/category.model";

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})

export class EditProductComponent implements OnInit {
  editProductFormGroup!: FormGroup;
  productState!: ProductItemState;
  editedProduct!: ProductItemState;
  dataState = DataStateEnum;

  categories: Category[] = [];
  currencies: Currency[] = Object.values(CURRENCIES);
  filteredSizes: string[] = [];
  filteredColors: string[] = [];

  submitted = false;

  // For Angular modal (instead of confirm)
  confirmationShown = false;
  showModal = false;
  confirmMessage: string = 'Product updated Successfully! Do you want to continue?';


  constructor(
    private fb: FormBuilder,
    private store: Store<any>,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.loadCategories().subscribe(cats => {
      this.categories = cats;
    });

    this.store.subscribe(state => {
      const productState = state.productItemState;
      this.productState = productState;

      if (productState.dataState === DataStateEnum.LOADED && productState.product) {
        this.initForm(productState.product);
      }

      if (productState.dataState === DataStateEnum.EDITED && productState.product && !this.confirmationShown) {
        this.editedProduct = productState;
        this.confirmationShown = true;
        this.showModal = true;  // Show Angular modal instead of native confirm()
      }

      this.categoryService.refreshCategories().subscribe({
        next: (updatedCategories) => {
          console.log('Categories refreshed', updatedCategories);
          // Optionally do other stuff here
        },
        error: (err) => {
          console.error('Failed to refresh categories', err);
        }
      });

    });
  }

  // Initialize form with product data
  initForm(product: any) {
    this.filteredSizes = [];
    this.filteredColors = [];

    const selectedCategory = this.categories.find(c => c.categoryId === product.categoryId);
    if (selectedCategory) {
      this.filteredSizes = selectedCategory.categorySizes ?? [];
      this.filteredColors = selectedCategory.categoryColors ?? [];
    }

    this.editProductFormGroup = this.fb.group({
      productName: [product.name, Validators.required],
      productBrand: [product.brand, Validators.required],
      originLocation: [product.originLocation || ''],
      productCategory: [product.categoryId, Validators.required],
      sizeVariants: this.fb.array([])
    });

    product.sizeVariants?.forEach((sv: any) => {
      const sizeGroup = this.createSizeVariantGroup(sv);
      this.sizeVariants.push(sizeGroup);
    });

    this.editProductFormGroup.get('productCategory')?.valueChanges.subscribe(categoryId => {
      const selectedCat = this.categories.find(c => c.categoryId === categoryId);
      this.filteredSizes = selectedCat?.categorySizes ?? [];
      this.filteredColors = selectedCat?.categoryColors ?? [];
      this.clearSizeVariants();
    });
  }

  get sizeVariants(): FormArray {
    return this.editProductFormGroup.get('sizeVariants') as FormArray;
  }

  clearSizeVariants() {
    while (this.sizeVariants.length !== 0) {
      this.sizeVariants.removeAt(0);
    }
  }

  createSizeVariantGroup(sizeVariantData: any): FormGroup {
    const defaultCurrency =
      this.currencies.find(c => c.code === sizeVariantData.productPrice.currency) || this.currencies[0];

    const productPriceGroup = this.fb.group({
      price: [sizeVariantData.productPrice.price, Validators.required],
      currency: [sizeVariantData.productPrice.currency, Validators.required],
      symbol: [{ value: defaultCurrency.symbol, disabled: true }]
    });

    productPriceGroup.get('currency')?.valueChanges.subscribe(code => {
      const match = this.currencies.find(c => c.code === code);
      if (match) {
        productPriceGroup.get('symbol')?.setValue(match.symbol);
      }
    });

    const colorVariantsFA = this.fb.array<FormGroup>([]);
    sizeVariantData.colorVariants?.forEach((cv: any) => {
      colorVariantsFA.push(this.createColorVariantGroup(cv));
    });

    return this.fb.group({
      size: [sizeVariantData.size],
      productPrice: productPriceGroup,
      description: [sizeVariantData.description, Validators.required],
      dimension: this.fb.group({
        height: [sizeVariantData.dimension.height, Validators.required],
        width: [sizeVariantData.dimension.width, Validators.required],
        larger: [sizeVariantData.dimension.larger, Validators.required],
        weight: [sizeVariantData.dimension.weight, Validators.required]
      }),
      colorVariants: colorVariantsFA,
      selectedColors: [sizeVariantData.colorVariants?.map((cv: any) => cv.color) ?? []]
    });
  }

  createColorVariantGroup(colorVariantData: any): FormGroup {
    // Always 4 file input controls for product images, existing images fill first slots
    const totalFileInputs = 4;
    const existingImages = colorVariantData.productImagesBas64 ?? [];
    const imagesControls = [];

    for (let i = 0; i < totalFileInputs; i++) {
      imagesControls.push(this.fb.control(existingImages[i] ?? ''));
    }

    return this.fb.group({
      color: [colorVariantData.color, Validators.required],
      quantity: [colorVariantData.quantity, [Validators.required, Validators.min(0)]],
      selected: [colorVariantData.selected],
      productImagesBas64: this.fb.array(imagesControls)
    });
  }

  // Helper to get productImagesBas64 FormArray for given size/color indexes
  getProductImagesArray(sizeIndex: number, colorIndex: number): FormArray {
    return (this.sizeVariants.at(sizeIndex).get('colorVariants') as FormArray)
      .at(colorIndex)
      .get('productImagesBas64') as FormArray;
  }

  // ========== Helper methods for template interaction ==========

  isSizeSelected(size: string): boolean {
    return this.sizeVariants.controls.some(ctrl => ctrl.get('size')?.value === size);
  }

  toggleSizeSelection(size: string) {
    const index = this.sizeVariants.controls.findIndex(ctrl => ctrl.get('size')?.value === size);
    if (index >= 0) {
      this.sizeVariants.removeAt(index);
    } else {
      // Create new size variant group with defaults
      this.sizeVariants.push(
        this.createSizeVariantGroup({
          size,
          productPrice: { price: 0, currency: this.currencies[0].code },
          description: '',
          dimension: { height: 0, width: 0, larger: 0, weight: 0 },
          colorVariants: []
        })
      );
    }
  }

  getSizeVariantsControls() {
    return this.sizeVariants.controls;
  }

  isColorSelected(sizeIndex: number, color: string): boolean {
    const colorVariants = (this.sizeVariants.at(sizeIndex).get('colorVariants') as FormArray).controls;
    return colorVariants.some(cv => cv.get('color')?.value === color);
  }

  toggleColorSelection(sizeIndex: number, color: string) {
    const colorVariants = this.sizeVariants.at(sizeIndex).get('colorVariants') as FormArray;
    const index = colorVariants.controls.findIndex(cv => cv.get('color')?.value === color);
    if (index >= 0) {
      colorVariants.removeAt(index);
    } else {
      colorVariants.push(
        this.createColorVariantGroup({
          color,
          quantity: 0,
          selected: false,
          productImagesBas64: []
        })
      );
    }
  }

  getColorVariantsControls(sizeIndex: number) {
    return (this.sizeVariants.at(sizeIndex).get('colorVariants') as FormArray).controls;
  }

  getProductImagesControls(sizeIndex: number, colorIndex: number) {
    return this.getProductImagesArray(sizeIndex, colorIndex).controls;
  }

  onFileSelected(event: any, sizeIndex: number, colorIndex: number, imgIndex: number) {
    const files = event.target.files;
    const imagesFA = this.getProductImagesArray(sizeIndex, colorIndex);

    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Update the specific image control at imgIndex with the new base64 string
        if (imagesFA.at(imgIndex)) {
          imagesFA.at(imgIndex).setValue(e.target.result);
        } else {
          // If imgIndex doesn't exist, add a new control (unlikely if template matches form)
          imagesFA.push(this.fb.control(e.target.result));
        }
      };
      reader.readAsDataURL(files[0]);
    }
  }

  // ========== Submit form ==========

  onSubmit() {
    this.submitted = true;

    if (this.editProductFormGroup.invalid) {
      this.editProductFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.editProductFormGroup.getRawValue();

    const updatedProduct: CreatedProduct = {
      productId: this.productState.product?.productId || '',
      name: formValue.productName,
      addingDate: this.productState.product?.addingDate || new Date().toISOString(),
      brand: formValue.productBrand,
      originLocation: formValue.originLocation || '',
      categoryId: formValue.productCategory,
      status: this.productState.product?.status || 'AVAILABLE',
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
      })),
      pickedColor: formValue.pickedColor,
      pickedSize: formValue.pickedSize
    };

    console.log('Submitting updated product:', updatedProduct);
    this.store.dispatch(new EditProductAction(updatedProduct));
  }

  // ========== Modal Confirm Handlers ==========

  onConfirmModalAccept() {
    this.showModal = false;
    this.router.navigateByUrl('/product-details');
    this.store.dispatch(new GetProductItemAction(this.editedProduct.product!));
  }

  onConfirmModalCancel() {
    this.showModal = false;
    // Optionally do something on cancel, or nothing
  }


}
