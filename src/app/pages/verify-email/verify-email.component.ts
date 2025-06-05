import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiCallService } from '../../Services/api-call.service';
import { ApiResponse } from '../../Interfaces/Book.model';
// import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  isVerifying = true;
  verificationSuccess = false;
  errorMessage = '';
  email = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apicall : ApiCallService
  ) {}

  ngOnInit(): void {
    // Get email from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      
      if (this.email ) {
        this.verifyEmail(this.email);
      } else {
        this.isVerifying = false;
        this.errorMessage = 'Missing email or verification token';
      }
    });
  }

  verifyEmail(email: string): void {
    this.apicall.post<ApiResponse>(`User/verifyEmail?email=${email}`, null).subscribe({
      next: (response: ApiResponse) => {
        this.isVerifying = false;
        if (response.responseCode === 200) {
          this.verificationSuccess = true;
          this.navigateToLogin();
        } else {
          this.errorMessage = response.errorMessages || 'Email verification failed';
        }
      },
      error: (error) => {
        this.isVerifying = false;
        this.errorMessage = error.message || 'An error occurred during email verification';
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}