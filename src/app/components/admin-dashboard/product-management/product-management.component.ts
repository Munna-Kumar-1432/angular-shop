import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product, ProductResponse, Category } from '../../../services/product.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss'
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  loading: boolean = true;
  error: string | null = null;
  productForm: FormGroup;
  isEditMode: boolean = false;
  selectedProductId: number | null = null;
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 10; // Set a default items per page for admin view
  totalItems: number = 0;

  private productsSubscription: Subscription | undefined;
  private categoriesSubscription: Subscription | undefined;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      rating: [0, [Validators.min(0), Validators.max(5)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      thumbnail: ['', Validators.required],
      images: [''] // Optional: comma-separated URLs or array
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
    if (this.categoriesSubscription) {
      this.categoriesSubscription.unsubscribe();
    }
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    this.productsSubscription = this.productService.getProducts(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoriesSubscription = this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
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

  onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct: Product = { ...this.productForm.value };
      // Handle images field properly
      const imagesValue = this.productForm.get('images')?.value;
      newProduct.images = typeof imagesValue === 'string' 
        ? imagesValue.split(',').map((url: string) => url.trim()).filter(url => url)
        : Array.isArray(imagesValue) 
          ? imagesValue 
          : [];

      if (this.isEditMode && this.selectedProductId !== null) {
        this.productService.updateProduct(this.selectedProductId, newProduct).subscribe({
          next: () => {
            this.loadProducts();
            this.cancelEdit();
          },
          error: (err) => {
            console.error('Error updating product:', err);
            this.error = 'Failed to update product.';
          }
        });
      } else {
        this.productService.addProduct(newProduct).subscribe({
          next: () => {
            this.loadProducts();
            this.productForm.reset();
            this.productForm.patchValue({ discountPercentage: 0, rating: 0 }); // Reset specific fields
          },
          error: (err) => {
            console.error('Error adding product:', err);
            this.error = 'Failed to add product.';
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.productForm);
    }
  }

  editProduct(product: Product): void {
    this.isEditMode = true;
    this.selectedProductId = product.id;
    this.productForm.patchValue({
      title: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      stock: product.stock,
      brand: product.brand,
      category: product.category,
      thumbnail: product.thumbnail,
      images: product.images.join(', ') // Convert array back to comma-separated string
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.error = 'Failed to delete product.';
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedProductId = null;
    this.productForm.reset();
    this.productForm.patchValue({ discountPercentage: 0, rating: 0 });
  }

  getErrorMessage(controlName: string): string {
    const control = this.productForm.get(controlName);
    if (control?.errors?.['required']) {
      return 'This field is required.';
    }
    if (control?.errors?.['min'] && controlName !== 'rating') {
      return `Value must be at least ${control?.errors?.['min'].min}.`;
    }
    if (control?.errors?.['max']) {
      return `Value must be at most ${control?.errors?.['max'].max}.`;
    }
    if (control?.errors?.['min'] && controlName === 'rating') {
      return 'Rating must be between 1 and 5.';
    }
    return '';
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
