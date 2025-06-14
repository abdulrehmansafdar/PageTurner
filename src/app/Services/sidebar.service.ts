import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarVisibleSubject = new BehaviorSubject<boolean>(false);
  sidebarVisible$ = this.sidebarVisibleSubject.asObservable();

  constructor() { }

  toggleSidebar(): void {
    this.sidebarVisibleSubject.next(!this.sidebarVisibleSubject.value);
  }

  setSidebarVisible(visible: boolean): void {
    this.sidebarVisibleSubject.next(visible);
  }

  getSidebarVisibleValue(): boolean {
    return this.sidebarVisibleSubject.value;
  }
}