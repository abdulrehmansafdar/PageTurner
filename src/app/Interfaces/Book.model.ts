export interface Book {
  id: number
  title: string
  author: string
  description: string
  isbn: string
  price: number
  imageUrl: string
  category: string
  rating: number
  reviews: number
  pages: number
  publisher: string
  publishedDate: string
}

export interface CartItem {
  book: Book
  quantity: number
}
export interface CartFromApi
{
  id:number,
  userId:number,
  bookId:number,
  quantity:number
}

export interface ShippingDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Response {
  type: ResponseType,
  message: string
  Code: number

}
export enum ResponseType {
  Success,
  Error,
  Warning,
  Info
}
export interface ApiResponse {
  responseCode: number;
  responseMessage?: string;
  responseData?:any
  errorMessages?: string
}
export interface Category {
  id: number
  Name: string,
  Description: string
}
export interface User {
  username: string;
  email: string;
  Role: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: any;
}
export interface BookRequest {
  id: number;
  title: string;
  Author: string;
  ImageUrl: string;
  ISBN: string;
  Category: string;
  Description: string;
  Price: number;
  Rating: number;
  Reviews: number;
  Pages: number;
  requestDate?: string;
  status?: string;
}

export interface SearchParams {
  searchTerm: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}
