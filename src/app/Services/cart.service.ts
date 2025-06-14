import { Injectable, WritableSignal, signal } from '@angular/core';
import { CartItem } from '../Interfaces/Book.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartitems: WritableSignal<CartItem[]> = signal([]);
  totalPrice: WritableSignal<number> = signal(0);
  totalItems: WritableSignal<number> = signal(0);
  Setcartitems(cartItems: CartItem[]): void {
    this.cartitems.set(cartItems);
    this.calculateTotal();
    this.updateTotalItemsCount();

  }
  SetTotalItems(totalItems: number): void {
    this.totalItems.set(totalItems);
  }
  calculateTotal(): void {
    const items = this.cartitems();
    const total = items.reduce((acc, item) => acc + (item.book.price * item.quantity), 0);
    this.totalPrice.set(total);
  
  }
addToCart(item: CartItem): void {
  const currentItems = this.cartitems();
  const existingItemIndex = currentItems.findIndex(i => i.book.id === item.book.id);
  
  if (existingItemIndex > -1) {
    currentItems[existingItemIndex].quantity += item.quantity;
  } else {
    currentItems.push(item);
  }
  
  this.Setcartitems(currentItems);
  // Update total items count after adding
  this.updateTotalItemsCount();
}
updateQuantity(bookId: number, quantity: number): void {
  const currentItems = this.cartitems();
  const itemIndex = currentItems.findIndex(item => item.book.id === bookId);
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.removeFromCart(bookId);
    } else {
      currentItems[itemIndex].quantity = quantity;
      this.Setcartitems(currentItems);
      // Update total items count after changing quantity
      this.updateTotalItemsCount();
    }
  }
}

removeFromCart(bookId: number): void {
  const currentItems = this.cartitems();
  const updatedItems = currentItems.filter(item => item.book.id !== bookId);
  this.Setcartitems(updatedItems);
  // Update total items count after removing
  this.updateTotalItemsCount();
}

clearCart(): void {
  this.Setcartitems([]);
  // Reset total items count when clearing
  this.SetTotalItems(0);
}

// New helper method to update the total items count
public updateTotalItemsCount(): void {
  const items = this.cartitems();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  this.SetTotalItems(totalItems);
}



  constructor() {

   }
}
