import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse, CartItem } from '../../Interfaces/Book.model';
import { CartService } from '../../Services/cart.service';
import { CommonModule } from '@angular/common';
import { ApiCallService } from '../../Services/api-call.service';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  standalone: true
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  cartSubtotal: number = 0;
  isSubmitting = false;
 paymentMethods = [
  { id: 'credit', name: 'Credit Card', icon: 'credit-card', description: 'Pay securely with your credit or debit card' },
  { id: 'cod', name: 'Cash on Delivery', icon: 'cash', description: 'Pay when your order is delivered' }
];
  selectedPayment = 'credit';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private apicallService:ApiCallService
  ) {
    this.checkoutForm = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      phone: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      email: ["", [Validators.required, Validators.email]],
      address: ["", Validators.required],
      city: ["", Validators.required],
      state: ["", Validators.required],
      zipCode: ["", [Validators.required, Validators.pattern("^[0-9]{5}$")]],
      country: ["", Validators.required],
      cardNumber: ["", [Validators.required, Validators.pattern("^[0-9]{16}$")]],
      cardExpiry: ["", [Validators.required, Validators.pattern("^(0[1-9]|1[0-2])\/[0-9]{2}$")]],
      cardCvv: ["", [Validators.required, Validators.pattern("^[0-9]{3,4}$")]]
    });
    
    // Get cart items and calculate totals correctly
    this.updateCartData();
  }

  ngOnInit(): void {
    debugger
     this.apicallService.getWithToken<ApiResponse>("Cart/GetCartItems").subscribe({
          next: (response: ApiResponse) => {
            if (response.responseData) {
              this.cartService.Setcartitems(response.responseData as CartItem[]);
              this.updateCartData();
            } else {
              this.cartService.Setcartitems([]); // Ensure empty array if no data
            }
            this.cartService.calculateTotal();
            this.cartService.updateTotalItemsCount();
            
          },
          error: (error) => {
            this.cartService.Setcartitems([]); // Set to empty on error
          }
        });
    this.updateCartData();
  }
  
  updateCartData(): void {
    // Get cart items
    this.cartItems = this.cartService.cartitems();
    
    // Calculate subtotal correctly
    this.cartSubtotal = this.calculateSubtotal();
    
    // Calculate total with tax
    this.cartTotal = this.cartSubtotal * 1.08;
  }
  
  calculateSubtotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.book.price * item.quantity);
    }, 0);
  }

  setPaymentMethod(method: string): void {
    this.selectedPayment = method;
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      this.isSubmitting = true;
      
      // Simulate order processing
      setTimeout(() => {
        this.cartService.clearCart();
        this.router.navigate(["/order-confirmation"]);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.checkoutForm.controls).forEach((key) => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
    }
  }
  
  getDeliveryDate(daysToAdd: number = 3): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date;
  }
}
