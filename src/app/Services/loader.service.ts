import { Injectable, signal, WritableSignal } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
 
   loading:WritableSignal<Boolean> = signal(false); 

  constructor(private spinner: NgxSpinnerService) {}

  show() {
    this.loading.set(true);
  }

  hide() {
    this.loading.set(false);
  }
}