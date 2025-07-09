export interface Customer {
  customerId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  password?: string;
  profilePictureBase64?: string;
}

