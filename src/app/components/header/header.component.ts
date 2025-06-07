import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, OnInit, PLATFORM_ID, Inject, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CartService } from '../../Services/cart.service';
import { AuthService } from '../../Services/auth.service';
import { User } from '../../Interfaces/Book.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {


  searchQuery = ""
  totalItems!: number;
  currentUser !: User
  showProfile = false;
  @ViewChild('profileDropdown') profileDropdown!: ElementRef;
  @ViewChild('profileButton') profileButton!: ElementRef;
  constructor(
    private router: Router,
    public cartService: CartService,
    public auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    effect(() => {
      this.totalItems = this.cartService.totalItems();
      this.currentUser = this.auth.getUser();
    });
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getUser();
    this.totalItems = this.cartService.totalItems();
    if (isPlatformBrowser(this.platformId)) {
      debugger
      const user: User = {

        username: localStorage.getItem("username") || "",
        email: localStorage.getItem("email") || "",
        Role: localStorage.getItem("Role") || "",
      };
      console.log("User from localStorage:", user);
      if (user.username && user.email && user.Role) {
        console.log("current before setting: if", this.auth.getUser());
        this.auth.setUser(user);
      } else {
        console.log("current before setting: else", this.auth.getUser());
        this.auth.setUser({
          username: "",
          email: "",
          Role: ""
        });
      }
    }
    console.log("Current User:", this.currentUser);
  }


   // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Skip if dropdown is already closed
    if (!this.showProfile) return;
    
    // Check if click was outside both the dropdown and the button that toggles it
    const clickedInsideDropdown = this.profileDropdown?.nativeElement.contains(event.target);
    const clickedOnButton = this.profileButton?.nativeElement.contains(event.target);
    
    if (!clickedInsideDropdown && !clickedOnButton) {
      this.showProfile = false;
    }
  }

  showUserProfile(event: Event) {
    // Stop propagation to prevent immediate closing due to document click
    event.stopPropagation();
    this.showProfile = !this.showProfile;
  }
  logout() {
      this.auth.logout();
    this.router.navigate(['/login']);
  }
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(["/search"], { queryParams: { q: this.searchQuery.trim() } })
    }
    else if (this.searchQuery.trim() === "") {

    }

  }

}
