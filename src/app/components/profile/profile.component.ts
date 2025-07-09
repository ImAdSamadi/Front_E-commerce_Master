import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Customer} from "../../models/Customer.model";
import {DomSanitizer} from "@angular/platform-browser";
import {ShoppingCartService} from "../../services/shoppingCartService/shopping-cart.service";
import {SecurityService} from "../../security/security.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})


export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;

  customer!: Customer;
  previewUrl: string | null = null;
  defaultAvatar = 'assets/default-avatar.png';

  isEditing = false;
  loading = false;
  saveSuccess = false;
  saveError = false;

  // Phone country codes (Add as needed)
  countryCodes = [
    { code: '+1', display: 'USA +1' },
    { code: '+44', display: 'UK +44' },
    { code: '+33', display: 'France +33' },
    { code: '+49', display: 'Germany +49' },
    { code: '+39', display: 'Italy +39' },
    { code: '+34', display: 'Spain +34' },
    { code: '+212', display: 'Morocco +212' },
    { code: '+91', display: 'India +91' },
    { code: '+81', display: 'Japan +81' },
    { code: '+86', display: 'China +86' },
    { code: '+7', display: 'Russia +7' },
    { code: '+61', display: 'Australia +61' },
    { code: '+27', display: 'South Africa +27' },
    { code: '+55', display: 'Brazil +55' },
    { code: '+64', display: 'New Zealand +64' },
    { code: '+82', display: 'South Korea +82' },
    { code: '+47', display: 'Norway +47' },
    { code: '+46', display: 'Sweden +46' },
    { code: '+41', display: 'Switzerland +41' },
    { code: '+31', display: 'Netherlands +31' },
  ];



  constructor(
    private fb: FormBuilder, private router : Router,
    private customerService: ShoppingCartService,
    public secService: SecurityService
  ) {}

  ngOnInit(): void {
    this.loadCustomer();

    this.profileForm = this.fb.group({
      customerId: [''],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneCountryCode: ['+212', Validators.maxLength(9)],
      phoneNumber: ['', Validators.required],
      shippingAddress: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
      profilePictureBase64: [''],
    });
  }

  loadCustomer() {
    const customerId = this.secService.profile.id; // get from Keycloak token/session
    this.customerService.getCustomerById(customerId!).subscribe({
      next: (cust) => {
        this.customer = cust;
        this.populateForm();
      },
      error: () => {
        // handle error
      },
    });
  }

  populateForm() {
    if (!this.customer) return;

    let phoneCountryCode = ''; // default fallback
    let phoneNumber = '';

    if (this.customer.phoneNumber) {
      // Sort country codes by descending length to match longest first
      const sortedCodes = this.countryCodes
        .map(c => c.code)
        .sort((a, b) => b.length - a.length);

      // Find longest matching prefix
      for (const code of sortedCodes) {
        if (this.customer.phoneNumber.startsWith(code)) {
          phoneCountryCode = code;
          phoneNumber = this.customer.phoneNumber.slice(code.length).trim();
          break;
        }
      }

      // If no country code matched, put full number in phoneNumber
      if (!phoneNumber) {
        phoneNumber = this.customer.phoneNumber;
        phoneCountryCode = '+1'; // fallback
      }
    }

    this.profileForm.patchValue({
      customerId: this.customer.customerId,
      email: this.customer.email,
      firstName: this.customer.firstName,
      lastName: this.customer.lastName,
      phoneCountryCode,
      phoneNumber,
      shippingAddress: this.customer.shippingAddress,
      city: this.customer.city,
      state: this.customer.state,
      zipCode: this.customer.zipCode,
      profilePictureBase64: this.customer.profilePictureBase64,
    });

    this.previewUrl = this.customer.profilePictureBase64 || null;
  }

  isInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  editField(field: string) {
    this.isEditing = true;

    // Enable form controls except email
    Object.keys(this.profileForm.controls).forEach((key) => {
      if (key !== 'email') {
        this.profileForm.get(key)?.enable();
      }
    });

    // Disable email explicitly (read-only)
    this.profileForm.get('email')?.disable();
  }

  onFileSelected(event: any) {
    if (!this.isEditing) return;

    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.profileForm.patchValue({ profilePictureBase64: this.previewUrl });
      };
      reader.readAsDataURL(file);
    }
  }


  isConfirmPasswordInvalid(): boolean {
    if (!this.isEditing) return false; // only validate while editing
    const password = this.profileForm.get('password')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;
    return confirmPassword && password !== confirmPassword;
  }




  onSave() {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.saveSuccess = false;
    this.saveError = false;

    // Combine phone
    const phoneCountryCode = this.profileForm.get('phoneCountryCode')?.value || '';
    const phoneNumber = this.profileForm.get('phoneNumber')?.value || '';
    const combinedPhone = `${phoneCountryCode}${phoneNumber}`;

    const updatedCustomer: Customer = {
      ...this.customer,
      ...this.profileForm.getRawValue(),
      phoneNumber: combinedPhone,
    };

    // Remove password if empty (do not update)
    if (!updatedCustomer.password) {
      delete updatedCustomer.password;
    }

    // Call update API
    this.customerService.updateCustomer(updatedCustomer).subscribe({
      next: () => {
        this.loading = false;
        this.saveSuccess = true;
        this.isEditing = false;
        this.loadCustomer(); // reload fresh data
      },
      error: () => {
        this.loading = false;
        this.saveError = true;
      },
    });

    this.profileForm.get('confirmPassword')?.reset();

  }

  onCancel() {
    this.isEditing = false;
    this.saveError = false;
    this.saveSuccess = false;
    this.populateForm();
    this.profileForm.get('password')?.reset();
    this.profileForm.get('confirmPassword')?.reset();
  }


  onLogout() {
    this.secService.logout();
  }

  onHome() {
    this.router.navigateByUrl("home")
  }

}
