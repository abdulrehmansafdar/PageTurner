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
    // Track when the API call started
    const startTime = Date.now();
    const minimumModalTime = 4000; // 4 seconds in milliseconds
    
    // Create a variable to store the response
    let apiResponse: any = null;
    let apiError: any = null;
    let apiCompleted = false;

    this.apicall.post<ApiResponse>(`User/verifyEmail?email=${email}`, null).subscribe({
      next: (response: ApiResponse) => {
        // Process the response but don't hide modal yet
        if (response.responseCode === 200) {
          this.verificationSuccess = true;
          this.responseMessage = 'Email verified successfully!';
        } else {
          this.verificationSuccess = false;
          this.responseMessage = response.errorMessages || 'Email verification failed';
        }
        
        // Store that we got a response
        apiResponse = response;
        apiCompleted = true;
        
        // Calculate how long the API call took
        const elapsedTime = Date.now() - startTime;
        
        // If less than minimum time, wait before closing modal
        if (elapsedTime < minimumModalTime) {
          const remainingTime = minimumModalTime - elapsedTime;
          setTimeout(() => this.completeVerification(), remainingTime);
        } else {
          // If already displayed for minimum time, complete immediately
          this.completeVerification();
        }
      },
      error: (error) => {
        // Handle error but don't hide modal yet
        this.verificationSuccess = false;
        this.responseMessage = error.message || 'An error occurred during email verification';
        this.errorMessage = this.responseMessage;
        
        // Store that we got an error
        apiError = error;
        apiCompleted = true;
        
        // Calculate how long the API call took
        const elapsedTime = Date.now() - startTime;
        
        // If less than minimum time, wait before closing modal
        if (elapsedTime < minimumModalTime) {
          const remainingTime = minimumModalTime - elapsedTime;
          setTimeout(() => this.completeVerification(), remainingTime);
        } else {
          // If already displayed for minimum time, complete immediately
          this.completeVerification();
        }
      }
    });
  }

  // New method to handle completion of verification process
  completeVerification(): void {
    // Close the modal
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
        // this.navigateToLogin();
      }
    }, 3000);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}