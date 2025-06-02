import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse, Book, CartItem } from '../../Interfaces/Book.model';
import { BookService } from '../../Services/book.service';
import { CartService } from '../../Services/cart.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiCallService } from '../../Services/api-call.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-book-detail',
  imports: [DatePipe,CommonModule,ToastrModule],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss'
})
export class BookDetailComponent implements OnInit {
 book: Book | undefined
  quantity = 1

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private cartService: CartService,
    private apiCall: ApiCallService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.apiCall.postWithToken<ApiResponse>(`Book/GetBookById/${id}`, null).subscribe((response) => {
        if (response.responseCode === 200) {
          this.book = response.responseData as Book;
          if (!this.book) {
            this.router.navigate(['/404']);
          }
        } else {
          this.toastr.error(response.errorMessages || 'Failed to load book details', 'Error');
        }
      }
      , (error) => {
        this.toastr.error('Failed to load book details', 'Error');
        console.error('Error loading book details:', error);
        this.router.navigate(['/404']);
      });
    }
  }

  increaseQuantity(): void {
    this.quantity++
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--
    }
  }

  addToCart(): void {
    if (this.book) {
      this.apiCall.postWithToken<ApiResponse>('Cart/AddToCart', {
        bookId: this.book.id,
        quantity: this.quantity
      }).subscribe({
        next: (response) => {
          if (response.responseCode === 200) {
            this.toastr.success('Book added to cart', 'Success');
            const cartItem: CartItem = {
              book: this.book as Book,
              quantity: this.quantity
            };
            this.cartService.addToCart(cartItem);
          } else {
            this.toastr.error(response.errorMessages || 'Failed to add book to cart', 'Error');
          }
        },
        error: (error) => {
          this.toastr.error('Failed to add book to cart', 'Error');
          console.error('Error adding book to cart:', error);
        }
      });
    }
  }

}
