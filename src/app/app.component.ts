import { Component, OnInit, OnDestroy,PLATFORM_ID,Inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule,isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoginComponent } from "./components/login/login.component";
import { HomeComponent } from "./components/home/home.component";
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './Services/auth.service';
import { LoaderComponent } from "./components/loader/loader.component";
import { LoaderService } from './Services/loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, RouterModule, CommonModule, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'bookstore_frontend';
  hideHeaderFooter = false;
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService,
    private loader: LoaderService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
this.loader.show(); 
    this.subscription = this.authService.hideHeaderFooter$.subscribe(
      (hide: boolean) => {
        this.hideHeaderFooter = hide;
      }
    );
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('load', () => {
  console.log('Page is fully loaded');
  setTimeout(() => {
    this.loader.hide();
  }
, 1500); 
  
});
    }
   
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
