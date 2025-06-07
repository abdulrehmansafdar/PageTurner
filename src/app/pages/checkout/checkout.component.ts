import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiCallService } from '../../Services/api-call.service';
import { ApiResponse } from '../../Interfaces/Book.model';
import { CartService } from '../../Services/cart.service';
import { CartItem } from '../../Interfaces/Book.model';
import { ToastrService } from 'ngx-toastr';

declare var Stripe: any;

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
  
  // Stripe related properties
  private stripe: any;
  private elements: any;
  private cardElement: any;
  paymentProcessing: boolean = false;
  paymentError: string | null = null;

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
    private toastr: ToastrService
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

    // Simplified payment form since we'll use Stripe Elements
    this.paymentForm = this.fb.group({
      cardholderName: ["", Validators.required]
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
    
    // Initialize Stripe if credit card payment selected
    if (this.selectedPayment === 'credit') {
      this.initializeStripe();
    }
  }

  // Initialize Stripe elements
  initializeStripe(): void {
    // Load Stripe.js dynamically if not loaded
    if (typeof Stripe === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        this.setupStripeElements();
      };
      document.body.appendChild(script);
    } else {
      this.setupStripeElements();
    }
  }

  // Setup Stripe elements
  setupStripeElements(): void {
    // Initialize Stripe with your publishable key
    this.stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY'); // Replace with your actual publishable key
    this.elements = this.stripe.elements();

    // Create and mount the card element
    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    // Create the card element and mount it to the DOM
    setTimeout(() => {
      const cardElement = document.getElementById('card-element');
      if (cardElement) {
        this.cardElement = this.elements.create('card', { style });
        this.cardElement.mount('#card-element');
        
        // Add event listener for change events on the card element
        this.cardElement.on('change', (event: any) => {
          const displayError = document.getElementById('card-errors');
          if (displayError) {
            displayError.textContent = event.error ? event.error.message : '';
          }
        });
      }
    }, 100);
  }

  // Update payment method and adjust form validation accordingly
  setPaymentMethod(method: string): void {
    this.selectedPayment = method;
    
    if (method === 'credit' && !this.cardElement) {
      this.initializeStripe();
    }
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

  // Process payment with Stripe
  async processPayment(): Promise<boolean> {
    if (this.selectedPayment !== 'credit') {
      this.toastr.info('Processing for non credit card', 'Info');
      return true; // Skip payment processing for non-credit card methods
    }

    this.paymentProcessing = true;
    this.paymentError = null;

    try {
      // Calculate amount in cents (Stripe requires amount in smallest currency unit)
      const amountInCents = Math.round(this.cartTotal * 100);

      // 1. Create a payment intent on the server
      const paymentIntentResponse = await this.apicallService
        .postWithToken<ApiResponse>('Payments/create-payment-intent', amountInCents)
        .toPromise();

      if (paymentIntentResponse?.responseCode !== 200 || !paymentIntentResponse?.responseData?.clientSecret) {
        this.toastr.error('Failed to create payment intent', 'Error');
        return false;
      }

      const clientSecret = paymentIntentResponse.responseData.clientSecret;
      
      // 2. Confirm the payment with Stripe.js
      const cardholderName = this.paymentForm.get('cardholderName')?.value;
      
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: cardholderName
          }
        }
      });

      if (error) {
        this.paymentError = error.message;
        this.toastr.error(this.paymentError || 'Payment failed', 'Payment Error');
        return false;
      }

      if (paymentIntent.status === 'succeeded') {
        return true;
      } else {
        this.paymentError = 'Payment was not successful';
        this.toastr.error(this.paymentError, 'Payment Failed');
        return false;
      }
    } catch (error: any) {
      this.paymentError = error.message;
      this.toastr.error(this.paymentError || 'An error occurred', 'Payment Failed');
      return false;
    } finally {
      this.paymentProcessing = false;
    }
  }

  // Form submission handler
  async onSubmit(): Promise<void> {
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

    // Process payment first if using credit card
    if (this.selectedPayment === 'credit') {
      const paymentSuccessful = await this.processPayment();
      if (!paymentSuccessful) {
        this.isSubmitting = false;
        return;
      }
    }

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

    // Submit order to API
    this.apicallService.postWithToken<ApiResponse>('Orders/PlaceOrder', orderData).subscribe({
      next: (response) => {
        if (response.responseCode === 200) {
          // Clear cart and navigate to confirmation page
          this.cartService.clearCart();
          this.toastr.success('Order placed successfully!', 'Success');
          this.router.navigate(['/order-confirmation'], { 
            queryParams: { 
              orderId: response.responseData.orderId,
              total: this.cartTotal
            } 
          });
        } else {
          this.toastr.error(response.errorMessages || 'Failed to place order', 'Error');
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error placing order:', error);
        this.toastr.error('Failed to place order', 'Error');
        this.isSubmitting = false;
      }
    });
  }
}
