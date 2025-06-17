import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private cartSubscription: Subscription | undefined;
  Math = Math;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    // Subscribe to cart updates
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      console.log('Cart items updated:', items); // Debug log
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  getDiscountedPrice(product: any): number {
    if (product.discountPercentage) {
      return product.price * (1 - product.discountPercentage / 100);
    }
    return product.price;
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity > 0 && newQuantity <= item.product.stock) {
      this.cartService.updateQuantity(item.product.id, newQuantity);
    }
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.product.id);
  }

  get subtotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (this.getDiscountedPrice(item.product) * item.quantity);
    }, 0);
  }

  get shipping(): number {
    return this.cartItems.length > 0 ? 10 : 0;
  }

  get total(): number {
    return this.subtotal + this.shipping;
  }

  checkout() {
    console.log('Navigating to checkout...'); // Debug log
    this.router.navigate(['/checkout']).then(() => {
      console.log('Navigation completed'); // Debug log
    }).catch(error => {
      console.error('Navigation failed:', error); // Debug log
    });
  }
} 