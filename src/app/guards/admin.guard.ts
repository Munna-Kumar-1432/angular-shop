import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isAdmin().pipe(
      take(1), // Take only the first value and complete
      map(isAdmin => {
        if (isAdmin) {
          return true;
        } else {
          // Redirect to login page or a forbidden page if not admin
          // For now, redirect to home and log a message
          this.router.navigate(['/']); 
          console.warn('Access denied: You must be an administrator to view this page.');
          return false;
        }
      })
    );
  }
} 