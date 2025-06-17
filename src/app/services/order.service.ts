import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CartItem } from '../models/cart-item.model'; // Assuming CartItem interface is here or adjust path
import { Product } from './product.service'; // Assuming Product interface is here or adjust path
import { User } from './auth.service'; // Assuming User interface is here or adjust path
import { map } from 'rxjs/operators';

export interface OrderItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface Order {
  id: string;
  userId: number; // Or string, depending on your User interface
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  orderDate: string;
  status: string;
  shippingAddress: any; // You might want to define a more specific interface for address
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadOrders();
    }
  }

  private loadOrders(): void {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      this.ordersSubject.next(JSON.parse(storedOrders));
    }
  }

  private saveOrders(orders: Order[]): void {
    if (this.isBrowser) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }

  placeOrder(cartItems: CartItem[], user: User, shippingAddress: any): Observable<Order> {
    // Simulate order placement logic
    const orderItems: OrderItem[] = cartItems.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price * (1 - item.product.discountPercentage / 100),
      quantity: item.quantity,
      thumbnail: item.product.thumbnail
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 5.00; // Fixed shipping cost for now
    const total = subtotal + shipping;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      items: orderItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      orderDate: new Date().toISOString(),
      status: 'Pending',
      shippingAddress: shippingAddress
    };

    const currentOrders = this.ordersSubject.value;
    const updatedOrders = [...currentOrders, newOrder];
    this.ordersSubject.next(updatedOrders);
    this.saveOrders(updatedOrders);

    return of(newOrder); // Return the newly placed order as an observable
  }

  getOrdersByUserId(userId: number): Observable<Order[]> {
    // In a real app, this would fetch from a backend
    return this.orders$.pipe(
      map((orders: Order[]) => orders.filter((order: Order) => order.userId === userId))
    );
  }

  getOrderById(orderId: string): Observable<Order | undefined> {
    return this.orders$.pipe(
      map((orders: Order[]) => orders.find((order: Order) => order.id === orderId))
    );
  }
} 