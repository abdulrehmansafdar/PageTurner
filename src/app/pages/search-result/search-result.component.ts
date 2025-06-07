import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponse, Book, Category, SearchParams } from '../../Interfaces/Book.model';

import { BookCardComponent } from '../../components/book-card/book-card.component';
import { CommonModule } from '@angular/common';
import { BookService } from '../../Services/book.service';
import { ToastrService } from 'ngx-toastr';
import { ApiCallService } from '../../Services/api-call.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-result',
  imports: [BookCardComponent,CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.scss'
})
export class SearchResultComponent implements OnInit {
  
 searchQuery = "";
  categories: Category[] = [];
  filterForm: FormGroup;
  loading = false;
  currentPage = 1;
  pageSize = 10;
  totalBooks: number = 0;
hasMorePages: boolean = false;

  constructor(private route: ActivatedRoute, private bookService: BookService,
    private apicall: ApiCallService, private toastr: ToastrService,
    private fb: FormBuilder,
    private apiCall: ApiCallService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      priceRange: [''],
      sortBy: ['']
    });
  }
get books(): Book[] {
  return this.bookService.BooksSignal();
}
  ngOnInit(): void {
    // initially load books by default 
    this.searchBooks();
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params["q"] || "";
    });
    this.loadCategories();
     // Listen for URL query parameters
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params["q"] || "";
      if (this.searchQuery) {
        this.searchBooks();
      }
    });
     // Listen for filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.searchBooks();
    });
  }
 searchBooks(): void {
    this.loading = true;
    
    // Parse price range
    let minPrice = 0;
    let maxPrice = 0;
    
    if (this.filterForm.value.priceRange) {
      const range = this.filterForm.value.priceRange.split('-');
      minPrice = parseFloat(range[0]);
      if (range[1]) {
        maxPrice = parseFloat(range[1]);
      } else if (range[0].endsWith('+')) {
        // Handle ranges like "30+"
        minPrice = parseFloat(range[0].slice(0, -1));
        maxPrice = 10000; // Some high value
      }
    }
    
    const searchParams: SearchParams = {
      searchTerm: this.searchQuery,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.filterForm.value.sortBy || '',
      category: this.filterForm.value.category || '',
      minPrice : minPrice,
      maxPrice : maxPrice
    };
    
    if (minPrice > 0) {
      searchParams.minPrice = minPrice;
    }
    
    if (maxPrice > 0) {
      searchParams.maxPrice = maxPrice;
    }
    
    this.apiCall.postWithToken<ApiResponse>('Book/SearchBookByQuery', searchParams)
      .subscribe({
        next: (response) => {
          if (response.responseCode === 200) {
            // Update books in the service
          const books = response.responseData as Book[] || [];
          this.totalBooks = response.responseData.totalCount || 0;
        this.hasMorePages = this.totalBooks > (this.currentPage * this.pageSize);
          this.bookService.SetBooks(books);
          console.log('Search results:', books);
          this.loading = false;
          } else {
            this.toastr.error(response.errorMessages || 'Failed to search books', 'Error');
            this.bookService.SetBooks([]);
            this.loading = false;
          }
        },
        error: (error) => {
          this.toastr.error('Failed to search books', 'Error');
          this.loading = false;
          console.error('Error searching books:', error);
        }
      });
  }
  get filteredBooks(): Book[] {
    return this.books.filter(book =>
      book.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
   loadCategories() {
      this.apicall.getWithToken<ApiResponse>('Category/GetAllCategories').subscribe({
        next: (response: ApiResponse) => {
                  this.categories = response.responseData as Category[];
          console.log('Categories loaded:', this.categories);
        },
        error: (error) => {
          this.toastr.error('Failed to load categories', 'Error');
        }
      });
     
    }
      // Pagination methods
  goToPage(page: number): void {
    this.currentPage = page;
    this.searchBooks();
  }

  nextPage(): void {
    this.currentPage++;
    this.searchBooks();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchBooks();
    }
  }
   onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery.trim() },
        replaceUrl: true
      });
    } else {
      // Clear the search and reset to all books
      this.router.navigate(['/search']);
    }
  }

    
   
  }

