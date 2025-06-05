// filepath: d:\Abdul Rehman\bookstore_frontend\src\app\pages\add-book\add-book.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService } from '../../Services/book.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiResponse, Category } from '../../Interfaces/Book.model';
import { isPlatformBrowser } from '@angular/common';
import { ApiCallService } from '../../Services/api-call.service';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addbook.component.html',
  styleUrls: ['./addbook.component.scss']
})
export class AddBookComponent implements OnInit {
  bookForm!: FormGroup;
  imagePreview: string | null = null;
  isSubmitting = false;
  private isBrowser: boolean;

  categories: Category[] = [];

   constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router: Router,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private apicall: ApiCallService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  ngOnInit(): void {
    debugger
    this.initForm();
    this.loadCategories();
  }
  loadCategories() {
    this.apicall.getWithToken<ApiResponse>('Category/GetAllCategories').subscribe({
      next: (response: ApiResponse) => {
                this.categories = response.responseData as Category[];
        console.log('Categories loaded:', this.categories);
      },
      error: (error) => {
        this.toastr.error('Failed to load categories', 'Error');
      }
    });
   
  }

  initForm(): void {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(50)]],
      isbn: ['', [Validators.required, Validators.pattern(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)]],
      imageUrl: [''],
      price: [null, [Validators.required, Validators.min(0.01)]],
      categoryId: [null, [Validators.required]],
      rating: [0, [Validators.min(0), Validators.max(5)]],
      reviews: [0, [Validators.min(0)]],
      pages: [null, [Validators.min(1)]],
      publisher: [''],
      publishedDate: [new Date().toISOString().split('T')[0]]
    });
  }

  // Getter for easy access to form fields
  get f() { return this.bookForm.controls; }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // File type validation
      if (!file.type.includes('image/')) {
        this.toastr.error('Please select an image file', 'Invalid File');
        return;
      }
      
      // File size validation (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('Image size should not exceed 5MB', 'File Too Large');
        return;
      }
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.bookForm.patchValue({
          imageUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.bookForm.controls).forEach(key => {
        const control = this.bookForm.get(key);
        control?.markAsTouched();
      });
      this.toastr.warning('Please correct the form errors', 'Form Invalid');
      return;
    }
    
    if (!this.imagePreview) {
      this.toastr.warning('Please upload a book cover image', 'Image Required');
      return;
    }
    
    this.isSubmitting = true;
    
    // Prepare book data
    const bookData = {
      ...this.bookForm.value,
      // The base64 image string is already in the form value (imageUrl field)
    };
    this.apicall.postWithToken<ApiResponse>('Book/AddBook', bookData).subscribe({
      next: (response: ApiResponse) => {
        debugger
        if (response.responseCode === 200) {
          this.toastr.success(response.responseMessage, 'Success');
          this.resetForm();
          this.router.navigate(['/home']);
        } else {
          this.toastr.error(response.errorMessages || 'Failed to add book', 'Error');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 400) {
          this.toastr.error('Invalid data provided', 'Error');
        } else {
          this.toastr.error('Failed to add book', 'Error');
        }
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

    resetForm(): void {
    this.bookForm.reset();
    this.imagePreview = null;
    this.initForm(); // Re-initialize with default values
    
    // Reset file input only if in browser environment
    if (this.isBrowser) {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }
}