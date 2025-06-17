import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatTableModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  isSidebarOpen = true;
  
  // Sales chart data
  salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        label: 'Sales'
      }
    ]
  };

  // Top selling products
  topProducts = [
    {
      name: 'iPhone 13 Pro',
      sales: 156,
      revenue: '$156,000',
      growth: '+12%',
      image: 'https://example.com/iphone.jpg'
    },
    {
      name: 'Samsung Galaxy S21',
      sales: 98,
      revenue: '$98,000',
      growth: '+8%',
      image: 'https://example.com/samsung.jpg'
    },
    {
      name: 'MacBook Pro',
      sales: 75,
      revenue: '$112,500',
      growth: '+15%',
      image: 'https://example.com/macbook.jpg'
    }
  ];

  // User statistics
  userStats = {
    total: 1234,
    active: 890,
    new: 45,
    returning: 299
  };

  // Inventory alerts
  inventoryAlerts = [
    {
      product: 'iPhone 13 Pro',
      stock: 5,
      status: 'low',
      threshold: 10
    },
    {
      product: 'Samsung Galaxy S21',
      stock: 3,
      status: 'critical',
      threshold: 10
    },
    {
      product: 'MacBook Pro',
      stock: 8,
      status: 'low',
      threshold: 10
    }
  ];

  // Recent orders
  recentOrders = [
    {
      id: '#ORD-001',
      customer: 'John Doe',
      amount: '$1,200',
      status: 'completed',
      date: '2024-03-15'
    },
    {
      id: '#ORD-002',
      customer: 'Jane Smith',
      amount: '$850',
      status: 'processing',
      date: '2024-03-15'
    },
    {
      id: '#ORD-003',
      customer: 'Mike Johnson',
      amount: '$2,100',
      status: 'pending',
      date: '2024-03-14'
    }
  ];

  adminMenuItems = [
    {
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/admin',
      description: 'Overview of your store'
    },
    {
      title: 'Product Management',
      icon: 'inventory_2',
      route: '/admin/products',
      description: 'Add, edit, or remove products',
      badge: '12 new'
    },
    {
      title: 'Order Management',
      icon: 'shopping_cart',
      route: '/admin/orders',
      description: 'View and manage customer orders',
      badge: '5 pending'
    },
    {
      title: 'User Management',
      icon: 'people',
      route: '/admin/users',
      description: 'Manage user accounts and permissions'
    },
    {
      title: 'Category Management',
      icon: 'category',
      route: '/admin/categories',
      description: 'Organize products into categories'
    },
    {
      title: 'Analytics',
      icon: 'analytics',
      route: '/admin/analytics',
      description: 'View store statistics and reports'
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/admin/settings',
      description: 'Configure store settings'
    }
  ];

  quickStats = [
    {
      title: 'Total Sales',
      value: '$12,345',
      icon: 'attach_money',
      change: '+15%',
      isPositive: true
    },
    {
      title: 'Total Orders',
      value: '156',
      icon: 'shopping_bag',
      change: '+8%',
      isPositive: true
    },
    {
      title: 'Total Products',
      value: '89',
      icon: 'inventory',
      change: '+3%',
      isPositive: true
    },
    {
      title: 'Total Users',
      value: '1,234',
      icon: 'people',
      change: '+12%',
      isPositive: true
    }
  ];

  recentActivities = [
    {
      action: 'New order received',
      time: '5 minutes ago',
      user: 'John Doe',
      icon: 'shopping_cart'
    },
    {
      action: 'Product updated',
      time: '1 hour ago',
      user: 'Admin',
      icon: 'edit'
    },
    {
      action: 'New user registered',
      time: '2 hours ago',
      user: 'Jane Smith',
      icon: 'person_add'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4caf50';
      case 'processing':
        return '#2196f3';
      case 'pending':
        return '#ff9800';
      case 'critical':
        return '#f44336';
      case 'low':
        return '#ff9800';
      default:
        return '#757575';
    }
  }
}
