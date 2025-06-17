import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isBrowser: boolean;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Check if user is already logged in only in browser environment
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        this.isLoggedInSubject.next(true);
        this.currentUserSubject.next(JSON.parse(user));
      }
    }
  }

  login(email: string, password: string): Observable<boolean> {
    // Simulate API call
    return new Observable(observer => {
      setTimeout(() => {
        let user: User | null = null;
        // Simulate admin user for demonstration
        if (email === 'admin@example.com' && password === 'admin') {
          user = {
            id: 999,
            name: 'Admin User',
            email: email,
            avatar: `https://ui-avatars.com/api/?name=Admin+User&background=random`,
            isAdmin: true
          };
        } else {
          user = {
            id: 1,
            name: 'John Doe',
            email: email,
            avatar: `https://ui-avatars.com/api/?name=John+Doe&background=random`,
            isAdmin: false
          };
        }

        if (this.isBrowser && user) {
          localStorage.setItem('token', 'dummy-token');
          localStorage.setItem('user', JSON.stringify(user));
        }

        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(!!user);
        
        observer.next(!!user);
        observer.complete();
      }, 1000);
    });
  }

  signup(username: string, password: string): boolean {
    if (!this.isBrowser) {
      return false; // Cannot use localStorage in non-browser environment
    }

    const existingUser = localStorage.getItem(`user_${username}`);
    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User = {
      id: Date.now(), // Simple unique ID
      name: username,
      email: `${username}@example.com`,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      isAdmin: false // New users are not admins by default
    };

    localStorage.setItem(`user_${username}`, JSON.stringify(newUser));
    return true;
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getUserName(): string {
    return this.currentUserSubject.value?.name || 'Guest';
  }

  getUserAvatar(): string {
    return this.currentUserSubject.value?.avatar || 'https://ui-avatars.com/api/?name=Guest&background=random';
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  isAdmin(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.isAdmin || false)
    );
  }
} 