import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnInit } from '@angular/core';
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
 totalItems!: number;

  constructor(
    private router: Router,
    public cartService: CartService,
  ) {
    effect(() => {
      this.totalItems = this.cartService.totalItems();
    });
  }

  ngOnInit(): void {}

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(["/search"], { queryParams: { q: this.searchQuery.trim() } })
    }
  }

}
