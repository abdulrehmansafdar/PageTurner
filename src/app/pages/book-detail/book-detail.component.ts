import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Book } from '../../Interfaces/Book.model';
import { BookService } from '../../Services/book.service';
import { CartService } from '../../Services/cart.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-book-detail',
  imports: [DatePipe,CommonModule],
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
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.bookService.getBookById(id).subscribe((book) => {
        this.book = book
      })
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
      this.cartService.addToCart(this.book, this.quantity)
      // You could add a toast notification here
    }
  }

}
