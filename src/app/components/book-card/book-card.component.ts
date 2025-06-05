import { Component, Input } from '@angular/core';
import { ApiResponse, Book } from '../../Interfaces/Book.model';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ApiCallService } from '../../Services/api-call.service';
import { CartService } from '../../Services/cart.service';
import { CartItem } from '../../Interfaces/Book.model';


@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterModule,CommonModule,ToastrModule],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss'
})
export class BookCardComponent {
  @Input() book!: Book
  constructor(private apicall: ApiCallService, private toastr: ToastrService,private cartService: CartService) {}
  addToCart(): void {
    debugger
    if (this.book) {
     const itemC = {
        bookId: this.book.id,
        quantity: 1,
      };
      this.apicall.postWithToken<ApiResponse>('Cart/AddToCart', itemC).subscribe({
        next: (response:ApiResponse) => {
          if (response.responseCode === 200) {
            this.toastr.success('Book added to cart successfully', 'Success');
            const item: CartItem = {
        book: this.book,
        quantity: 1,
      };
      this.cartService.addToCart(item)
          } else {
            this.toastr.error(response.responseMessage || 'Failed to add book to cart', 'Error');
          }
        },
        error: (error) => {
          this.toastr.error('An error occurred while adding book to cart', 'Error');
        }
      });
     
      
      
    }
  }
}
