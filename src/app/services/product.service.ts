import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  thumbnail: string;
  images: string[];
  brand: string;
  rating: number;
  stock: number;
  discountPercentage: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://dummyjson.com/products';

  constructor(private http: HttpClient) { }

  // Get products with pagination
  getProducts(page: number = 1, limit: number = 10): Observable<ProductResponse> {
    const skip = (page - 1) * limit;
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<ProductResponse>(this.apiUrl, { params });
  }

  // Get a single product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Get products by category
  getProductsByCategory(category: string, page: number = 1, limit: number = 10): Observable<ProductResponse> {
    const skip = (page - 1) * limit;
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<ProductResponse>(`${this.apiUrl}/category/${category}`, { params });
  }

  // Get all categories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  // Search products
  searchProducts(query: string, page: number = 1, limit: number = 10): Observable<ProductResponse> {
    const skip = (page - 1) * limit;
    const params = new HttpParams()
      .set('q', query)
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    
    return this.http.get<ProductResponse>(`${this.apiUrl}/search`, { params });
  }

  // Add a new product
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // Update a product
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // Delete a product
  deleteProduct(id: number): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/${id}`);
  }

  // Sort products
  getSortedProducts(sort: 'asc' | 'desc'): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?sort=${sort}`);
  }

  // Get products by price range
  getProductsByPriceRange(min: number, max: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?price_min=${min}&price_max=${max}`);
  }

  // Get products with rating above threshold
  getProductsByRating(minRating: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?rating_min=${minRating}`);
  }

  // Get featured products (products with rating > 4)
  getFeaturedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?rating_min=4`);
  }

  // Get latest products (sorted by ID in descending order)
  getLatestProducts(limit: number = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?sort=desc&limit=${limit}`);
  }

  // Get related products (products in the same category)
  getRelatedProducts(category: string, currentProductId: number, limit: number = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}?limit=${limit}`).pipe(
      map(products => products.filter(product => product.id !== currentProductId))
    );
  }
} 