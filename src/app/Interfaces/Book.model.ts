export interface Book {
  id: string
  title: string
  author: string
  description: string
  isbn: string
  price: number
  coverImage: string
  category: string
  rating: number
  reviews: number
  pages: number
  publisher: string
  publishDate: string
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
  name: string
}