import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiCallService } from '../../Services/api-call.service';
import { ApiResponse } from '../../Interfaces/Book.model';
import { interval, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  isVerifying = false;
  verificationSuccess = false;
  errorMessage = '';
  email = '';
  
  // Modal state variables
  showModal = false;
  timerCount = 10;
  timerSubscription?: Subscription;
  
  // Response display variables
  showResponse = false;
  responseMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apicall: ApiCallService
  ) {}

  ngOnInit(): void {
    // Get email from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      
      if (this.email) {
        this.startVerification(this.email);
      } else {
        this.errorMessage = 'Missing email parameter';
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startVerification(email: string): void {
    // Show the modal with countdown
    this.showModal = true;
    this.isVerifying = true;
    
    // Start the 10-second countdown
    this.startCountdown();
    
    // Send the verification request
    this.verifyEmail(email);
  }
  
  startCountdown(): void {
    this.timerCount = 10;
    
    // Use interval to update the counter every second
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timerCount--;
      
      if (this.timerCount <= 0) {
        this.timerSubscription?.unsubscribe();
        this.showModal = false;
      }
    });
  }

  verifyEmail(email: string): void {
    this.apicall.post<ApiResponse>(`User/verifyEmail?email=${email}`, null).subscribe({
      next: (response: ApiResponse) => {
        // Process the response
        if (response.responseCode === 200) {
          this.verificationSuccess = true;
          this.responseMessage = 'Email verified successfully!';
        } else {
          this.verificationSuccess = false;
          this.responseMessage = response.errorMessages || 'Email verification failed';
        }
        
        // Close modal after response received
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
        
        // Hide modal and show response
        this.showModal = false;
        this.isVerifying = false;
        this.showResponse = true;
        
        // Set timeout to hide response after 3 seconds
        setTimeout(() => {
          this.showResponse = false;
          
          // Navigate to login if successful
          if (this.verificationSuccess) {
            this.navigateToLogin();
          }
        }, 3000);
      },
      error: (error) => {
        // Handle error
        this.verificationSuccess = false;
        this.responseMessage = error.message || 'An error occurred during email verification';
        
        // Close modal after error
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
        
        // Hide modal and show error response
        this.showModal = false;
        this.isVerifying = false;
        this.errorMessage = this.responseMessage;
        this.showResponse = true;
        
        // Set timeout to hide response after 3 seconds
        setTimeout(() => {
          this.showResponse = false;
        }, 3000);
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}