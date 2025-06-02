import { Component, Input } from '@angular/core';
import { Book } from '../../Interfaces/Book.model';
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
    if (this.book) {
      const item: CartItem = {
        book: this.book,
        quantity: 1,
      };
    
      this.cartService.addToCart(item)
      
      
    }
  }
}
