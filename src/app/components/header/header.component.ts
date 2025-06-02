import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  searchQuery = ""
  cartItemCount$: Observable<number>

  constructor(
    private router: Router,
    private cartService: CartService,
  ) {
    this.cartItemCount$ = this.cartService.getCartItemCount()
  }

  ngOnInit(): void {}

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(["/search"], { queryParams: { q: this.searchQuery.trim() } })
    }
  }

}
