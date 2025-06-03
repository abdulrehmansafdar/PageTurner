import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiCallService } from '../../Services/api-call.service';
import { ApiResponse, User } from '../../Interfaces/Book.model';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { LoaderService } from '../../Services/loader.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule,ToastrModule],
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
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private loader:LoaderService
  ) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required, Validators.minLength(2)]],
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
    this.loader.show()
    if (this.loginForm.invalid) {
      this.error = "Please fill in all required fields correctly."
      this.toastr.error(this.error, "Validation Error");
      return
    }

    this.isLoading = true
    this.error = null
    this.success = null

    const { username, password } = this.loginForm.value
    const payload = {
      username: username.trim(),
      password: password.trim()
    }

    this.apicall.post<ApiResponse>('User/login', payload).subscribe({
      
      next: (response: ApiResponse) => {
        debugger
        if (response.responseCode === 200) {
          // Store token in localStorage
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("token", response.responseData.token);
          }
          // Set user data in AuthService
          const user :User = {
            username: response.responseData.username,
            email: response.responseData.email,
            Role : response.responseData.role || "User"
          };
          this.authService.setUser(user);
          if (isPlatformBrowser(this.platformId)){
            localStorage.setItem("username", user.username);
            localStorage.setItem("email", user.email);
            localStorage.setItem("Role", user.Role);
          }
          this.success = "Login successful! Redirecting..."
          this.toastr.success(this.success, "Login Success");
          setTimeout(() => {
            this.router.navigate(["/home"]);
          }, 2000);
          
          
        } else {
          this.error = response.errorMessages || "Login failed. Please check your credentials."
          this.toastr.error(this.error, "Login Error");
        }
        this.isLoading = false
        this.loader.hide();
      },
      error: (err: any) => {
        this.error = err.error?.errorMessages || err.message || "An error occurred during login"
        this.toastr.error("Error occurred, please try again", "Login Error");
        this.isLoading = false
        this.loader.hide();
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
