import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { map } from 'rxjs/operators';

export interface Review {
  id: string;
  productId: number;
  userId: number; // Or string, depending on your User interface
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  reviews$ = this.reviewsSubject.asObservable();

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadReviews();
    }
  }

  private loadReviews(): void {
    const storedReviews = localStorage.getItem('productReviews');
    if (storedReviews) {
      this.reviewsSubject.next(JSON.parse(storedReviews));
    }
  }

  private saveReviews(reviews: Review[]): void {
    if (this.isBrowser) {
      localStorage.setItem('productReviews', JSON.stringify(reviews));
    }
  }

  submitReview(productId: number, userId: number, userName: string, rating: number, comment: string): Observable<Review> {
    const newReview: Review = {
      id: `REV-${Date.now()}`,
      productId,
      userId,
      userName,
      rating,
      comment,
      date: new Date().toISOString()
    };

    const currentReviews = this.reviewsSubject.value;
    const updatedReviews = [...currentReviews, newReview];
    this.reviewsSubject.next(updatedReviews);
    this.saveReviews(updatedReviews);

    return of(newReview);
  }

  getReviewsByProductId(productId: number): Observable<Review[]> {
    return this.reviews$.pipe(
      map(reviews => reviews.filter(review => review.productId === productId))
    );
  }

  getAverageRating(productId: number): Observable<number> {
    return this.reviews$.pipe(
      map(reviews => {
        const productReviews = reviews.filter(review => review.productId === productId);
        if (productReviews.length === 0) {
          return 0;
        }
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        return parseFloat((totalRating / productReviews.length).toFixed(1));
      })
    );
  }
} 