import {Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';
import {Product, Review, ReviewsPage, SizeVariant} from "../../../models/product.model";
import {ProductService} from "../../../services/productService/product.service";
import {ReviewService} from "../../../services/productService/review.service";
import {SecurityService} from "../../../security/security.service";
import {NgForm} from "@angular/forms";

declare var $: any;

@Component({
  selector: 'app-product-item-addetional-info',
  templateUrl: './product-item-addetional-info.component.html',
  styleUrls: ['./product-item-addetional-info.component.css']
})
export class ProductItemAddetionalInfoComponent implements OnChanges {

  @Input() product: Product | null = null;
  selectedSizeVariant: SizeVariant | null = null;
  descriptionParagraphs: string[] = [];

  public reviews: Review[] = [];
  public totalPages = 0;
  public totalElements = 0;
  public currentPage = 0;
  public pageSize = 5;

  public newReview: Partial<Review> = { rating: 0 };

  public isAuthenticated = false;
  public authenticatedUser: { fullName: string; email: string } | null = null;

  public showModal = false;
  public alertType: 0 | 1 | 2 = 0; // 0 = success, 1 = warning, 2 = error
  public alertMessage = '';

  constructor(
    public productService: ProductService,
    public reviewService: ReviewService,
    public securityService: SecurityService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = !!this.securityService.profile;

    if (this.isAuthenticated) {
      this.authenticatedUser = {
        fullName: `${this.securityService.profile.firstName} ${this.securityService.profile.lastName}`,
        email: this.securityService.profile.email ?? 'unknown@email.com'
      };

      this.newReview.customerName = this.authenticatedUser.fullName;
      this.newReview.customerEmail = this.authenticatedUser.email;
      this.newReview.customerProfileImageBase64 = 'User_Image';
    }

    this.loadReviews();
  }

  ngOnChanges(): void {
    if (this.product?.sizeVariants?.length) {
      this.selectedSizeVariant = this.product.sizeVariants[0];
    }

    this.descriptionParagraphs = this.selectedSizeVariant?.description
      ?.split(/\r?\n\r?\n/)
      .filter(p => p.trim().length > 0) || [];

    this.loadReviews();
  }

  private loadReviews(): void {
    if (!this.product) return;

    this.reviewService.getReviewsByProductId(this.product.productId, this.currentPage, this.pageSize).subscribe({
      next: (response: ReviewsPage) => {
        this.reviews = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
      },
      error: err => {
        console.error('Error loading reviews', err);
      }
    });
  }

  setRating(star: number): void {
    this.newReview.rating = star;
  }

  previewImages: string[] = [];
  selectedImages: File[] = [];

  @ViewChild('imageInput') imageInputRef!: ElementRef<HTMLInputElement>;

  triggerImageUpload(): void {
    this.imageInputRef.nativeElement.click();
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    for (const file of Array.from(input.files)) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.previewImages.push(result);
      };
      reader.readAsDataURL(file);
    }

    // Optional: Clear the file input value after selection to allow re-selection of same file
    input.value = '';
  }

  removeImage(index: number): void {
    this.previewImages.splice(index, 1);
  }

  currentReviewImages: string[] = [];
  selectedImageIndex: number = 0;

  currentReviewerName: string = '';
  currentReviewText: string = '';


  openReviewImagesModal(
    images: string[],
    clickedIndex: number,
    reviewerName: string,
    reviewText: string
  ): void {
    this.currentReviewImages = images;
    this.selectedImageIndex = clickedIndex;
    this.currentReviewerName = reviewerName;
    this.currentReviewText = reviewText;

    setTimeout(() => {
      // Clear previous active
      const allItems = document.querySelectorAll('#review-carousel .carousel-item');
      allItems.forEach(el => el.classList.remove('active'));

      // Set active image
      const targetItem = allItems[clickedIndex] as HTMLElement;
      if (targetItem) {
        targetItem.classList.add('active');
      }

      // Show modal
      ($('#reviewImagesModal') as any).modal('show');
    }, 100);
  }






  submitReview(form: NgForm): void {
    if (!this.product || !this.newReview.reviewText) return;
    if (!this.isAuthenticated && (!this.newReview.customerName || !this.newReview.customerEmail)) return;

    const formattedDate = this.formatDateToDdMmmYyyy(new Date());

    const review: Review = {
      reviewId: '',
      productId: this.product.productId,
      customerName: this.newReview.customerName!,
      customerEmail: this.newReview.customerEmail!,
      reviewText: this.newReview.reviewText!,
      rating: this.newReview.rating ?? 0,
      reviewDate: formattedDate,
      customerProfileImageBase64: this.newReview.customerProfileImageBase64 ?? 'No_Image'
    };

    // Optional: Upload images as base64 and attach to review (example logic)
    if (this.previewImages.length > 0) {
      review.reviewImagesBase64 = this.previewImages;
    }

    this.reviewService.addReview(review).subscribe({
      next: () => {
        // this.showAlert(0, 'Review Added Successfully !');
        this.showToast(0, 'Your review has been posted successfully. Thank you!');
        this.newReview = { rating: 0 };
        this.currentPage = 0;
        this.loadReviews();
        this.previewImages = [];
        this.selectedImages = [];

        form.resetForm({ rating: 0 });
      },
      error: err => {
        console.error('Error Submitting Review:', err);
        // this.showAlert(2, 'Failed To Submit Review.');
        this.showToast(2, 'An unexpected error occurred. Please try again later.');
      }
    });
  }


  formatDateToDdMmmYyyy(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthShortNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }


  changePage(page: number, event: Event): void {
    event.preventDefault();
    if (page < 0 || page >= this.totalPages || page === this.currentPage) return;

    this.currentPage = page;
    this.loadReviews();
  }

  // Control modals
  showConfirmModal: boolean = false;
  reviewIdToDelete: string | null = null;

  openDeleteModal(reviewId: string) {
    this.reviewIdToDelete = reviewId;
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.reviewIdToDelete = null;
    this.showConfirmModal = false;
  }

  deleteConfirmedReview() {
    if (!this.reviewIdToDelete) return;

    this.reviewService.deleteReview(this.reviewIdToDelete).subscribe({
      next: () => {
        this.alertMessage = 'Review Deleted Successfully!';
        this.alertType = 0; // success
        this.showModal = true;
        this.showConfirmModal = false;
        this.loadReviews(); // or refresh the current page
        setTimeout(() => {
          this.showModal = false;
        }, 1000); // ✅ Safe to ignore the return type if not used

      },

      error: (err) => {
        this.alertMessage = 'Failed to delete review.';
        this.alertType = 2; // error
        this.showModal = true;
        this.showConfirmModal = false;
      }
    });
  }



  // showAlert(type: 0 | 1 | 2, message: string): void {
  //   this.alertType = type;
  //   this.alertMessage = message;
  //   this.showModal = true;
  //
  //   // Optional: manually add a backdrop
  //   const backdrop = document.createElement('div');
  //   backdrop.className = 'modal-backdrop fade show';
  //   backdrop.id = 'custom-backdrop';
  //   document.body.appendChild(backdrop);
  // }

  closeModal(): void {
    this.showModal = false;

    // Remove manually added backdrop
    const backdrop = document.getElementById('custom-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  ngAfterViewInit(): void {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    fileInput?.addEventListener('change', () => {
      const label = document.querySelector('label.custom-file-label');
      if (label && fileInput.files && fileInput.files.length > 0) {
        label.textContent = Array.from(fileInput.files).map(f => f.name).join(', ');
      } else {
        label!.textContent = 'Choose images';
      }
    });

    // Reset carousel when modal is closed
    ($('#reviewImagesModal') as any).on('hidden.bs.modal', () => {
      const allItems = document.querySelectorAll('#review-carousel .carousel-item');
      allItems.forEach(el => el.classList.remove('active'));
    });
  }

  localToast = {
    visible: false,
    message: '',
    type: 0 // 0 = success, 1 = warning, 2 = error
  };

  showToast(type: number, message: string): void {
    this.localToast = {
      visible: true,
      message,
      type
    };

    setTimeout(() => {
      this.localToast.visible = false;
    }, 4000); // auto-dismiss in 4s
  }



}
