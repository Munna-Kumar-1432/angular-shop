import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { OrderService, Order } from '../../services/order.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  userOrders: Order[] = [];
  loading: boolean = true;
  error: string | null = null;

  private userSubscription: Subscription | undefined;
  private ordersSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadOrders(user.id);
      } else {
        this.userOrders = [];
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  private loadOrders(userId: number): void {
    this.loading = true;
    this.ordersSubscription = this.orderService.getOrdersByUserId(userId).subscribe({
      next: (orders) => {
        this.userOrders = orders;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }

  trackOrderBy(index: number, order: Order): string {
    return order.id;
  }
}
