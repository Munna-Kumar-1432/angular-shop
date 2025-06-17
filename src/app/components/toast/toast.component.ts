import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="toast" 
         [class]="'fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ' + getToastClass()"
         [style.opacity]="toast ? '1' : '0'"
         [style.transform]="toast ? 'translateY(0)' : 'translateY(100%)'">
      <div class="flex items-center">
        <span class="mr-2">{{ getIcon() }}</span>
        {{ toast.message }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      z-index: 9999;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toast: Toast | null = null;
  private subscription: Subscription | undefined;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.toast = toast;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getToastClass(): string {
    if (!this.toast) return '';
    
    switch (this.toast.type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  }

  getIcon(): string {
    if (!this.toast) return '';
    
    switch (this.toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
      default:
        return 'ℹ';
    }
  }
} 