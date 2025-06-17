import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ReviewService, Review } from '../../services/review.service';
import { AuthService, User } from '../../services/auth.service';
import { CartItem } from '../../models/cart-item.model';
import { Subscription, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-details.component.html'
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product: Product | undefined;
  loading: boolean = true;
  error: string | null = null;
  selectedImage: string = '';
  quantity: number = 1;
  cartQuantity: number = 0;
  Math = Math;
  reviews: Review[] = [];
  averageRating: number = 0;
  currentRating: number = 0;
  reviewForm: FormGroup;
  userReview: Review | null = null;
  isLoggedIn: boolean = false;
  currentUser: User | null = null;

  private cartSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;
  private reviewsSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    const productIdParam = this.route.snapshot.paramMap.get('id');
    if (productIdParam) {
      const productId = parseInt(productIdParam);
      this.loadProduct(productId);
      this.loadReviewsAndRating(productId);
    }

    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      if (this.product) {
        const cartItem = items.find(item => item.product.id === this.product?.id);
        this.cartQuantity = cartItem ? cartItem.quantity : 0;
      }
    });

    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.reviewsSubscription) {
      this.reviewsSubscription.unsubscribe();
    }
  }

  loadProduct(id: number) {
    this.loading = true;
    this.error = null;

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedImage = product.thumbnail;
        this.loading = false;
        this.cartService.getCartItems().subscribe(items => {
          const cartItem = items.find(item => item.product.id === product.id);
          this.cartQuantity = cartItem ? cartItem.quantity : 0;
        });
      },
      error: (error) => {
        this.error = 'Failed to load product details. Please try again later.';
        this.loading = false;
        console.error('Error loading product:', error);
      }
    });
  }

  loadReviewsAndRating(productId: number): void {
    this.reviewsSubscription = this.reviewService.getReviewsByProductId(productId).subscribe(reviews => {
      this.reviews = reviews;
      this.reviewService.getAverageRating(productId).subscribe(avg => {
        this.averageRating = avg;
      });
      this.checkUserReview(reviews);
    });
  }

  checkUserReview(reviews: Review[]): void {
    if (this.currentUser) {
      this.userReview = reviews.find(review => review.userId === this.currentUser?.id) || null;
      if (this.userReview) {
        this.reviewForm.patchValue({
          rating: this.userReview.rating,
          comment: this.userReview.comment
        });
        this.currentRating = this.userReview.rating; // Set current rating for display
      }
    }
  }

  setRating(star: number): void {
    this.currentRating = star;
    this.reviewForm.controls['rating'].setValue(star);
  }

  submitReview(): void {
    if (!this.isLoggedIn || !this.currentUser || !this.product) {
      // Redirect to login or show a message
      console.log('Please log in to submit a review.');
      return;
    }

    const product = this.product;
    const currentUser = this.currentUser;

    if (this.reviewForm.valid) {
      const { rating, comment } = this.reviewForm.value;
      this.reviewService.submitReview(product.id, currentUser.id, currentUser.name, rating, comment)
        .subscribe({
          next: (review) => {
            console.log('Review submitted:', review);
            this.reviewForm.reset({
              rating: 0,
              comment: ''
            });
            this.currentRating = 0; // Reset stars
            this.loadReviewsAndRating(product.id); // Reload reviews to update list
          },
          error: (err) => {
            console.error('Error submitting review:', err);
            // Display error message to user
          }
        });
    } else {
      // Mark form fields as touched to display validation errors
      this.markFormGroupTouched(this.reviewForm);
    }
  }

  changeImage(image: string) {
    this.selectedImage = image;
  }

  getDiscountedPrice(): number {
    if (this.product?.discountPercentage) {
      return this.product.price * (1 - this.product.discountPercentage / 100);
    }
    return this.product?.price || 0;
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
      this.updateCart();
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateCart();
    }
  }

  updateCart() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
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
} 
