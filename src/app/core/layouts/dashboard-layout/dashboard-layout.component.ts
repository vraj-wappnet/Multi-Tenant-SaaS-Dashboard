import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeService } from "../../services/theme.service";
import { AuthService } from "../../services/auth.service";
import { OrganizationService } from "../../services/organization.service";
import { Organization } from "../../../shared/models/organization.model";
import { User } from "../../../shared/models/user.model"; // Adjust the path as needed
import { FormsModule } from "@angular/forms";
import { ToastService } from "../../services/toast.service";

@Component({
  selector: "app-dashboard-layout",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <h1 class="sidebar-logo">SaaSHub</h1>
          <button class="sidebar-toggle" (click)="toggleSidebar()">
            <span class="toggle-icon">{{ sidebarCollapsed ? "→" : "←" }}</span>
          </button>
        </div>

        <div class="sidebar-content">
          <!-- Organization Selector for Super Admin -->
          @if (isSuperAdmin && organizations.length > 0) {
          <div class="org-selector">
            <label for="org-select" class="form-label">Organization</label>
            <select
              id="org-select"
              class="form-select"
              [(ngModel)]="selectedOrgId"
              (change)="onOrganizationChange()"
            >
              <option [value]="null">All Organizations</option>
              @for (org of organizations; track org.id) {
              <option [value]="org.id">{{ org.name }}</option>
              }
            </select>
          </div>
          }

          <nav class="sidebar-nav">
            <ul class="nav-list">
              <li class="nav-item">
                <a
                  routerLink="/dashboard"
                  routerLinkActive="active"
                  class="nav-link"
                >
                  <span class="nav-icon">📊</span>
                  <span class="nav-text">Dashboard</span>
                </a>
              </li>

              @if (isSuperAdmin) {
              <li class="nav-item">
                <a
                  routerLink="/organizations"
                  routerLinkActive="active"
                  class="nav-link"
                >
                  <span class="nav-icon">🏢</span>
                  <span class="nav-text">Organizations</span>
                </a>
              </li>
              }

              <li class="nav-item">
                <a
                  routerLink="/users"
                  routerLinkActive="active"
                  class="nav-link"
                >
                  <span class="nav-icon">👥</span>
                  <span class="nav-text">Users</span>
                </a>
              </li>

              @if (isSuperAdmin || isOrgAdmin) {
              <li class="nav-item">
                <a
                  routerLink="/features"
                  routerLinkActive="active"
                  class="nav-link"
                >
                  <span class="nav-icon">🔌</span>
                  <span class="nav-text">Feature Toggles</span>
                </a>
              </li>

              <li class="nav-item">
                <a
                  routerLink="/usage"
                  routerLinkActive="active"
                  class="nav-link"
                >
                  <span class="nav-icon">📈</span>
                  <span class="nav-text">Usage</span>
                </a>
              </li>
              }
            </ul>
          </nav>
        </div>

        <div class="sidebar-footer">
          <button class="theme-toggle" (click)="toggleTheme()">
            <span class="toggle-icon">{{ isDarkMode ? "☀️" : "🌙" }}</span>
            <span class="toggle-text">{{
              isDarkMode ? "Light Mode" : "Dark Mode"
            }}</span>
          </button>
          <button class="logout-btn" (click)="logout()">
            <span class="nav-icon">🚪</span>
            <span class="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <button class="menu-toggle" (click)="toggleSidebar()">☰</button>
            <h2 class="header-title">{{ pageTitle }}</h2>
          </div>
          <div class="header-right">
            <div class="user-info">
              <span class="user-name">{{ currentUser?.name }}</span>
              <span class="user-role badge badge-primary">{{
                currentUser?.role
              }}</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <ng-content></ng-content>
        </div>
      </main>
    </div>

    <!-- Toast Container -->
    <div class="toast-container">
      @for (toast of toasts; track toast.id) {
      <div
        class="toast toast-{{ toast.type }} fade-in"
        [attr.data-id]="toast.id"
      >
        <div class="toast-content">{{ toast.message }}</div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-layout {
        display: flex;
        min-height: 100vh;
      }

      /* Sidebar */
      .sidebar {
        width: 280px;
        background-color: var(--bg-tertiary);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        transition: width var(--transition-normal) ease-in-out;
        overflow-x: hidden;
        z-index: 10;
      }

      .sidebar.collapsed {
        width: 70px;
      }

      .sidebar-header {
        padding: var(--space-4);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
      }

      .sidebar-logo {
        font-size: var(--text-xl);
        font-weight: 700;
        color: var(--primary-600);
        margin: 0;
        white-space: nowrap;
      }

      .sidebar.collapsed .sidebar-logo {
        display: none;
      }

      .sidebar-toggle {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .sidebar-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--space-4) 0;
      }

      .org-selector {
        padding: 0 var(--space-4) var(--space-4);
        border-bottom: 1px solid var(--border-color);
        margin-bottom: var(--space-4);
      }

      .sidebar.collapsed .org-selector {
        display: none;
      }

      .nav-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .nav-item {
        margin-bottom: var(--space-1);
      }

      .nav-link {
        display: flex;
        align-items: center;
        padding: var(--space-3) var(--space-4);
        color: var(--text-secondary);
        text-decoration: none;
        transition: all var(--transition-fast) ease-in-out;
        border-left: 3px solid transparent;
      }

      .nav-link:hover {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
      }

      .nav-link.active {
        background-color: var(--primary-50);
        color: var(--primary-700);
        border-left-color: var(--primary-600);
      }

      .nav-icon {
        margin-right: var(--space-3);
        font-size: var(--text-lg);
        width: 24px;
        text-align: center;
      }

      .sidebar.collapsed .nav-text {
        display: none;
      }

      .sidebar-footer {
        padding: var(--space-4);
        border-top: 1px solid var(--border-color);
      }

      .sidebar.collapsed .sidebar-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .theme-toggle,
      .logout-btn {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        cursor: pointer;
        width: 100%;
        padding: var(--space-2);
        color: var(--text-secondary);
        margin-bottom: var(--space-2);
        border-radius: var(--radius-md);
        transition: background-color var(--transition-fast) ease-in-out;
      }

      .theme-toggle:hover,
      .logout-btn:hover {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
      }

      .sidebar.collapsed .toggle-text {
        display: none;
      }

      /* Main Content */
      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-x: hidden;
      }

      /* Header */
      .header {
        height: 64px;
        padding: 0 var(--space-6);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--bg-tertiary);
        border-bottom: 1px solid var(--border-color);
        position: sticky;
        top: 0;
        z-index: 5;
      }

      .header-left {
        display: flex;
        align-items: center;
      }

      .menu-toggle {
        background: none;
        border: none;
        font-size: var(--text-xl);
        margin-right: var(--space-4);
        color: var(--text-secondary);
        cursor: pointer;
        display: none;
      }

      .header-title {
        margin: 0;
        font-size: var(--text-lg);
      }

      .header-right {
        display: flex;
        align-items: center;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .user-name {
        font-weight: 500;
      }

      /* Page Content */
      .page-content {
        flex: 1;
        padding: var(--space-6);
        background-color: var(--bg-primary);
      }

      /* Responsive styles */
      @media (max-width: 768px) {
        .sidebar {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          z-index: 20;
          width: 260px;
        }

        .sidebar.collapsed {
          transform: translateX(0);
          width: 260px;
        }

        .sidebar.collapsed .sidebar-logo,
        .sidebar.collapsed .nav-text,
        .sidebar.collapsed .org-selector,
        .sidebar.collapsed .toggle-text {
          display: block;
        }

        .menu-toggle {
          display: block;
        }
      }
    `,
  ],
})
export class DashboardLayoutComponent {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private orgService = inject(OrganizationService);
  private toastService = inject(ToastService);

  isDarkMode = false;
  sidebarCollapsed = false;
  pageTitle = "Dashboard";
  currentUser: User | null = null; // Initialize as null
  organizations: Organization[] = [];
  selectedOrgId: string | null = null;
  toasts: any[] = [];

  get isSuperAdmin(): boolean {
    return this.currentUser?.role === "SUPER_ADMIN";
  }

  get isOrgAdmin(): boolean {
    return this.currentUser?.role === "ORG_ADMIN";
  }

  constructor() {
    this.themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });

    this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });

    // Subscribe to user changes
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.sidebarCollapsed = false; // Reset sidebar when user changes

      // Load organizations for super admin
      if (this.isSuperAdmin) {
        this.orgService.getOrganizations().subscribe((orgs) => {
          this.organizations = orgs;
        });
      }
    });
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.sidebarCollapsed = false; // Reset sidebar state
    this.authService.logout();
  }

  onOrganizationChange() {
    this.orgService.setCurrentOrganization(this.selectedOrgId);
    this.toastService.show({
      type: "info",
      message: this.selectedOrgId
        ? `Switched to ${
            this.organizations.find((o) => o.id === this.selectedOrgId)?.name
          }`
        : "Viewing all organizations",
    });
  }
}
