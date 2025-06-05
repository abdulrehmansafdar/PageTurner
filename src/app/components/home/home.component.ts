import { Component } from '@angular/core';
import { ApiResponse, Book, Category } from '../../Interfaces/Book.model';
import { BookService } from '../../Services/book.service';
import { BookCardComponent } from '../book-card/book-card.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiCallService } from '../../Services/api-call.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BookCardComponent,CommonModule,RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {


  constructor(private bookService: BookService,private apicall :ApiCallService) {}
   ngOnInit(): void {
    this.loadALLBooks();
    this.loadCategories();
  }
    get books(): Book[] {
    return this.bookService.BooksSignal();
    }
    get categories():Category[]{
    return this.bookService.CategoriesSignal();
    }
    categoriesH = [
    { name: "Fiction", icon: "📚", count: 245 },
    { name: "Non-Fiction", icon: "📖", count: 189 },
    { name: "Science Fiction", icon: "🚀", count: 156 },
    { name: "Romance", icon: "💕", count: 203 },
    { name: "Mystery", icon: "🔍", count: 134 },
    { name: "Biography", icon: "👤", count: 98 },
  ]
  loadALLBooks(): void {
    debugger
    this.apicall.getWithToken<Book[]>("Book").subscribe({
      next: (response) => {
        debugger
        this.bookService.SetBooks(response)},
      error: (err) => console.error("Failed to fetch books:", err)
    });
  }

  loadCategories(): void {
    this.apicall.getWithToken<ApiResponse>("Book/GetCategories").subscribe({
      next: (response) => this.bookService.SetCategories(response.responseData),
      error: (err) => console.error("Failed to fetch categories:", err)
    });
  }
}
