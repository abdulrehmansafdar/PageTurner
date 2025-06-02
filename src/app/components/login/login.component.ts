import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiCallService } from '../../Services/api-call.service';
import { ApiResponse } from '../../Interfaces/Book.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup
  isLoading = false
  error: string | null = null
  success: string | null = null
  showPassword = false
  returnUrl = "/"

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private apicall: ApiCallService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
      rememberMe: [false],
    })
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/"

    // Redirect if already logged in
    if (this.isLoggedIn()) {
      this.router.navigate([this.returnUrl])
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.error = "Please fill in all required fields correctly."
      return
    }

    this.isLoading = true
    this.error = null
    this.success = null

    const { name, password } = this.loginForm.value

    this.apicall.post<ApiResponse>('User/login', { name, password }).subscribe({
      next: (response: ApiResponse) => {
        if (response.responseCode === 200) {
          // Store token in localStorage
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("token", response.responseData.token);
          }
          this.success = "Login successful! Redirecting..."
          setTimeout(() => {
            this.router.navigate([this.returnUrl])
          }, 1200)
        } else {
          this.error = response.errorMessages || "Login failed. Please check your credentials."
        }
        this.isLoading = false
      },
      error: (err: any) => {
        this.error = err.error?.errorMessages || err.message || "An error occurred during login"
        this.isLoading = false
      },
    })
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem("token");
      return !!token; 
    }
    return false;
  }
}
