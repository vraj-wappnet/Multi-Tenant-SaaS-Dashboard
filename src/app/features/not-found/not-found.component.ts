import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="not-found-title">404</h1>
        <h2 class="not-found-subtitle">Page Not Found</h2>
        <p class="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a routerLink="/dashboard" class="btn btn-primary not-found-button">
          Back to Dashboard
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--bg-primary);
    }
    
    .not-found-content {
      text-align: center;
      padding: var(--space-6);
      max-width: 500px;
    }
    
    .not-found-title {
      font-size: 6rem;
      font-weight: 700;
      color: var(--primary-600);
      margin: 0;
      line-height: 1;
    }
    
    .not-found-subtitle {
      font-size: var(--text-2xl);
      margin-bottom: var(--space-4);
    }
    
    .not-found-message {
      color: var(--text-secondary);
      margin-bottom: var(--space-6);
    }
    
    .not-found-button {
      min-width: 200px;
    }
  `]
})
export class NotFoundComponent {}