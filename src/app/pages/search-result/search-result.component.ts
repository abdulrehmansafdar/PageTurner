import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../../Interfaces/Book.model';

import { BookCardComponent } from '../../components/book-card/book-card.component';
import { CommonModule } from '@angular/common';
import { BookService } from '../../Services/book.service';

@Component({
  selector: 'app-search-result',
  imports: [BookCardComponent,CommonModule],
  templateUrl: './search-result.component.html',
  styleUrl: './search-result.component.scss'
})
export class SearchResultComponent implements OnInit {
  books: Book[] = []
  searchQuery = ""

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params["q"] || ""
      this.performSearch()
    })
  }

  private performSearch(): void {
   
  }
}
