import { Component, HostListener, OnInit, PLATFORM_ID, Inject, OnDestroy, effect } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroHome,heroPlusCircle,heroMagnifyingGlass,heroShoppingCart,heroCube,heroSquare3Stack3d,heroQuestionMarkCircle,heroArrowRightStartOnRectangle,heroInboxStack  } from '@ng-icons/heroicons/outline';
import { CartService } from '../../Services/cart.service';
// Define User interface


@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule,NgIcon],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
  viewProviders: [provideIcons({ heroHome, heroPlusCircle,heroCube,heroMagnifyingGlass,heroShoppingCart,heroSquare3Stack3d,heroQuestionMarkCircle,heroArrowRightStartOnRectangle,heroInboxStack  })]
})
export class SideBarComponent implements OnInit, OnDestroy {
  expanded = false;
  showSidebar = false;
  isMobile = false;
  cartcount = 0;
 
  hideSidebar = false;
  private subscription: Subscription = new Subscription();

  menuItems = [
    { icon: "heroHome", label: "Home", link: "/home", exact: true,badge:false,badgeCount: 0 },
  { icon: "heroMagnifyingGlass", label: "Browse Books", link: "/search", exact: false,badge:false,badgeCount: 0 },
  { icon: "heroPlusCircle", label: "Add Books", link: "/Add-book", exact: false,badge:false,badgeCount: 0 },
  { icon: "heroShoppingCart", label: "Shopping Cart", link: "/cart", exact: false,badge:true, badgeCount: this.cartcount },
  { icon: "heroCube", label: "My Orders", link: "/orders", exact: false,badge:false,badgeCount: 0 },
  { icon: "heroInboxStack", label: "Book Requests", link: "/book-requests", exact: false,badge:false ,badgeCount: 0},
  { icon: "heroSquare3Stack3d", label: "Categories", link: "/add-category", exact: false,badge:false ,badgeCount: 0},
  { icon: "heroQuestionMarkCircle", label: "Help & Support", link: "/help", exact: false,badge:false,badgeCount: 0 },
  ];


  constructor(
    private authService: AuthService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    public cartService: CartService // Assuming cartService is part of AuthService
  ) {
    effect(() => {
      this.cartcount = this.cartService.totalItems();
        });
    this.checkScreenSize();
    
    // Subscribe to hideHeaderFooter$ to sync sidebar visibility with header/footer
    this.subscription = this.authService.hideHeaderFooter$.subscribe(
      (hide: boolean) => {
        this.hideSidebar = hide;
        if (hide) {
          this.showSidebar = false;
        } else if (!this.isMobile) {
          this.showSidebar = true;
        }
      }
    );
  }

  ngOnInit(): void {
    debugger
    // Initialize sidebar state based on screen size
    this.checkScreenSize();
    this.cartcount = this.cartService.totalItems();

    // For desktop, we start with the sidebar collapsed if not on auth routes
    if (!this.isMobile && !this.hideSidebar) {
      this.showSidebar = true;
      this.expanded = false;
    }
  }

  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    this.subscription.unsubscribe();
  }

  @HostListener("window:resize")
  checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 768;

    // On mobile, hide sidebar by default
    if (this.isMobile) {
      this.showSidebar = false;
    } else {
      this.showSidebar = true;
    }
    }
    
  }

  expandSidebar(): void {
    if (!this.isMobile && !this.hideSidebar) {
      this.expanded = true;
    }
  }

  collapseSidebar(): void {
    if (!this.isMobile && !this.hideSidebar) {
      this.expanded = false;
    }
  }

  toggleSidebar(): void {
    if (!this.hideSidebar) {
      this.showSidebar = !this.showSidebar;
      if (this.showSidebar && this.isMobile) {
        this.expanded = true;
      }
    }
  }

  Logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  
  }
}
