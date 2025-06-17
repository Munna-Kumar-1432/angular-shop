import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService, Product, ProductResponse } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Subscription, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  currentCategory: string | null = null; // To store the current category
  searchQuery: string | null = null; // To store the current search query
  isLoggedIn: boolean = false; // New property to track login status
  Math = Math; // Make Math available in template

  private authSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });

    this.route.queryParams.pipe(
      switchMap(params => {
        this.currentPage = Number(params['page']) || 1;
        this.currentCategory = params['category'] || null; // Read the category parameter
        this.searchQuery = params['search'] || null; // Read the search parameter
        return this.loadProducts();
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadProducts(): Observable<ProductResponse> {
    this.loading = true;
    this.error = null;
    let productsObservable: Observable<ProductResponse>;

    if (this.searchQuery) {
      productsObservable = this.productService.searchProducts(this.searchQuery, this.currentPage, this.itemsPerPage);
    } else if (this.currentCategory) {
      productsObservable = this.productService.getProductsByCategory(this.currentCategory, this.currentPage, this.itemsPerPage);
    } else {
      productsObservable = this.productService.getProducts(this.currentPage, this.itemsPerPage);
    }

    return productsObservable.pipe(
      tap(response => {
        this.products = response.products;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.loading = false;
      },
      error => {
        console.error('Error loading products:', error);
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
      })
    );
  }

  onPageChange(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateRoute();
    }
  }

  updateRoute(): void {
    const queryParams: any = { page: this.currentPage };
    if (this.currentCategory) {
      queryParams.category = this.currentCategory;
    }
    if (this.searchQuery) {
      queryParams.search = this.searchQuery;
    }
    this.router.navigate([], { queryParams: queryParams, queryParamsHandling: 'merge' });
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  getStarRating(rating: number): boolean[] {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(i < rating);
    }
    return stars;
  }

  getDiscountedPrice(product: any): number {
    return product.price * (1 - product.discountPercentage / 100);
  }
}
