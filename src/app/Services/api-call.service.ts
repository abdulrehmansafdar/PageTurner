import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {
  private baseUrl = 'https://localhost:7034/api'; // Remove trailing slash
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Helper method to properly format endpoint URLs
  private formatUrl(endpoint: string): string {
    // Remove leading slash if present
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.baseUrl}/${formattedEndpoint}`;
  }

  // GET request without token
  public get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(this.formatUrl(endpoint));
  }

  // GET request with token
  public getWithToken<T>(endpoint: string): Observable<T> {
    if (!this.isBrowser) {
      // If running on server, return an empty observable or handle as needed
      console.log('getWithToken called in server environment');
      return of() as Observable<T>;
    }
    
    const token = localStorage.getItem('token'); 
    if (!token) {
      console.warn('No token found in localStorage');
      return of() as Observable<T>;
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<T>(this.formatUrl(endpoint), { headers });
  }

  // POST request without token
  public post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(this.formatUrl(endpoint), data);
  }

  // POST request with token
  public postWithToken<T>(endpoint: string, data: any): Observable<T> {
    if (!this.isBrowser) {
      // If running on server, return an empty observable or handle as needed
      console.log('postWithToken called in server environment');
      return of() as Observable<T>;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return of() as Observable<T>;
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<T>(this.formatUrl(endpoint), data, { headers });
  }
  
  // Add PUT and DELETE methods with token for completeness
  public putWithToken<T>(endpoint: string, data: any): Observable<T> {
    if (!this.isBrowser) {
      console.log('putWithToken called in server environment');
      return of() as Observable<T>;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return of() as Observable<T>;
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<T>(this.formatUrl(endpoint), data, { headers });
  }
  
  public deleteWithToken<T>(endpoint: string): Observable<T> {
    if (!this.isBrowser) {
      console.log('deleteWithToken called in server environment');
      return of() as Observable<T>;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found in localStorage');
      return of() as Observable<T>;
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<T>(this.formatUrl(endpoint), { headers });
  }
}
