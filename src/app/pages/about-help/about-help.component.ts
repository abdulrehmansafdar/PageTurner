import { Component, OnInit,PLATFORM_ID,Inject, } from '@angular/core';
import { CommonModule,isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-help',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-help.component.html',
  styleUrls: ['./about-help.component.scss']
})
export class AboutHelpComponent implements OnInit {
  activeTab: string = 'about';
  
 
  
  faqs = [
    {
      question: 'How do I place an order?',
      answer: 'You can place an order by browsing our collection, adding books to your cart, and proceeding to checkout. You\'ll need to create an account or log in to complete your purchase.',
      isOpen: false
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay for online purchases.',
      isOpen: false
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping typically takes 3-7 business days within the continental US. Express shipping (1-3 business days) is available for an additional fee. International shipping times vary by location.',
      isOpen: false
    },
    {
      question: 'Can I return a book?',
      answer: 'Yes, we accept returns within 30 days of delivery. Books must be in original condition. Please contact our customer service team to initiate a return.',
      isOpen: false
    },
    {
      question: 'Do you offer eBooks?',
      answer: 'Yes! We offer eBooks for most of our titles. You can read them on our mobile app or any device that supports ePub or PDF formats.',
      isOpen: false
    },
    {
      question: 'Is there a loyalty program?',
      answer: 'Absolutely! Our BookLeaf Rewards program lets you earn points with every purchase. These points can be redeemed for discounts, exclusive books, or special merchandise.',
      isOpen: false
    }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId:object
  ) { }

  ngOnInit(): void {
    // Get tab from URL if present
    if(isPlatformBrowser(this.platformId)){
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['about', 'mission',  'faq', 'contact'].includes(tab)) {
      this.activeTab = tab;
    }
  }
  }

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
    // make all other FAQs closed
    this.faqs.forEach((faq, i) => {
      if (i !== index) {
        faq.isOpen = false;
      }
    }
  );
  }
}