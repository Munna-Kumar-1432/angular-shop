import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Category } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories.slice(0, 3);
        console.log('Home categories loaded:', this.categories);
      },
      error: (error) => {
        console.error('Error fetching categories for home:', error);
      }
    });
  }

  getCategoryImagePath(category: Category): string {
    return `https://picsum.photos/seed/${category.slug}/400/300`;
  }
}
