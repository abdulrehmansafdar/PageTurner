import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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

    cartitems!: typeof this.cartService.cartitems;
  totalPrice!: typeof this.cartService.totalPrice;

  constructor(public cartService: CartService,private toastr: ToastrService,
    private apicallService: ApiCallService
  ) {}
  

  ngOnInit(): void {
    this.cartitems = this.cartService.cartitems;
    this.totalPrice = this.cartService.totalPrice;
    this.apicallService.getWithToken<ApiResponse>("cart").subscribe({
      next: (response: ApiResponse) => {
      this.cartService.Setcartitems(response.responseData as CartItem[]);
      this.cartService.calculateTotal();
      this.cartService.SetTotalItems(response.responseData.length);
      },
      error: (error) => {
        this.toastr.error("Failed to load cart items", "Error");
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