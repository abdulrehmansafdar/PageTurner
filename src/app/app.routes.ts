import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { BookDetailComponent } from './pages/book-detail/book-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { SearchResultComponent } from './pages/search-result/search-result.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AddBookComponent } from './pages/addbook/addbook.component';


export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "book/:id", component: BookDetailComponent },
  { path: "search", component: SearchResultComponent },
  { path: "cart", component: CartComponent },
  { path: "checkout", component: CheckoutComponent },
  {path: "AddBook", component: AddBookComponent },
  { path: "**", component: NotFoundComponent },
  

]

