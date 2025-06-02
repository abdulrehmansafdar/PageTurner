import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { ApiCallService } from './api-call.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private hideHeaderFooterSubject = new BehaviorSubject<boolean>(false);
  public hideHeaderFooter$ = this.hideHeaderFooterSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Routes where header and footer should be hidden
  private authRoutes = ['/login', '/signup', '/landing', '/', '/register', '/forgot-password'];

  constructor(
    private router: Router, 
    private apiService: ApiCallService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkRoute(event.url);
    });

    // Check initial route
    this.checkRoute(this.router.url);

    this.checkAuthStatus();
  }

  private checkRoute(url: string): void {
    const shouldHide = this.authRoutes.some(route => 
      url === route || url.startsWith(route + '?') || url.startsWith(route + '#')
    );
    this.hideHeaderFooterSubject.next(shouldHide);
  }

  private checkAuthStatus(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        this.isLoggedInSubject.next(true);
        // Load user data if needed
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login', credentials);
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/register', userData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  setAuthData(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', response.token);
    }
    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next(response.user);
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  // Method to manually set header/footer visibility
  setHeaderFooterVisibility(hide: boolean): void {
    this.hideHeaderFooterSubject.next(hide);
  }

  // Method to check if current route should hide header/footer
  shouldHideHeaderFooter(): boolean {
    return this.hideHeaderFooterSubject.value;
  }
}
