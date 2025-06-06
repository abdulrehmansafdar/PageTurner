import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiCallService } from '../../Services/api-call.service';
import { ApiResponse } from '../../Interfaces/Book.model';
import { CartService } from '../../Services/cart.service';
import { CartItem } from '../../Interfaces/Book.model';


@Component({
  selector: "app-checkout",
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: "./checkout.component.html",
  styleUrl: "./checkout.component.scss",
  standalone: true,
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  paymentForm: FormGroup;
  cartItems: CartItem[] = [];
  cartSubtotal: number = 0;
  cartTotal: number = 0;
  isSubmitting: boolean = false;
  selectedPayment: string = 'credit'; // Default payment method
  selectedCountryCode: string = '+1'; // Default country code

  // Sample country codes for demonstration
  countryCodes = [
    { code: '+1', flag: '🇺🇸' },
    { code: '+44', flag: '🇬🇧' },
    { code: '+91', flag: '🇮🇳' },
    { code: '+61', flag: '🇦🇺' },
    { code: '+86', flag: '🇨🇳' },
    { code: '+49', flag: '🇩🇪' },
    { code: '+33', flag: '🇫🇷' },
    { code: '+81', flag: '🇯🇵' },
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private apicallService: ApiCallService,
  ) {
    // Initialize the form with all required fields
    this.checkoutForm = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      phone: ["", [Validators.required, Validators.pattern("^[0-9]{10}$")]],
      address: ["", Validators.required],
      city: ["", Validators.required],
      zipCode: ["", [Validators.required, Validators.pattern("^[0-9]{5}$")]],
      country: ["", Validators.required],
    });

    // Separate form group for payment
    this.paymentForm = this.fb.group({
      cardNumber: ["", [Validators.required, Validators.pattern("^[0-9]{16}$")]],
      cardExpiry: ["", [Validators.required, Validators.pattern("^(0[1-9]|1[0-2])\\/[0-9]{2}$")]],
      cardCvv: ["", [Validators.required, Validators.pattern("^[0-9]{3,4}$")]]
    });

    this.updateCartData();
  }

  ngOnInit(): void {
    // Fetch cart items from API
    this.apicallService.getWithToken<ApiResponse>("Cart/GetCartItems").subscribe({
      next: (response: ApiResponse) => {
        if (response.responseData) {
          this.cartService.Setcartitems(response.responseData as CartItem[]);
          this.updateCartData();
        } else {
          this.cartService.Setcartitems([]);
        }
        this.cartService.calculateTotal();
        this.cartService.updateTotalItemsCount();
      },
      error: (error) => {
        console.error("Error fetching cart items:", error);
        this.cartService.Setcartitems([]);
      },
    });

    // Add conditional validation based on payment method
    this.setPaymentMethod('credit');
  }

  // Update payment method and adjust form validation accordingly
  setPaymentMethod(method: string): void {
    this.selectedPayment = method;
    
    const cardNumberControl = this.paymentForm.get('cardNumber');
    const cardExpiryControl = this.paymentForm.get('cardExpiry');
    const cardCvvControl = this.paymentForm.get('cardCvv');
    
    if (method === 'credit') {
      // Enable validation for credit card fields
      cardNumberControl?.setValidators([Validators.required, Validators.pattern("^[0-9]{16}$")]);
      cardExpiryControl?.setValidators([Validators.required, Validators.pattern("^(0[1-9]|1[0-2])\\/[0-9]{2}$")]);
      cardCvvControl?.setValidators([Validators.required, Validators.pattern("^[0-9]{3,4}$")]);
    } else {
      // Disable validation for credit card fields when COD is selected
      cardNumberControl?.clearValidators();
      cardExpiryControl?.clearValidators();
      cardCvvControl?.clearValidators();
    }
    
    // Update validation status
    cardNumberControl?.updateValueAndValidity();
    cardExpiryControl?.updateValueAndValidity();
    cardCvvControl?.updateValueAndValidity();
  }

// Update cart data from service
updateCartData(): void {
  this.cartItems = this.cartService.cartitems();
  this.cartSubtotal = this.cartService.totalPrice();
  // Include tax (8%) in the total calculation
  const tax = this.cartSubtotal * 0.08;
  this.cartTotal = this.cartSubtotal + tax;
}

  // Calculate estimated delivery date
  getDeliveryDate(daysToAdd: number = 3): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date;
  }

  // Form submission handler
  onSubmit(): void {
    // First validate the checkout form
    if (this.checkoutForm.invalid) {
      Object.keys(this.checkoutForm.controls).forEach(field => {
        const control = this.checkoutForm.get(field);
        control?.markAsTouched();
      });
      return;
    }

    // If credit card payment is selected, validate payment form
    if (this.selectedPayment === 'credit' && this.paymentForm.invalid) {
      Object.keys(this.paymentForm.controls).forEach(field => {
        const control = this.paymentForm.get(field);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    // Prepare order data
    const orderData = {
      ...this.checkoutForm.value,
      paymentMethod: this.selectedPayment,
      countryCode: this.selectedCountryCode,
      items: this.cartItems.map(item => ({
        bookId: item.book.id,
        quantity: item.quantity
      }))
    };

    // If using credit card, process with Stripe or add payment details
    if (this.selectedPayment === 'credit') {
      // For Stripe integration later:
      // this.processStripePayment(orderData);
      
      // For now, just include card data
      orderData.paymentDetails = this.paymentForm.value;
    }

    // Submit order to API
    this.apicallService.postWithToken<ApiResponse>('Orders/PlaceOrder', orderData).subscribe({
      next: (response) => {
        if (response.responseCode === 200) {
          // Clear cart and navigate to confirmation page
          this.cartService.clearCart();
          this.router.navigate(['/order-confirmation'], { 
            queryParams: { 
              orderId: response.responseData.orderId,
              total: this.cartTotal
            } 
          });
        } else {
          console.error('Order placement failed:', response.errorMessages);
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.isSubmitting = false;
      }
    });
  }
}
