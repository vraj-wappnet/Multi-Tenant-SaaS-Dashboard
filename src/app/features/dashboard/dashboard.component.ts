import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { OrganizationService } from "../../core/services/organization.service";
import { UserService } from "../../core/services/user.service";
import { Organization } from "../../shared/models/organization.model";
import { User } from "../../shared/models/user.model";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🏢</div>
          <div class="stat-content">
            <div class="stat-value">{{ organizationsCount }}</div>
            <div class="stat-label">Organizations</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ usersCount }}</div>
            <div class="stat-label">Users</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeOrgsCount }}</div>
            <div class="stat-label">Active Organizations</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🔌</div>
          <div class="stat-content">
            <div class="stat-value">{{ featuresCount }}</div>
            <div class="stat-label">Active Features</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2>Quick Actions</h2>
        <div class="quick-actions">
          @if (isSuperAdmin) {
          <a routerLink="/organizations" class="quick-action-card">
            <div class="quick-action-icon">📋</div>
            <div class="quick-action-title">Manage Organizations</div>
          </a>
          <a routerLink="/features" class="quick-action-card">
            <div class="quick-action-icon">🔌</div>
            <div class="quick-action-title">Feature Toggles</div>
          </a>
          <a routerLink="/usage" class="quick-action-card">
            <div class="quick-action-icon">📊</div>
            <div class="quick-action-title">Usage Analytics</div>
          </a>
          } @if (isOrgAdmin) {
          <a routerLink="/users" class="quick-action-card">
            <div class="quick-action-icon">👥</div>
            <div class="quick-action-title">Manage Users</div>
          </a>
          <a routerLink="/features" class="quick-action-card">
            <div class="quick-action-icon">🔌</div>
            <div class="quick-action-title">Feature Settings</div>
          </a>
          <a routerLink="/usage" class="quick-action-card">
            <div class="quick-action-icon">📊</div>
            <div class="quick-action-title">Usage Reports</div>
          </a>
          } @if (isUser) {
          <a routerLink="/profile" class="quick-action-card">
            <div class="quick-action-icon">👤</div>
            <div class="quick-action-title">My Profile</div>
          </a>
          <div class="quick-action-card">
            <div class="quick-action-icon">📝</div>
            <div class="quick-action-title">My Activity</div>
          </div>
          <div class="quick-action-card">
            <div class="quick-action-icon">❓</div>
            <div class="quick-action-title">Help & Support</div>
          </div>
          }
        </div>
      </div>

      <!-- Recent Activity (Placeholder) -->
      <div class="section">
        <h2>Recent Activity</h2>
        <div class="card">
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-icon">➕</div>
              <div class="activity-content">
                <div class="activity-title">New organization created</div>
                <div class="activity-meta">Today, 10:30 AM</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">👤</div>
              <div class="activity-content">
                <div class="activity-title">User John Doe invited</div>
                <div class="activity-meta">Yesterday, 3:45 PM</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">🔄</div>
              <div class="activity-content">
                <div class="activity-title">Feature toggle updated</div>
                <div class="activity-meta">May 26, 2:13 PM</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">🔒</div>
              <div class="activity-content">
                <div class="activity-title">Organization suspended</div>
                <div class="activity-meta">May 25, 9:27 AM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        max-width: 1200px;
        margin: 0 auto;
      }

      .welcome-card {
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        margin-bottom: var(--space-6);
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: var(--shadow-md);
        border-left: 4px solid var(--primary-600);
      }

      .welcome-content h2 {
        margin-bottom: var(--space-2);
      }

      .welcome-content p {
        margin-bottom: 0;
        color: var(--text-secondary);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--space-4);
        margin-bottom: var(--space-6);
      }

      .stat-card {
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        padding: var(--space-4);
        display: flex;
        align-items: center;
        box-shadow: var(--shadow-md);
        transition: transform var(--transition-fast) ease-in-out;
      }

      .stat-card:hover {
        transform: translateY(-3px);
      }

      .stat-icon {
        font-size: 2rem;
        margin-right: var(--space-4);
      }

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: 600;
        margin-bottom: var(--space-1);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .section {
        margin-bottom: var(--space-6);
      }

      .section h2 {
        margin-bottom: var(--space-4);
      }

      .quick-actions {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-4);
      }

      .quick-action-card {
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        text-align: center;
        box-shadow: var(--shadow-md);
        transition: all var(--transition-fast) ease-in-out;
        cursor: pointer;
        text-decoration: none;
        color: var(--text-primary);
      }

      .quick-action-card:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-lg);
        background-color: var(--primary-50);
      }

      .quick-action-icon {
        font-size: 2rem;
        margin-bottom: var(--space-3);
      }

      .quick-action-title {
        font-weight: 500;
      }

      .activity-list {
        padding: var(--space-3) 0;
      }

      .activity-item {
        display: flex;
        padding: var(--space-3) var(--space-4);
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

      /* Responsive styles */
      @media (max-width: 992px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .welcome-card {
          flex-direction: column;
          text-align: center;
        }

        .welcome-actions {
          margin-top: var(--space-4);
        }

        .quick-actions {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 576px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }

        .quick-actions {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private orgService = inject(OrganizationService);
  private userService = inject(UserService);

  currentUser: User | null = null;
  currentOrg: Organization | null = null;

  // Stats
  organizationsCount = 0;
  usersCount = 0;
  activeOrgsCount = 0;
  featuresCount = 12; // Placeholder

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === "SUPER_ADMIN";
  }

  get isOrgAdmin(): boolean {
    return this.currentUser?.role === "ORG_ADMIN";
  }

  get isUser(): boolean {
    return this.currentUser?.role === "USER";
  }

  constructor() {
    // Subscribe to currentUser changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      // Reload stats and organization when user changes
      this.loadStats();
      this.loadCurrentOrganization();
    });

    // Listen for organization changes (relevant for super admin)
    this.orgService.currentOrgId$.subscribe((orgId) => {
      if (orgId) {
        this.orgService.getOrganization(orgId).subscribe((org) => {
          this.currentOrg = org;
        });
      } else {
        this.currentOrg = null;
      }
    });
  }

  private loadCurrentOrganization(): void {
    if (this.currentUser?.organizationId) {
      this.orgService
        .getOrganization(this.currentUser.organizationId)
        .subscribe((org) => {
          this.currentOrg = org;
        });
    } else {
      this.currentOrg = null;
    }
  }

  private loadStats(): void {
    if (!this.currentUser) {
      this.organizationsCount = 0;
      this.usersCount = 0;
      this.activeOrgsCount = 0;
      return;
    }

    // Load stats based on user role
    if (this.isSuperAdmin) {
      this.orgService.getOrganizations().subscribe((orgs) => {
        this.organizationsCount = orgs.length;
        this.activeOrgsCount = orgs.filter(
          (org) => org.status === "ACTIVE"
        ).length;
      });

      this.userService.getUsers().subscribe((users) => {
        this.usersCount = users.length;
      });
    } else if (this.isOrgAdmin || this.isUser) {
      // For org admin or user, show stats for their organization
      if (this.currentUser.organizationId) {
        this.organizationsCount = 1; // Current organization
        this.orgService
          .getOrganization(this.currentUser.organizationId)
          .subscribe((org) => {
            this.activeOrgsCount = org.status === "ACTIVE" ? 1 : 0;
          });

        this.userService
          .getUsers(this.currentUser.organizationId)
          .subscribe((users) => {
            this.usersCount = users.length;
          });
      }
    }
  }
}
