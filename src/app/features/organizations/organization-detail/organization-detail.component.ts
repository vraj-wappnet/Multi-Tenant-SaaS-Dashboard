import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Organization } from '../../../shared/models/organization.model';
import { OrganizationService } from '../../../core/services/organization.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (loading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading organization details...</p>
        </div>
      } @else if (organization) {
        <div class="page-header">
          <div class="page-breadcrumbs">
            <a routerLink="/organizations">Organizations</a> / {{ organization.name }}
          </div>
          <div class="page-title">
            <div class="d-flex align-items-center gap-4">
              <div class="org-logo">
                <img [src]="organization.logo" [alt]="organization.name">
              </div>
              <div>
                <h1>{{ organization.name }}</h1>
                <div class="org-meta">
                  <span class="org-industry">{{ organization.industry }}</span>
                  <span class="badge" [ngClass]="{
                    'badge-primary': organization.plan === 'FREE',
                    'badge-success': organization.plan === 'PRO',
                    'badge-warning': organization.plan === 'ENTERPRISE'
                  }">
                    {{ organization.plan }}
                  </span>
                  <span class="badge" [ngClass]="{
                    'badge-success': organization.status === 'ACTIVE',
                    'badge-danger': organization.status === 'SUSPENDED'
                  }">
                    {{ organization.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="page-actions">
            <a [routerLink]="['/organizations', organization.id, 'edit']" class="btn btn-primary">
              Edit Organization
            </a>
            <a [routerLink]="['/organizations', organization.id, 'features']" class="btn btn-secondary">
              Feature Settings
            </a>
            <button class="btn btn-danger" (click)="confirmDelete()">
              Delete
            </button>
          </div>
        </div>
        
        <div class="org-details">
          <div class="org-card">
            <div class="org-card-header">
              <h2>Organization Details</h2>
            </div>
            <div class="org-card-body">
              <div class="detail-row">
                <div class="detail-label">Name</div>
                <div class="detail-value">{{ organization.name }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Industry</div>
                <div class="detail-value">{{ organization.industry }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Plan</div>
                <div class="detail-value">
                  <span class="badge" [ngClass]="{
                    'badge-primary': organization.plan === 'FREE',
                    'badge-success': organization.plan === 'PRO',
                    'badge-warning': organization.plan === 'ENTERPRISE'
                  }">
                    {{ organization.plan }}
                  </span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="detail-value">
                  <span class="badge" [ngClass]="{
                    'badge-success': organization.status === 'ACTIVE',
                    'badge-danger': organization.status === 'SUSPENDED'
                  }">
                    {{ organization.status }}
                  </span>
                </div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Created On</div>
                <div class="detail-value">{{ organization.createdAt | date:'medium' }}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Users</div>
                <div class="detail-value">{{ usersCount }}</div>
              </div>
            </div>
          </div>
          
          <div class="users-list-card">
            <div class="org-card-header">
              <h2>Organization Users</h2>
              <a [routerLink]="['/users', 'new']" class="btn btn-sm btn-primary">
                Add User
              </a>
            </div>
            <div class="org-card-body">
              @if (loadingUsers) {
                <div class="text-center py-4">
                  <div class="loading-spinner"></div>
                  <p>Loading users...</p>
                </div>
              } @else if (users.length === 0) {
                <div class="text-center py-4">
                  <p>No users found for this organization</p>
                </div>
              } @else {
                <div class="users-table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (user of users; track user.id) {
                        <tr>
                          <td>{{ user.name }}</td>
                          <td>{{ user.email }}</td>
                          <td>
                            <span class="badge" [ngClass]="{
                              'badge-warning': user.role === 'ORG_ADMIN',
                              'badge-primary': user.role === 'USER'
                            }">
                              {{ user.role === 'ORG_ADMIN' ? 'Admin' : 'User' }}
                            </span>
                          </td>
                          <td>
                            <span class="badge" [ngClass]="{
                              'badge-success': user.status === 'ACTIVE',
                              'badge-danger': user.status === 'SUSPENDED' || user.status === 'INACTIVE'
                            }">
                              {{ user.status }}
                            </span>
                          </td>
                          <td>
                            <div class="actions">
                              <a [routerLink]="['/users', user.id]" class="btn btn-sm btn-secondary">
                                View
                              </a>
                              <a [routerLink]="['/users', user.id, 'edit']" class="btn btn-sm btn-primary">
                                Edit
                              </a>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="not-found">
          <h2>Organization not found</h2>
          <p>The organization you're looking for doesn't exist or has been deleted.</p>
          <a routerLink="/organizations" class="btn btn-primary">
            Back to Organizations
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
    
    .org-logo {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-color);
    }
    
    .org-logo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .org-meta {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      margin-top: var(--space-1);
    }
    
    .org-industry {
      color: var(--text-secondary);
    }
    
    .page-actions {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
    }
    
    .org-details {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: var(--space-6);
    }
    
    .org-card {
      background-color: var(--bg-tertiary);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }
    
    .org-card-header {
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--border-color);
      background-color: var(--bg-secondary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .org-card-header h2 {
      margin: 0;
      font-size: var(--text-lg);
    }
    
    .org-card-body {
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
    
    .users-table-container {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .not-found {
      text-align: center;
      padding: var(--space-12);
    }
    
    @media (max-width: 992px) {
      .org-details {
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
export class OrganizationDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  
  organization: Organization | null = null;
  loading = true;
  loadingUsers = true;
  users: any[] = [];
  usersCount = 0;
  
  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadOrganization(id);
    this.loadUsers(id);
  }
  
  loadOrganization(id: string) {
    this.loading = true;
    
    this.orgService.getOrganization(id).subscribe({
      next: (org) => {
        this.organization = org;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organization:', error);
        this.toastService.show({
          type: 'error',
          message: 'Error loading organization'
        });
        this.loading = false;
      }
    });
  }
  
  loadUsers(orgId: string) {
    this.loadingUsers = true;
    
    this.userService.getUsers(orgId).subscribe({
      next: (users) => {
        this.users = users;
        this.usersCount = users.length;
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastService.show({
          type: 'error',
          message: 'Error loading organization users'
        });
        this.loadingUsers = false;
      }
    });
  }
  
  confirmDelete() {
    if (!this.organization) return;
    
    if (confirm(`Are you sure you want to delete "${this.organization.name}"? This action cannot be undone.`)) {
      this.orgService.deleteOrganization(this.organization.id).subscribe({
        next: () => {
          this.router.navigate(['/organizations']);
        },
        error: (error) => {
          console.error('Error deleting organization:', error);
          this.toastService.show({
            type: 'error',
            message: 'Error deleting organization'
          });
        }
      });
    }
  }
}