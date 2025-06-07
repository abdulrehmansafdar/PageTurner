import { Injectable, signal, Inject, PLATFORM_ID, WritableSignal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { ApiCallService } from './api-call.service';
import { User, LoginRequest, AuthResponse, RegisterRequest } from '../Interfaces/Book.model';




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

  User :WritableSignal<User> = signal<User>({
    username: '',
    email: '',
    Role: 'User'
  });

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
  setUser(user: User): void {
    this.User.set(user);
  }
  getUser(): User {
    return this.User();
  }

  private checkRoute(url: string): void {
    const shouldHide = this.authRoutes.some(route => 
      url === route || url.startsWith(route + '?') || url.includes("verify-email") || url.startsWith(route + '#' )
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
    return this.apiService.post<AuthResponse>('User/login', credentials);
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('User/register', userData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    this.User.set({
      username: 'U',
      email: '',
      Role: ''
    });
    localStorage.clear();
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
  isAdmin(): boolean {
    const user = this.getUser();
    return user && user.Role.toLocaleLowerCase() === 'admin';
  }
}
