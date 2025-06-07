import { Component, HostListener, OnInit, PLATFORM_ID, Inject, OnDestroy, effect, computed } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../Services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroHome, heroPlusCircle, heroMagnifyingGlass, heroShoppingCart, heroCube, heroSquare3Stack3d, heroQuestionMarkCircle, heroArrowRightStartOnRectangle, heroInboxStack, heroBars3, heroXMark } from '@ng-icons/heroicons/outline';
import { CartService } from '../../Services/cart.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIcon],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss',
  viewProviders: [provideIcons({
    heroHome,
    heroPlusCircle,
    heroCube,
    heroMagnifyingGlass,
    heroShoppingCart,
    heroSquare3Stack3d,
    heroQuestionMarkCircle,
    heroArrowRightStartOnRectangle,
    heroInboxStack,
    heroBars3,
    heroXMark
  })]
})
export class SideBarComponent implements OnInit, OnDestroy {
  expanded = false;
  showSidebar = false;
  isMobile = false;
  cartcount = 0;
  isAdmin = false;

  hideSidebar = false;
  private subscription: Subscription = new Subscription();

  menuItems = [
    { icon: "heroHome", label: "Home", link: "/home", exact: true, badge: false, badgeCount: 0, adminOnly: false },
    { icon: "heroMagnifyingGlass", label: "Browse Books", link: "/search", exact: false, badge: false, badgeCount: 0, adminOnly: false },
    { icon: "heroPlusCircle", label: "Add Books", link: "/Add-book", exact: false, badge: false, badgeCount: 0, adminOnly: false },
    { icon: "heroShoppingCart", label: "Shopping Cart", link: "/cart", exact: false, badge: true, badgeCount: this.cartcount, adminOnly: false },
    { icon: "heroCube", label: "My Orders", link: "/orders", exact: false, badge: false, badgeCount: 0, adminOnly: false },
    { icon: "heroInboxStack", label: "Book Requests", link: "/book-requests", exact: false, badge: false, badgeCount: 0, adminOnly: true },
    { icon: "heroSquare3Stack3d", label: "Categories", link: "/add-category", exact: false, badge: false, badgeCount: 0, adminOnly: true },
    { icon: "heroQuestionMarkCircle", label: "Help & Support", link: "/about-help", exact: false, badge: false, badgeCount: 0, adminOnly: false },
  ];

  constructor(
    private authService: AuthService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    public cartService: CartService
  ) {
    effect(() => {
      this.cartcount = this.cartService.totalItems();
    });

    this.checkScreenSize();

    // Subscribe to hideHeaderFooter$ to sync sidebar visibility
    this.subscription.add(
      this.authService.hideHeaderFooter$.subscribe(
        (hide: boolean) => {
          this.hideSidebar = hide;
          if (hide) {
            this.showSidebar = false;
          } else if (!this.isMobile) {
            this.showSidebar = true;
          }
        }
      )
    );

    // Close sidebar on navigation in mobile view
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        if (this.isMobile) {
          this.showSidebar = false;
        }
      })
    );
  }

  ngOnInit(): void {
    // Initialize sidebar state based on screen size
    this.checkScreenSize();
    this.cartcount = this.cartService.totalItems();
    this.isAdmin = this.authService.isAdmin();
    // For desktop, we start with the sidebar collapsed if not on auth routes
    if (!this.isMobile && !this.hideSidebar) {
      this.showSidebar = true;
      this.expanded = false;
    }
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions when component is destroyed
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 768;

      // On mobile, hide sidebar by default
      if (this.isMobile) {
        this.showSidebar = false;
      } else if (!this.hideSidebar) {
        this.showSidebar = true;
      }
    }
  }

  // Handle clicking outside the sidebar (on the backdrop)
  onBackdropClick(): void {
    if (this.isMobile) {
      this.showSidebar = false;
    }
  }

  expandSidebar(): void {
    if (!this.isMobile && !this.hideSidebar) {
      this.expanded = true;
    }
  }
   // Get visible menu items based on user role
  get visibleMenuItems() {
    return this.menuItems.filter(item => !item.adminOnly || this.isAdmin);
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

  // Handle navigation item click for mobile
  onNavItemClick(): void {
    if (this.isMobile) {
      this.showSidebar = false;
    }
  }

  Logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
