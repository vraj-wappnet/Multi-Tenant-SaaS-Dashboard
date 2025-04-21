import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { OrganizationService } from '../../../core/services/organization.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../shared/models/user.model';
import { Organization } from '../../../shared/models/organization.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="users-container">
      <div class="page-header">
        <div class="page-title">
          <h1>Users</h1>
          <p class="text-muted">
            @if (currentOrg) {
              Manage users for {{ currentOrg.name }}
            } @else if (isSuperAdmin) {
              Select an organization to manage its users
            } @else {
              Manage users for your organization
            }
          </p>
        </div>
        <div class="page-actions">
          @if (currentOrg && canAddUser) {
            <a routerLink="/users/new" class="btn btn-primary" [attr.data-tooltip]="addUserTooltip">
              + Add User
            </a>
          } @else if (currentOrg) {
            <button class="btn btn-primary disabled" [attr.data-tooltip]="addUserTooltip">
              + Add User
            </button>
          }
        </div>
      </div>
      
      @if (isSuperAdmin && !currentOrg) {
        <div class="org-selector-card">
          <div class="form-control">
            <label for="org-select" class="form-label">Select Organization</label>
            <select 
              id="org-select" 
              class="form-select"
              [(ngModel)]="selectedOrgId"
              (change)="onOrganizationChange()">
              <option [value]="null" disabled>Choose an organization</option>
              @for (org of organizations; track org.id) {
                <option [value]="org.id">{{ org.name }}</option>
              }
            </select>
          </div>
        </div>
      } @else if (loading) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      } @else {
        <div class="card mb-4">
          <div class="filters">
            <div class="search-box">
              <input 
                type="text" 
                class="form-input" 
                placeholder="Search users..." 
                [(ngModel)]="searchQuery"
                (input)="onSearch()">
            </div>
            
            <div class="status-filter">
              <select class="form-select" [(ngModel)]="statusFilter" (change)="onSearch()">
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            
            <div class="role-filter">
              <select class="form-select" [(ngModel)]="roleFilter" (change)="onSearch()">
                <option value="">All Roles</option>
                <option value="ORG_ADMIN">Admin</option>
                <option value="USER">User</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="table-container">
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
                @if (filteredUsers.length === 0) {
                  <tr>
                    <td colspan="5" class="text-center py-4">
                      <p>No users found</p>
                      @if (searchQuery || statusFilter || roleFilter) {
                        <button class="btn btn-secondary btn-sm mt-2" (click)="clearFilters()">
                          Clear Filters
                        </button>
                      }
                    </td>
                  </tr>
                } @else {
                  @for (user of filteredUsers; track user.id) {
                    <tr>
                      <td>{{ user.name }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'badge-warning': user.role === 'ORG_ADMIN',
                          'badge-primary': user.role === 'USER',
                          'badge-danger': user.role === 'SUPER_ADMIN'
                        }">
                          {{ user.role === 'ORG_ADMIN' ? 'Admin' : user.role === 'USER' ? 'User' : 'Super Admin' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="{
                          'badge-success': user.status === 'ACTIVE',
                          'badge-danger': user.status === 'SUSPENDED',
                          'badge-warning': user.status === 'INACTIVE'
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
                          <button class="btn btn-sm btn-warning" (click)="resetPassword(user)">
                            Reset Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .users-container {
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
    
    .org-selector-card {
      background-color: var(--bg-tertiary);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      margin-bottom: var(--space-6);
      box-shadow: var(--shadow-md);
    }
    
    .filters {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-4);
    }
    
    .search-box {
      flex: 1;
    }
    
    .status-filter,
    .role-filter {
      width: 180px;
    }
    
    .actions {
      display: flex;
      gap: var(--space-2);
    }
    
    .btn.disabled {
      opacity: 0.6;
      cursor: not-allowed;
      position: relative;
    }
    
    [data-tooltip] {
      position: relative;
    }
    
    [data-tooltip]:before {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
      padding: 8px 12px;
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      white-space: nowrap;
      box-shadow: var(--shadow-md);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
      z-index: 10;
      pointer-events: none;
      border: 1px solid var(--border-color);
    }
    
    [data-tooltip]:hover:before {
      opacity: 1;
      visibility: visible;
    }
    
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: var(--space-4);
      }
      
      .filters {
        flex-direction: column;
      }
      
      .actions {
        flex-direction: column;
        gap: var(--space-2);
      }
    }
  `]
})
export class UsersListComponent {
  private userService = inject(UserService);
  private orgService = inject(OrganizationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  
  users: User[] = [];
  filteredUsers: User[] = [];
  organizations: Organization[] = [];
  currentOrg: Organization | null = null;
  selectedOrgId: string | null = null;
  
  loading = true;
  searchQuery = '';
  statusFilter = '';
  roleFilter = '';
  
  canAddUser = true;
  addUserTooltip = '';
  
  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'SUPER_ADMIN';
  }
  
  ngOnInit() {
    // If user is super admin, load organizations for selection
    if (this.isSuperAdmin) {
      this.orgService.getOrganizations().subscribe(orgs => {
        this.organizations = orgs;
      });
      
      // Listen for organization changes from sidebar
      this.orgService.currentOrgId$.subscribe(orgId => {
        if (orgId) {
          this.selectedOrgId = orgId;
          this.loadOrganizationData();
        }
      });
    } else {
      // For regular users and org admins, use their organization
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.organizationId) {
        this.selectedOrgId = currentUser.organizationId;
        this.loadOrganizationData();
      }
    }
  }
  
  onOrganizationChange() {
    if (this.selectedOrgId) {
      this.loadOrganizationData();
    }
  }
  
  loadOrganizationData() {
    if (!this.selectedOrgId) return;
    
    this.loading = true;
    
    // Load organization details
    this.orgService.getOrganization(this.selectedOrgId).subscribe({
      next: (org) => {
        this.currentOrg = org;
        this.loadUsers();
        this.checkUserLimit();
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
  
  loadUsers() {
    if (!this.selectedOrgId) return;
    
    this.userService.getUsers(this.selectedOrgId).subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastService.show({
          type: 'error',
          message: 'Error loading users'
        });
        this.loading = false;
      }
    });
  }
  
  checkUserLimit() {
    if (!this.selectedOrgId) return;
    
    this.userService.checkUserLimitForOrganization(this.selectedOrgId).subscribe({
      next: (result) => {
        this.canAddUser = result.canAddUser;
        this.addUserTooltip = result.reason || '';
      },
      error: (error) => {
        console.error('Error checking user limit:', error);
      }
    });
  }
  
  onSearch() {
    this.applyFilters();
  }
  
  applyFilters() {
    let filtered = [...this.users];
    
    // Apply search filter
    if (this.searchQuery) {
      const search = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(search) || 
        user.email.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(user => user.status === this.statusFilter);
    }
    
    // Apply role filter
    if (this.roleFilter) {
      filtered = filtered.filter(user => user.role === this.roleFilter);
    }
    
    this.filteredUsers = filtered;
  }
  
  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.roleFilter = '';
    this.applyFilters();
  }
  
  resetPassword(user: User) {
    this.userService.sendPasswordResetLink(user.email).subscribe({
      next: () => {
        this.toastService.show({
          type: 'success',
          message: `Password reset link sent to ${user.email}`
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
}