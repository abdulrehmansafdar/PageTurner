import { CommonModule,isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit,PLATFORM_ID,Inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  imports: [CommonModule,RouterModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
  private animationSubscription?: Subscription
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ){}
  particles: Array<{x: number, y: number, delay: number}> = []

  // Helper array for grid patterns
  gridHelper = Array.from({length: 12}, (_, i) => i + 1)

  features = [
    {
      icon: "🚀",
      title: "Lightning Fast Search",
      description: "Advanced AI-powered search engine finds your perfect book in milliseconds with intelligent recommendations.",
    },
    {
      icon: "🌟",
      title: "Premium Collection",
      description: "Curated selection of over 10,000 books from bestsellers to rare literary gems, all in one place.",
    },
    {
      icon: "🎯",
      title: "Smart Recommendations",
      description: "Machine learning algorithms analyze your preferences to suggest books you'll absolutely love.",
    },
    {
      icon: "📱",
      title: "Multi-Device Sync",
      description: "Seamlessly switch between devices while maintaining your reading progress and bookmarks.",
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Bank-level encryption protects your data with complete privacy and security guarantees.",
    },
    {
      icon: "💎",
      title: "Exclusive Content",
      description: "Access to author interviews, book club discussions, and exclusive early releases.",
    },
  ]

  categories = [
    { name: "Fiction", icon: "📖", count: "2,450" },
    { name: "Mystery", icon: "🔍", count: "1,230" },
    { name: "Romance", icon: "💕", count: "1,890" },
    { name: "Sci-Fi", icon: "🚀", count: "980" },
    { name: "Fantasy", icon: "🧙‍♂️", count: "1,560" },
    { name: "Biography", icon: "👤", count: "720" },
  ]

  ngOnInit(): void {
    this.generateParticles()
    this.startAnimations()
  }

  ngOnDestroy(): void {
    if (this.animationSubscription) {
      this.animationSubscription.unsubscribe()
    }
  }

  scrollToFeatures(): void {
    const element = document.getElementById("features")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  private generateParticles(): void {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 8
      })
    }
  }
  checklogin(url: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem("token")
      if (!token) {
        this.router.navigate([url])
      }
      else {
        this.router.navigate(["/home"])
      }
    }
  }

  private startAnimations(): void {
    // Add any continuous animations here
  }
}
