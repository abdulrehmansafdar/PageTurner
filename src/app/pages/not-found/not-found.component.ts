import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit {
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Add entrance animation class after component loads, but only in browser
    if (this.isBrowser) {
      setTimeout(() => {
        const container = document.querySelector('.content-wrapper');
        container?.classList.add('animate-in');
      }, 100);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToBooks(): void {
    this.router.navigate(['/books']);
  }

  onSearch(event?: any): void {
    if (!this.isBrowser) return;
    
    const searchTerm = event?.target?.value || 
                      (document.querySelector('.search-input') as HTMLInputElement)?.value;
    
    if (searchTerm?.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: searchTerm.trim() } });
    }
  }
}