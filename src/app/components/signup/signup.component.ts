import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  username!: string;
  password!: string;
  confirmPassword!: string;
  signupError = false;

  constructor(private authService: AuthService, private router: Router) {}

  signup(): void {
    if (this.password !== this.confirmPassword) {
      this.signupError = true;
      return;
    }

    if (this.authService.signup(this.username, this.password)) {
      this.router.navigate(['/products']); // Or navigate to login page
    } else {
      this.signupError = true; // Username already exists
    }
  }
}
