import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiCallService } from '../../Services/api-call.service';
import { ApiResponse } from '../../Interfaces/Book.model';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule,RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private apicall: ApiCallService
  ) {
    this.signupForm = this.fb.group({
      UserName: ['', [Validators.required, Validators.minLength(2)]],
      UserEmail: ['', [Validators.required, Validators.email]],
      UserPassword: ['', [Validators.required, Validators.minLength(8), this.passwordValidator]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.isLoggedIn()) {
      this.router.navigate(['/home']);
    }

    // Monitor password strength
    this.signupForm.get('password')?.valueChanges.subscribe(password => {
      this.passwordStrength = this.calculatePasswordStrength(password);
    });
  }

  passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.value;
    if (!password) return null;

    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[#?!@$%^&*-]/.test(password);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial;
    return valid ? null : { passwordStrength: true };
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.get('UserPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[#?!@$%^&*-]/.test(password)) strength += 12.5;
    return Math.min(100, strength);
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 30) return 'bg-red-500';
    if (this.passwordStrength < 60) return 'bg-yellow-500';
    if (this.passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength < 30) return 'Weak';
    if (this.passwordStrength < 60) return 'Fair';
    if (this.passwordStrength < 80) return 'Good';
    return 'Strong';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.markFormGroupTouched();
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    const { UserName, UserEmail, UserPassword } = this.signupForm.value;
    const userData = {
      UserName,
      UserEmail,
      UserPassword
    };

    this.apicall.post<ApiResponse>('User/register', userData).subscribe({
      next: (response: ApiResponse) => {
        if (response.responseCode === 200) {
          this.success = 'Account created successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = response.errorMessages || 'Registration failed. Please try again.';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err.error?.errorMessages || err.message || 'An error occurred during registration';
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  }
}
