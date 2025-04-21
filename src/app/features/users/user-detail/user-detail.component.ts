import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../shared/models/user.model';
import { Organization } from '../../../shared/models/organization.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (loading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading user details...</p>
        </div>
      } @else if (user) {
        <div class="page-header">
          <div class="page-breadcrumbs">
            <a routerLink="/users">Users</a> / {{ user.name }}
          </div>
          <div class="page-title">
            <h1>{{ user.name }}</h1>
            <div class="user-meta">
              <span class="user-email">{{ user.email }}</span>
              <span class="badge" [ngClass]="{
                'badge-warning': user.role === 'ORG_ADMIN',
                'badge-primary': user.role === 'USER',
                'badge-danger': user.role === 'SUPER_ADMIN'
              }">
                {{ user.role === 'ORG_ADMIN' ? 'Admin' : user.role === 'USER' ? 'User' : 'Super Admin' }}
              </span>
              <span class="badge" [ngClass]="{
                'badge-success': user.status === 'ACTIVE',
                'badge-danger': user.status === 'SUSPENDED',
                'badge-warning': user.status === 'INACTIVE'
              }">
                {{ user.status }}
              </span>
            </div>
          </div>
          <div class="page-actions">
            <a [routerLink]="['/users', user.id, 'edit']" class="btn btn-primary">
              Edit User
            </a>
            <button class="btn btn-warning" (click)="resetPassword()">
              Reset Password
            </button>
            <button class="btn btn-danger" (click)="confirmDelete()">
              Delete
            </button>
          </div>
        </div>
        
        <div class="user-details">
          <div class="user-card">
            <div class="user-card-header">
              <h2>User Details</h2>
            </div>
            <div class="user-card-body">
              <div class="detail-row">
                <div class="detail-label">Name</div>
                <div class="detail-value">{{ user.name }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Email</div>
                <div class="detail-value">{{ user.email }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Role</div>
                <div class="detail-value">
                  <span class="badge" [ngClass]="{
                    'badge-warning': user.role === 'ORG_ADMIN',
                    'badge-primary': user.role === 'USER',
                    'badge-danger': user.role === 'SUPER_ADMIN'
                  }">
                    {{ user.role === 'ORG_ADMIN' ? 'Admin' : user.role === 'USER' ? 'User' : 'Super Admin' }}
                  </span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                  <span class="badge" [ngClass]="{
                    'badge-success': user.status === 'ACTIVE',
                    'badge-danger': user.status === 'SUSPENDED',
                    'badge-warning': user.status === 'INACTIVE'
                  }">
                    {{ user.status }}
                  </span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Organization</div>
                <div class="detail-value">{{ organization?.name || 'N/A' }}</div>
              </div>
            </div>
          </div>
          
          <!-- User Activity (Placeholder) -->
          <div class="activity-card">
            <div class="user-card-header">
              <h2>Recent Activity</h2>
            </div>
            <div class="user-card-body">
              <div class="activity-list">
                <div class="activity-item">
                  <div class="activity-icon">🔒</div>
                  <div class="activity-content">
                    <div class="activity-title">Logged in</div>
                    <div class="activity-meta">Today, 10:30 AM</div>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon">📝</div>
                  <div class="activity-content">
                    <div class="activity-title">Updated profile</div>
                    <div class="activity-meta">Yesterday, 3:45 PM</div>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon">📊</div>
                  <div class="activity-content">
                    <div class="activity-title">Generated report</div>
                    <div class="activity-meta">May 26, 2:13 PM</div>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon">🔔</div>
                  <div class="activity-content">
                    <div class="activity-title">Changed notification settings</div>
                    <div class="activity-meta">May 25, 9:27 AM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="not-found">
          <h2>User not found</h2>
          <p>The user you're looking for doesn't exist or has been deleted.</p>
          <a routerLink="/users" class="btn btn-primary">
            Back to Users
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
    }
    
    .page-breadcrumbs {
      margin-bottom: var(--space-3);
      color: var(--text-secondary);
    }
    
    .page-breadcrumbs a {
      color: var(--primary-600);
      text-decoration: none;
    }
    
    .page-breadcrumbs a:hover {
      text-decoration: underline;
    }
    
    .page-title {
      margin-bottom: var(--space-4);
    }
    
    .user-meta {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      margin-top: var(--space-1);
    }
    
    .user-email {
      color: var(--text-secondary);
    }
    
    .page-actions {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
    }
    
    .user-details {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: var(--space-6);
    }
    
    .user-card, .activity-card {
      background-color: var(--bg-tertiary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }
    
    .user-card-header {
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--border-color);
      background-color: var(--bg-secondary);
    }
    
    .user-card-header h2 {
      margin: 0;
      font-size: var(--text-lg);
    }
    
    .user-card-body {
      padding: var(--space-4) var(--space-6);
    }
    
    .detail-row {
      display: grid;
      grid-template-columns: 120px 1fr;
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      color: var(--text-secondary);
      font-weight: 500;
    }
    
    .activity-list {
      padding: var(--space-3) 0;
    }
    
    .activity-item {
      display: flex;
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      margin-right: var(--space-3);
      font-size: var(--text-lg);
    }
    
    .activity-meta {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
    
    .not-found {
      text-align: center;
      padding: var(--space-12);
    }
    
    @media (max-width: 992px) {
      .user-details {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 768px) {
      .page-actions {
        flex-direction: column;
      }
    }
  `]
})
export class UserDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private orgService = inject(OrganizationService);
  private toastService = inject(ToastService);
  
  user: User | null = null;
  organization: Organization | null = null;
  loading = true;
  
  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadUser(id);
  }
  
  loadUser(id: string) {
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.user = user;
        
        if (user.organizationId) {
          this.loadOrganization(user.organizationId);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.toastService.show({
          type: 'error',
          message: 'Error loading user'
        });
        this.loading = false;
      }
    });
  }
  
  loadOrganization(orgId: string) {
    this.orgService.getOrganization(orgId).subscribe({
      next: (org) => {
        this.organization = org;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organization:', error);
        this.loading = false;
      }
    });
  }
  
  resetPassword() {
    if (!this.user) return;
    
    this.userService.sendPasswordResetLink(this.user.email).subscribe({
      next: () => {
        this.toastService.show({
          type: 'success',
          message: `Password reset link sent to ${this.user!.email}`
        });
      },
      error: (error) => {
        console.error('Error sending password reset:', error);
        this.toastService.show({
          type: 'error',
          message: 'Error sending password reset link'
        });
      }
    });
  }
  
  confirmDelete() {
    if (!this.user) return;
    
    if (confirm(`Are you sure you want to delete user "${this.user.name}"? This action cannot be undone.`)) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.toastService.show({
            type: 'error',
            message: 'Error deleting user'
          });
        }
      });
    }
  }
}