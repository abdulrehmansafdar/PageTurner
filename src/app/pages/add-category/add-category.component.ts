import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../Interfaces/Book.model';
import { ApiCallService } from '../../Services/api-call.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  categoryForm!: FormGroup;
  isSubmitting = false;
  categories: any[] = [];
  isEditMode = false;
  editingCategoryId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private apiCall: ApiCallService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  // Getter for easy access to form fields
  get f() { return this.categoryForm.controls; }

  loadCategories() {
    this.apiCall.getWithToken<ApiResponse>('Category/GetAllCategories').subscribe({
      next: (response: ApiResponse) => {
        if (response.responseCode === 200 && response.responseData) {
          this.categories = response.responseData;
          console.log('Categories loaded:', this.categories);
        } else {
          this.toastr.warning(response.responseMessage || 'No categories available', 'Warning');
          this.categories = [];
        }
      },
      error: (error) => {
        this.toastr.error('Failed to load categories', 'Error');
        console.error('Error loading categories:', error);
        this.categories = [];
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.categoryForm.controls).forEach(key => {
        const control = this.categoryForm.get(key);
        control?.markAsTouched();
      });
      this.toastr.warning('Please correct the form errors', 'Form Invalid');
      return;
    }
    
    this.isSubmitting = true;
    
    // Prepare category data
    const categoryData = {
      ...this.categoryForm.value,
      // Convert name to Title Case
      name: this.toTitleCase(this.categoryForm.value.name)
    };

    if (this.isEditMode && this.editingCategoryId) {
      // Update existing category
      this.updateCategory(this.editingCategoryId, categoryData);
    } else {
      // Add new category
      this.addCategory(categoryData);
    }
  }

  addCategory(categoryData: any): void {
    this.apiCall.postWithToken<ApiResponse>('Category/AddCategory', categoryData).subscribe({
      next: (response: ApiResponse) => {
        if (response.responseCode === 200) {
          this.toastr.success(response.responseMessage || 'Category added successfully', 'Success');
          this.resetForm();
          this.loadCategories(); // Reload the categories list
        } else {
          this.toastr.error(response.errorMessages || 'Failed to add category', 'Error');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 400) {
          this.toastr.error('Invalid data provided', 'Error');
        } else {
          this.toastr.error('Failed to add category', 'Error');
        }
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  updateCategory(id: number, categoryData: any): void {
    const cat =
    {
      name: categoryData.name,
      description: categoryData.description
    }
    this.apiCall.postWithToken<ApiResponse>(`Category/UpdateCategory?id=${id}`, cat).subscribe({
      next: (response: ApiResponse) => {
        if (response.responseCode === 200) {
          this.toastr.success(response.responseMessage || 'Category updated successfully', 'Success');
          this.resetForm();
          this.loadCategories(); // Reload the categories list
          this.isEditMode = false;
          this.editingCategoryId = null;
        } else {
          this.toastr.error(response.errorMessages || 'Failed to update category', 'Error');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        if (error.status === 400) {
          this.toastr.error('Invalid data provided', 'Error');
        } else {
          this.toastr.error('Failed to update category', 'Error');
        }
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  editCategory(category: any): void {
    this.isEditMode = true;
    this.editingCategoryId = category.id;
    this.categoryForm.patchValue({
      name: category.Name,
      description: category.Description
    });
  }

  deleteCategory(id: number): void {
   
      this.apiCall.postWithToken<ApiResponse>(`Category/DeleteCategory?id=${id}`,null).subscribe({
        next: (response: ApiResponse) => {
          if (response.responseCode === 200) {
            this.toastr.success(response.responseMessage || 'Category deleted successfully', 'Success');
            this.loadCategories(); // Reload the categories list
          } else {
            this.toastr.error(response.errorMessages || 'Failed to delete category', 'Error');
          }
        },
        error: (error) => {
          if (error.status === 400) {
            this.toastr.error('Cannot delete this category', 'Error');
          } else {
            this.toastr.error('Failed to delete category', 'Error');
          }
        }
      });
    }
  
  DeleteWithConfirmation(id: number): void {
    Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: "Deleted!",
      text: "Your file has been deleted.",
      icon: "success"
    });
    this.deleteCategory(id);
  }
});
  }

  resetForm(): void {
    this.categoryForm.reset();
    this.isEditMode = false;
    this.editingCategoryId = null;
    this.initForm(); // Re-initialize with default values
  }

  cancelEdit(): void {
    this.resetForm();
  }

  // Helper function to convert a string to Title Case
  private toTitleCase(str: string): string {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
}