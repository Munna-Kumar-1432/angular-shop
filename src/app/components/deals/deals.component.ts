import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Category } from '../../services/product.service';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './deals.component.html',
  styleUrl: './deals.component.scss'
})
export class DealsComponent implements OnInit {
  categories: Category[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Deals categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Error fetching categories for deals:', error);
      }
    });
  }

  getCategoryImagePath(category: Category): string {
    return `https://picsum.photos/seed/${category.slug}/400/300`;
  }
}
