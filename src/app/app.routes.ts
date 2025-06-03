import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { BookDetailComponent } from './pages/book-detail/book-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { SearchResultComponent } from './pages/search-result/search-result.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AddBookComponent } from './pages/addbook/addbook.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { LandingComponent } from './pages/landing/landing.component';


export const routes: Routes = [
  { path: "", component:LandingComponent},
  { path: "landing", component: LandingComponent },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "home", component: HomeComponent },
  { path: "book/:id", component: BookDetailComponent },
  { path: "search", component: SearchResultComponent },
  { path: "cart", component: CartComponent },
  { path: "checkout", component: CheckoutComponent },
  { path: "Add-book", component: AddBookComponent },
  { path: "**", component: NotFoundComponent },
]

