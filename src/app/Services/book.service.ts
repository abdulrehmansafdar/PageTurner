import { Injectable, signal, WritableSignal } from '@angular/core';
import { Book, Category } from '../Interfaces/Book.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private booksSignal = signal<Book[]>([]);
  private categoriesSignal = signal<Category[]>([]);

  get Books(): Book[] {
    return this.booksSignal();
  }

  get BooksSignal(): WritableSignal<Book[]> {
    return this.booksSignal;
  }

  get CategoriesSignal(): WritableSignal<Category[]> {
    return this.categoriesSignal;
  }

  SetBooks(books: Book[]): void {
    this.booksSignal.set(books);
  }

  SetCategories(categories: Category[]): void {
    this.categoriesSignal.set(categories);
  }
}
