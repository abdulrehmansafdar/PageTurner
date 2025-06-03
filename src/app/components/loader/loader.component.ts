import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoaderService } from '../../Services/loader.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  
  constructor(
    private spinner: NgxSpinnerService,
    private loaderService: LoaderService
  ) {
    effect(()=>
    {
       if (this.loaderService.loading() ===true) {
      this.spinner.show()
    }
    else if (this.loaderService.loading() ===false) {
      this.spinner.hide();
    }
    }
    );
  }

  ngOnInit(): void {
    if (this.loaderService.loading() ===true) {
      this.spinner.show()
    }
    else if (this.loaderService.loading() ===false) {
      this.spinner.hide();
    }
  }

  ngOnDestroy(): void {
    
  }
}