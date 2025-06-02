import { Component } from '@angular/core';
import { Book } from '../../Interfaces/Book.model';
import { BookService } from '../../Services/book.service';
import { BookCardComponent } from '../book-card/book-card.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BookCardComponent,CommonModule,RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
featuredBooks: Book[] = []

  categories = [
    { name: "Fiction", icon: "📚", count: 245 },
    { name: "Non-Fiction", icon: "📖", count: 189 },
    { name: "Science Fiction", icon: "🚀", count: 156 },
    { name: "Romance", icon: "💕", count: 203 },
    { name: "Mystery", icon: "🔍", count: 134 },
    { name: "Biography", icon: "👤", count: 98 },
  ]
  constructor(private bookService: BookService) {}
  ngOnInit(): void {
    // this.bookService.getFeaturedBooks().subscribe((books) => {
    //   this.featuredBooks = books
    // })
  }
}
