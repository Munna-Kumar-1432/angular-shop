import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Product } from './product.service'; // Assuming Product interface is available
import { map } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private toastService: ToastService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadWishlist();
    }
  }

  private loadWishlist(): void {
    const storedWishlist = localStorage.getItem('wishlist');
    if (storedWishlist) {
      this.wishlistSubject.next(JSON.parse(storedWishlist));
    }
  }

  private saveWishlist(wishlist: Product[]): void {
    if (this.isBrowser) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }

  addToWishlist(product: Product): void {
    const currentWishlist = this.wishlistSubject.value;
    if (!currentWishlist.some(item => item.id === product.id)) {
      const updatedWishlist = [...currentWishlist, product];
      this.wishlistSubject.next(updatedWishlist);
      this.saveWishlist(updatedWishlist);
      this.toastService.success('Added to wishlist!');
      console.log('Toast success called: Added to wishlist!');
    } else {
      console.log('Product already in wishlist, no action taken.');
    }
  }

  removeFromWishlist(productId: number): void {
    const currentWishlist = this.wishlistSubject.value;
    const updatedWishlist = currentWishlist.filter(item => item.id !== productId);
    this.wishlistSubject.next(updatedWishlist);
    this.saveWishlist(updatedWishlist);
    this.toastService.info('Removed from wishlist');
    console.log('Toast info called: Removed from wishlist');
  }

  isInWishlist(productId: number): Observable<boolean> {
    return this.wishlist$.pipe(
      map(wishlist => wishlist.some(item => item.id === productId))
    );
  }

  getWishlistItems(): Observable<Product[]> {
    return this.wishlist$;
  }

  clearWishlist(): void {
    this.wishlistSubject.next([]);
    this.saveWishlist([]);
  }
} 