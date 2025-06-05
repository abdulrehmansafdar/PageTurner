import { CommonModule } from '@angular/common';
import { Component, effect, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiResponse, CartItem } from '../../Interfaces/Book.model';
import { CartService } from '../../Services/cart.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiCallService } from '../../Services/api-call.service';

@Component({
  selector: 'app-cart',
  imports: [RouterModule,CommonModule,ToastrModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent  implements OnInit {

    cartitems:CartItem[] = [];
  totalPrice!: typeof this.cartService.totalPrice;
  loading = true; // Add loading state

  constructor(
    public cartService: CartService,
    private toastr: ToastrService,
    private apicallService: ApiCallService
  ) {
    effect(() => {
      this.cartitems = this.cartService.cartitems();
      this.totalPrice = this.cartService.totalPrice;
    });
  }

  ngOnInit(): void {
    this.totalPrice = this.cartService.totalPrice;
    this.apicallService.getWithToken<ApiResponse>("Cart/GetCartItems").subscribe({
      next: (response: ApiResponse) => {
        if (response.responseData) {
          this.cartService.Setcartitems(response.responseData as CartItem[]);
        } else {
          this.cartService.Setcartitems([]); // Ensure empty array if no data
        }
        this.cartService.calculateTotal();
        this.cartService.updateTotalItemsCount();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error("Failed to load cart items", "Error");
        this.loading = false;
        this.cartService.Setcartitems([]); // Set to empty on error
      }
    });
  }

  updateQuantity(bookId: number, quantity: number): void {
    const value = {
      bookId: bookId,
      quantity: quantity
    }
    this.apicallService.postWithToken<ApiResponse>(`Cart/UpdateCartItemQuantity`, value).subscribe((response: ApiResponse) => {
      if (response.responseCode == 200) {
        this.cartService.updateQuantity(bookId, quantity);
        this.toastr.success("Cart item quantity updated successfully", "Success");       
      }
      else {
        this.toastr.error(response.responseMessage || "Failed to update cart item quantity", "Error");
      }
    }
    , (error) => {
      if (error.status === 400) {
        this.toastr.error("Invalid quantity", "Error");
      } else {
        this.toastr.error("Failed to update cart item quantity", "Error");
      }
    });
  }

  removeFromCart(bookId: number): void {
    this.apicallService.postWithToken<ApiResponse>(`Cart/RemoveFromCart?bookId=${bookId}`, null).subscribe((response: ApiResponse) => {
      if (response.responseCode == 200) {
        this.cartService.removeFromCart(bookId);
        this.toastr.success("Item removed from cart successfully", "Success");
      } else {
        this.toastr.error(response.responseMessage || "Failed to remove item from cart", "Error");
      }
    }, (error:any) => {
      if (error.status === 404) {
        this.toastr.error("Item not found in cart", "Error");
      }
    });
  }

  clearCart(): void {
    this.apicallService.postWithToken<ApiResponse>(`Cart/ClearCart`, null).subscribe((response: ApiResponse) => {
      if (response.responseCode == 200) {
        this.cartService.clearCart();
        this.toastr.success("Cart cleared successfully", "Success");
      } else {
        this.toastr.error(response.responseMessage || "Failed to clear cart", "Error");
      }
    });
  }
}