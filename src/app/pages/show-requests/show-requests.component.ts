import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ApiCallService } from '../../Services/api-call.service';
import { ApiResponse,BookRequest } from '../../Interfaces/Book.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import Swal from 'sweetalert2'
import { 
  heroCheck, 
  heroXMark, 
  heroEye, 
  heroBookOpen, 
  heroDocumentText, 
  heroStar
} from '@ng-icons/heroicons/outline';



@Component({
  selector: 'app-show-requests',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './show-requests.component.html',
  styleUrls: ['./show-requests.component.scss'],
  viewProviders: [provideIcons({ 
    heroCheck, 
    heroXMark, 
    heroEye, 
    heroBookOpen, 
    heroDocumentText, 
    heroStar 
  })]
})
export class ShowRequestsComponent implements OnInit {
  bookRequests: BookRequest[] = [];
  loading: boolean = true;
  selectedRequest: BookRequest | null = null;
  showDetailModal: boolean = false;

  constructor(
    private apiCall: ApiCallService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBookRequests();
  }

  loadBookRequests(): void {
    this.loading = true;
    this.apiCall.getWithToken<ApiResponse>('Request/GetAllAddRequests').subscribe({
      next: (response: ApiResponse) => {
        if (response.responseCode === 200 && response.responseData) {
          this.bookRequests = response.responseData as BookRequest[];
          console.log('Book requests loaded:', this.bookRequests);
        } else {
          this.toastr.warning(response.responseMessage || 'No book requests available', 'Warning');
          this.bookRequests = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load book requests', 'Error');
        console.error('Error loading book requests:', error);
        this.bookRequests = [];
        this.loading = false;
      }
    });
  }
  ApproveWithConfirmation(requestId: number,text:string): void {
    Swal.fire({
  title: "Are you sure?",
  text: `Approve this book request ${text}?`,
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#43ae31",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, Approve it!"
}).then((result) => {
  if (result.isConfirmed) {
    Swal.fire({
      title: "Apprved!",
      text: "Your Request has been Approved.",
      icon: "success"
    });
    this.approveRequest(requestId);
  }

});
  }

  approveRequest(requestId: number): void {
    this.apiCall.postWithToken<ApiResponse>(`Request/ApproveAddRequest?id=${requestId}`, {}).subscribe({
      next: (response: ApiResponse) => {
        if (response.responseCode === 200) {
          this.toastr.success(response.responseMessage || 'Book request approved successfully', 'Success');
          this.loadBookRequests(); // Reload the list
        } else {
          this.toastr.error(response.errorMessages || 'Failed to approve book request', 'Error');
        }
      },
      error: (error) => {
        console.error('Error approving book request:', error);
        this.toastr.error('Failed to approve book request', 'Error');
      }
    });
  }

  rejectRequest(requestId: number): void {
    if (confirm('Are you sure you want to reject this book request?')) {
      this.apiCall.postWithToken<ApiResponse>(`Book/RejectBookRequest/${requestId}`, {}).subscribe({
        next: (response: ApiResponse) => {
          if (response.responseCode === 200) {
            this.toastr.success(response.responseMessage || 'Book request rejected', 'Success');
            this.loadBookRequests(); // Reload the list
          } else {
            this.toastr.error(response.errorMessages || 'Failed to reject book request', 'Error');
          }
        },
        error: (error) => {
          console.error('Error rejecting book request:', error);
          this.toastr.error('Failed to reject book request', 'Error');
        }
      });
    }
  }

  viewRequestDetails(request: BookRequest): void {
    this.selectedRequest = request;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedRequest = null;
  }

  // Helper function to truncate long text
  truncateText(text: string, maxLength: number = 100): string {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }

  // Generate star rating display
  getStarRating(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('full');
      } else if (i === fullStars && halfStar) {
        stars.push('half');
      } else {
        stars.push('empty');
      }
    }
    
    return stars;
  }
}