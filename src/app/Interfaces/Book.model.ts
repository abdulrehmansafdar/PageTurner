export interface Book {
  id: number
  Title: string
  Author: string
  Description: string
  ISBN: string
  Price: number
  ImageUrl: string
  Category: string
  Rating: number
  Reviews: number
  Pages: number
  Publisher: string
  PublishedDate: string
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
  name: string,
  description: string
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