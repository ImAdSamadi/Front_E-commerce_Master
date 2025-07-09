import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, AbstractControl, Validators} from "@angular/forms";
import {matchPasswords} from "./validators/match-passwords.validator";
import {Router} from "@angular/router";
import {ShoppingCartService} from "../../services/shoppingCartService/shopping-cart.service";
import {Customer} from "../../models/Customer.model";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-user-signup',
  templateUrl: './user-signup.component.html',
  styleUrls: ['./user-signup.component.css',]
})
export class UserSignupComponent implements OnInit {

  userSignupForm!: FormGroup;
  alertMessage: string = '';
  alertType: number = 0; // 0-success,1-warning,2-error

  constructor(private fb: FormBuilder, private userService: ShoppingCartService, private router: Router) { }

  showModal: boolean = false;

  ngOnInit(): void {
    this.userSignupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      shippingAddress: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      phoneNumber: [''],
    }, {
      validator: matchPasswords
    });
  }

  get firstName(): AbstractControl | null { return this.userSignupForm.get('firstName'); }
  get lastName(): AbstractControl | null { return this.userSignupForm.get('lastName'); }
  get email(): AbstractControl | null { return this.userSignupForm.get('email'); }
  get password(): AbstractControl | null { return this.userSignupForm.get('password'); }
  get confirmPassword(): AbstractControl | null { return this.userSignupForm.get('confirmPassword'); }

  onSubmit(): void {
    if (this.userSignupForm.invalid) {
      return;
    }

    const customer: Customer = {
      firstName: this.firstName?.value,
      lastName: this.lastName?.value,
      shippingAddress: this.userSignupForm.get('shippingAddress')?.value,
      city: this.userSignupForm.get('city')?.value,
      state: this.userSignupForm.get('state')?.value,
      zipCode: this.userSignupForm.get('zipCode')?.value,
      email: this.email?.value,
      password: this.password?.value,
      phoneNumber: this.userSignupForm.get('phoneNumber')?.value,
    };

    this.userService.registerCustomer(customer).subscribe({
      next: (result) => {
        this.alertMessage = 'User created successfully';
        this.alertType = 0; // success
        this.openModal();   // Show modal popup
        setTimeout(() => {
          this.closeModal();
          this.router.navigate(['home']); // adjust route as needed
        }, 1500);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 409) {
          this.alertMessage = "User with this email already exists.";
          this.alertType = 1; // warning
        } else {
          this.alertMessage = "An unexpected error occurred. Please try again.";
          this.alertType = 2; // error
        }
        this.openModal();  // Show modal popup on error as well
      }
    });

  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

}
