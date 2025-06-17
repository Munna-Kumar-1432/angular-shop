import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService, User } from '../../services/auth.service';
import { CartItem } from '../../models/cart-item.model';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  loading: boolean = false;
  error: string | null = null;
  Math = Math;
  private cartSubscription: Subscription | undefined;
  subtotal: number = 0;
  shipping: number = 10;
  total: number = 0;
  isSubmitting: boolean = false;
  currentUser: User | null = null;
  private userSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      firstName: ['John', [Validators.required]],
      lastName: ['Doe', [Validators.required]],
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      phone: ['1234567890', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['123 Main Street', [Validators.required]],
      city: ['New York', [Validators.required]],
      state: ['NY', [Validators.required]],
      zipCode: ['10001', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
      cardNumber: ['4111111111111111', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cardName: ['JOHN DOE', [Validators.required]],
      expiryDate: ['12/25', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/([0-9]{2})$')]],
      cvv: ['123', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]]
    });
  }

  ngOnInit() {
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
      this.calculateTotals();
    });

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.checkoutForm.patchValue({
          firstName: user.name.split(' ')[0] || 'John',
          lastName: user.name.split(' ')[1] || 'Doe',
          email: user.email
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  getDiscountedPrice(product: any): number {
    if (product.discountPercentage) {
      return product.price * (1 - product.discountPercentage / 100);
    }
    return product.price;
  }

  calculateTotals() {
    this.subtotal = this.cartItems.reduce((total, item) => {
      const discountedPrice = this.getDiscountedPrice(item.product) * item.quantity;
      return total + discountedPrice;
    }, 0);
    this.total = this.subtotal + this.shipping;
  }

  onSubmit() {
    if (this.checkoutForm.valid && this.currentUser) {
      this.isSubmitting = true;
      this.loading = true;
      this.error = null;

      const shippingAddress = {
        address: this.checkoutForm.value.address,
        city: this.checkoutForm.value.city,
        state: this.checkoutForm.value.state,
        zipCode: this.checkoutForm.value.zipCode
      };

      this.orderService.placeOrder(this.cartItems, this.currentUser, shippingAddress)
        .pipe(take(1))
        .subscribe({
          next: (order) => {
            console.log('Order placed successfully:', order);
            this.cartService.clearCart();
            this.router.navigate(['/order-success']);
          },
          error: (err) => {
            console.error('Error placing order:', err);
            this.error = 'Failed to place order. Please try again.';
            this.isSubmitting = false;
            this.loading = false;
          },
          complete: () => {
            this.isSubmitting = false;
            this.loading = false;
          }
        });
    } else {
      this.markFormGroupTouched(this.checkoutForm);
      if (!this.currentUser) {
        this.error = 'Please log in to place an order.';
      }
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.checkoutForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('pattern')) {
      switch (controlName) {
        case 'phone':
          return 'Please enter a valid 10-digit phone number';
        case 'zipCode':
          return 'Please enter a valid 5-digit ZIP code';
        case 'cardNumber':
          return 'Please enter a valid 16-digit card number';
        case 'expiryDate':
          return 'Please enter a valid expiry date (MM/YY)';
        case 'cvv':
          return 'Please enter a valid CVV';
        default:
          return 'Invalid format';
      }
    }
    return '';
  }
} 