import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, EMPTY } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {
  private baseUrl = 'https://pageturner.runasp.net/api';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Formats endpoint URL
  private formatUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
  }

  // Builds headers with token (if available)
  private getAuthHeaders(): HttpHeaders | null {
    if (!this.isBrowser) return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // GET without token
  public get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(this.formatUrl(endpoint));
  }

  // GET with token
  public getWithToken<T>(endpoint: string): Observable<T> {
    const headers = this.getAuthHeaders();
    return headers
      ? this.http.get<T>(this.formatUrl(endpoint), { headers })
      : EMPTY; // <-- safer than of() without value
  }

  // POST without token
  public post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(this.formatUrl(endpoint), data);
  }

  // POST with token
  public postWithToken<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return headers
      ? this.http.post<T>(this.formatUrl(endpoint), data, { headers })
      : EMPTY;
  }

  // PUT with token
  public putWithToken<T>(endpoint: string, data: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return headers
      ? this.http.put<T>(this.formatUrl(endpoint), data, { headers })
      : EMPTY;
  }

  // DELETE with token
  public deleteWithToken<T>(endpoint: string): Observable<T> {
    const headers = this.getAuthHeaders();
    return headers
      ? this.http.delete<T>(this.formatUrl(endpoint), { headers })
      : EMPTY;
  }
}
