import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Orders, Shipment} from "../../models/order.model";
import {OrderService} from "../../services/ordersService/order.service";
import {SecurityService} from "../../security/security.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {CartProduct} from "../../models/ShoppingCart";
import {GetProductItemAction} from "../../ngrx/Product-item-State/productItem.actions";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {ProductService} from "../../services/productService/product.service";
import {FilterRequestPayload, PageSize} from "../../models/common.model";
import {GetProductsPageAction} from "../../ngrx/productsState/product.actions";

// type OrderWithUIState = Orders & { expanded: boolean, footerExpanded: boolean };
type OrderWithUIState = Orders & {
  expanded: boolean;
  footerExpanded: boolean;
  shipment?: Shipment;  // add shipment here
};

declare var $: any;

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: OrderWithUIState[] = [];
  loading = true;
  customerId: string = this.securityService.profile.id!;

  mapUrls: { [orderId: string]: SafeResourceUrl } = {};

  page = 0;
  pageSize = 5;
  sortBy = 'createdAt';
  sortDir = 'desc';
  hasMore = true;
  isLoadingMore = false;

  statusFilter: string | null = null;

  selectedStatusFilter: string | null = null;
  selectedSortOption: string = 'latest'; // default sorting option

  @ViewChild('productImagesModal') productImagesModal!: ElementRef;

  selectedProduct: any = null;




  constructor(
    private ordersService: OrderService, private productService: ProductService,
    private securityService: SecurityService, private store : Store<any>,
    private sanitizer: DomSanitizer, private router: Router ,
  ) {}

  ngOnInit(): void {
    this.fetchOrders(true);

    this.orders.forEach(order => {
      this.mapUrls[order.orderId] = this.getGoogleMapUrl(this.getCleanAddress(order.shippingAddress));
    });

  }


  fetchOrders(reset: boolean = false): void {
    if (reset) {
      this.page = 0;
      this.orders = [];
      this.hasMore = true;
    }
    this.loading = true;
    this.ordersService
      .getOrdersForCustomer(this.customerId, this.page, this.pageSize, this.sortBy, this.sortDir, this.statusFilter ?? undefined)
      .subscribe({
        next: (data) => {
          const newOrders: OrderWithUIState[] = data.content.map(order => ({
            ...order,
            expanded: false,
            footerExpanded: false
          }));

          // For each order, fetch shipment data and attach it
          newOrders.forEach(order => {
            this.ordersService.getShipmentByOrderId(order.orderId).subscribe({
              next: shipment => {
                order.shipment = shipment;
              },
              error: () => {
                order.shipment = undefined; // or null if no shipment found
              }
            });
          });

          this.orders = [...this.orders, ...newOrders];
          this.hasMore = this.page < data.totalPages - 1;
          this.page++;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }


  onStatusFilterChange(status: string | null) {
    this.selectedStatusFilter = status;
    this.statusFilter = status; // keep your existing filtering param updated
    this.fetchOrders(true);
  }

  onSortChange(sort: string) {
    this.selectedSortOption = sort;

    switch(sort) {
      case 'latest':
        this.sortBy = 'createdAt';
        this.sortDir = 'desc';
        break;
      case 'highest':
        this.sortBy = 'totalPrice';
        this.sortDir = 'desc';
        break;
      case 'lowest':
        this.sortBy = 'totalPrice';
        this.sortDir = 'asc';
        break;
    }

    this.fetchOrders(true);
  }

  getNameFromAddress(full: string): string {
    return full.split(" - ")[0]?.trim() || '';
  }

  getCleanAddress(full: string): string {
    const parts = full.split(" - ");
    // Address is the parts between name (index 0) and phone (the one containing 'Phone:')
    // So find the index of 'Phone:' part and get parts from 1 to that index - 1, join with " - "
    const phoneIndex = parts.findIndex(p => p.includes('Phone:'));
    if (phoneIndex > 1) {
      return parts.slice(1, phoneIndex).join(' - ').trim();
    }
    // fallback
    return full;
  }

  getPhoneFromAddress(full: string): string {
    // Find the part that contains "Phone:"
    const phonePart = full.split(" - ").find(part => part.includes('Phone:'));
    if (!phonePart) return '';
    return phonePart.replace('Phone:', '').trim();
  }

  getEmailFromAddress(full: string): string {
    // Find the part that contains "E-mail:"
    const emailPart = full.split(" - ").find(part => part.includes('E-mail:'));
    if (!emailPart) return '';
    return emailPart.replace('E-mail:', '').trim();
  }


  getGoogleMapUrl(address: string): SafeResourceUrl {
    const encoded = encodeURIComponent(address);
    const url = `https://www.google.com/maps?q=${encoded}&output=embed&t=k`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getMapUrlForOrder(order: any): SafeResourceUrl {
    if (!this.mapUrls[order.orderId]) {
      this.mapUrls[order.orderId] = this.getGoogleMapUrl(this.getCleanAddress(order.shippingAddress));
    }
    return this.mapUrls[order.orderId];
  }


  getSortLabel(sortKey: string): string {
    switch (sortKey) {
      case 'latest':
        return 'Latest';
      case 'highest':
        return 'Most Expensive';
      case 'lowest':
        return 'Least Expensive';
      default:
        return 'Sort';
    }
  }


  openModal(product: any) {
    this.selectedProduct = product;

    // Show modal
    $(this.productImagesModal.nativeElement).modal('show');

    // Initialize carousel after modal shown
    setTimeout(() => {
      $('#product-carousel').carousel(0);
    }, 0);
  }

  closeModal() {
    $(this.productImagesModal.nativeElement).modal('hide');
  }


  goToProduct(productId: string, size?: string, color?: string) {
    this.productService.getProductById(productId).subscribe(fetchedProduct => {
      this.store.dispatch(new GetProductItemAction(fetchedProduct));
      this.router.navigate(['/product-details'], {
        queryParams: { size, color }
      });
    });
  }


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
