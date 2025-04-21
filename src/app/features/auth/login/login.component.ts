import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import {
  AuthService,
  LoginCredentials,
} from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">SaaSHub</h1>
        </div>

        <form class="login-form" (submit)="onSubmit()">
          @if (errorMessage) {
          <div class="alert alert-danger mb-4">{{ errorMessage }}</div>
          }

          <div class="form-control">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              class="form-input"
              [(ngModel)]="credentials.email"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-control">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              [(ngModel)]="credentials.password"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100"
            [disabled]="isLoggingIn"
          >
            @if (isLoggingIn) {
            <span class="loading-spinner"></span>
            <span>Logging in...</span>
            } @else {
            <span>Log In</span>
            }
          </button>
        </form>

        <div class="login-demo-accounts">
          <h3 class="text-center mb-3">Demo Accounts</h3>
          <div
            class="demo-account"
            (click)="fillDemoCredentials('admin@example.com', 'password')"
          >
            <div class="demo-account-role">Super Admin</div>
          </div>
          <div
            class="demo-account"
            (click)="fillDemoCredentials('orgadmin@example.com', 'password')"
          >
            <div class="demo-account-role">Org Admin</div>
          </div>
          <div
            class="demo-account"
            (click)="fillDemoCredentials('user@example.com', 'password')"
          >
            <div class="demo-account-role">Basic User</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;

        padding: var(--space-4);
      }

      .login-card {
        width: 100%;
        max-width: 420px;
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        overflow: hidden;
      }

      .login-header {
        padding: var(--space-6);
        text-align: center;
        background-color: var(--bg-secondary);
      }

      .login-title {
        font-size: var(--text-3xl);
        color: var(--primary-600);
        margin-bottom: var(--space-2);
      }

      .login-subtitle {
        color: var(--text-secondary);
        margin-bottom: 0;
      }

      .login-form {
        padding: var(--space-6);
      }

      .login-demo-accounts {
        padding: var(--space-4) var(--space-6) var(--space-6);
        border-top: 1px solid var(--border-color);
      }

      .demo-account {
        padding: var(--space-3);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-2);
        cursor: pointer;
        transition: all var(--transition-fast) ease-in-out;
      }

      .demo-account:hover {
        border-color: var(--primary-400);
        background-color: var(--primary-50);
      }

      .demo-account-role {
        font-weight: 600;
        color: var(--primary-700);
      }

      .demo-account-email {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }
    `,
  ],
})
export class LoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  credentials: LoginCredentials = {
    email: "",
    password: "",
  };

  isLoggingIn = false;
  errorMessage = "";

  ngOnInit(): void {
    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(["/dashboard"]);
    }
  }

  onSubmit(): void {
    this.isLoggingIn = true;
    this.errorMessage = "";

    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        this.isLoggingIn = false;

        // Get return url from route parameters or default to '/'
        const returnUrl =
          this.route.snapshot.queryParams["returnUrl"] || "/dashboard";
        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.isLoggingIn = false;
        this.errorMessage = "Invalid email or password";
        console.error("Login error:", error);
      },
    });
  }

  fillDemoCredentials(email: string, password: string): void {
    this.credentials = { email, password };
  }
}
