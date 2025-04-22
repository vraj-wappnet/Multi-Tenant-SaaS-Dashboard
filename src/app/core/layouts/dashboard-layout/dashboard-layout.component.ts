import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ThemeService } from "../../services/theme.service";
import { AuthService } from "../../services/auth.service";
import { OrganizationService } from "../../services/organization.service";
import { Organization } from "../../../shared/models/organization.model";
import { User } from "../../../shared/models/user.model";
import { FormsModule } from "@angular/forms";
import { ToastService } from "../../services/toast.service";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "app-dashboard-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside
        class="sidebar"
        [class.collapsed]="sidebarCollapsed"
        [class.mobile-open]="mobileOpen"
      >
        <div class="sidebar-header">
          <h1 class="sidebar-logo">SaaSHub</h1>
          <button class="sidebar-toggle" (click)="toggleSidebar()">
            <mat-icon
              class="toggle-icon"
              [matTooltip]="
                sidebarCollapsed ? 'Toggle Sidebar' : 'Collapse Sidebar'
              "
              [matTooltipDisabled]="mobileOpen"
            >
              {{ sidebarCollapsed ? "chevron_right" : "chevron_left" }}
            </mat-icon>
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
                  <mat-icon
                    class="nav-icon"
                    matTooltip="Dashboard"
                    [matTooltipDisabled]="!sidebarCollapsed && !mobileOpen"
                  >
                    dashboard
                  </mat-icon>
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
                  <mat-icon
                    class="nav-icon"
                    matTooltip="Organizations"
                    [matTooltipDisabled]="!sidebarCollapsed && !mobileOpen"
                  >
                    business
                  </mat-icon>
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
                  <mat-icon
                    class="nav-icon"
                    matTooltip="Users"
                    [matTooltipDisabled]="!sidebarCollapsed && !mobileOpen"
                  >
                    group
                  </mat-icon>
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
                  <mat-icon
                    class="nav-icon"
                    matTooltip="Feature Toggles"
                    [matTooltipDisabled]="!sidebarCollapsed && !mobileOpen"
                  >
                    toggle_on
                  </mat-icon>
                  <span class="nav-text">Feature Toggles</span>
                </a>
              </li>
              <li class="nav-item">
                <a
                  routerLink="/usage"
                  routerLinkActive="active"
                  class="nav-link"
                >
                  <mat-icon
                    class="nav-icon"
                    matTooltip="Usage"
                    [matTooltipDisabled]="!sidebarCollapsed && !mobileOpen"
                  >
                    bar_chart
                  </mat-icon>
                  <span class="nav-text">Usage</span>
                </a>
              </li>
              }

              <!-- Logout Button -->
              @if (currentUser) {
              <li class="nav-item">
                <button class="nav-link logout-btn" (click)="logout()">
                  <mat-icon
                    class="nav-icon"
                    matTooltip="Logout"
                    [matTooltipDisabled]="!sidebarCollapsed && !mobileOpen"
                  >
                    logout
                  </mat-icon>
                  <span class="nav-text">Logout</span>
                </button>
              </li>
              }
            </ul>
          </nav>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      <div
        class="sidebar-overlay"
        [class.active]="mobileOpen"
        (click)="closeMobileSidebar()"
      ></div>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <button
              class="menu-toggle"
              (click)="toggleMobileSidebar()"
              matTooltip="Open Sidebar"
            >
              <mat-icon>menu</mat-icon>
            </button>
            <h2 class="header-title">{{ pageTitle }}</h2>
          </div>
          <div class="header-right">
            <button
              class="theme-toggle"
              (click)="toggleTheme()"
              aria-label="Toggle theme"
              matTooltip="Toggle Theme"
            >
              <mat-icon class="toggle-icon">
                {{ isDarkMode ? "dark_mode" : "light_mode" }}
              </mat-icon>
            </button>
            <div class="user-info">
              <span class="user-name">{{ currentUser?.name ?? "Guest" }}</span>
              <span class="user-role badge badge-primary">{{
                currentUser?.role ?? ""
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
      :host {
        --sidebar-width: 280px;
        --sidebar-collapsed-width: 70px;
        --header-height: 64px;
        --transition-normal: 0.3s;
        --transition-fast: 0.2s;
        --tooltip-bg: #333333;
        --tooltip-text: #ffffff;
        --tooltip-border: #cccccc;
        --tooltip-radius: 4px;
        --tooltip-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }

      .dashboard-layout {
        display: flex;
        min-height: 100vh;
        position: relative;
      }

      /* Sidebar */
      .sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: var(--sidebar-width);
        background-color: var(--bg-tertiary);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        transition: all var(--transition-normal) ease-in-out;
        overflow-x: hidden;
        z-index: 1000;
      }

      .sidebar.collapsed {
        width: var(--sidebar-collapsed-width);
      }

      /* Sidebar Overlay for mobile */
      .sidebar-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        transition: opacity var(--transition-normal);
      }

      .sidebar-overlay.active {
        display: block;
        opacity: 1;
      }

      /* Main Content */
      .main-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: var(--sidebar-width);
        overflow-x: hidden;
        transition: margin-left var(--transition-normal) ease-in-out;
      }

      .sidebar.collapsed ~ .main-content {
        margin-left: var(--sidebar-collapsed-width);
      }

      .sidebar-header {
        padding: var(--space-4);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        flex-shrink: 0;
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
        padding: var(--space-4) 0;
        overflow-y: auto;
        flex: 1;
        &::-webkit-scrollbar {
          width: 8px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: var(--primary-600);
          border-radius: 4px;
        }
        &::-webkit-scrollbar-track {
          background-color: var(--bg-secondary);
        }
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

      .logout-btn {
        display: flex;
        align-items: center;
        background: none;
        border: none;
        cursor: pointer;
        width: 100%;
        padding: var(--space-3) var(--space-4);
        color: var(--text-secondary);
        transition: all var(--transition-fast) ease-in-out;
        border-left: 3px solid transparent;
      }

      .logout-btn:hover {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
      }

      /* Header */
      .header {
        height: var(--header-height);
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
        gap: var(--space-4);
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }

      .user-name {
        font-weight: 500;
      }

      .theme-toggle {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
      }

      .toggle-icon {
        font-size: 28px;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Page Content */
      .page-content {
        flex: 1;
        padding: var(--space-6);
        background-color: var(--bg-primary);
      }

      /* Toast Container */
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
      }

      .toast {
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: var(--space-3);
        margin-bottom: var(--space-2);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        animation: fadeIn 0.3s ease-in;
      }

      .toast-error {
        border-left: 4px solid var(--danger-600);
      }

      .toast-info {
        border-left: 4px solid var(--primary-600);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Tooltip Styles */
      :host ::ng-deep .mat-tooltip {
        background-color: blue; /* Blue background color */
        color: #ffffff; /* White text color */
        border-radius: 4px; /* Rounded corners */
        font-size: 12px; /* Font size */
        padding: 6px 10px; /* Padding */
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); /* Subtle shadow */
        max-width: 200px; /* Maximum width */
        white-space: normal; /* Allow wrapping */
        word-wrap: break-word; /* Break long words */
        margin-left: 8px; /* Margin for positioning */
        transform: translateX(-50%); /* Center tooltip horizontally */
        left: 50%; /* Position tooltip at the edge */
      }

      /* Responsive styles */
      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
          width: var(--sidebar-width);
        }

        .sidebar.mobile-open {
          transform: translateX(0);
        }

        .sidebar.collapsed {
          transform: translateX(-100%);
          width: var(--sidebar-width);
        }

        .sidebar.collapsed.mobile-open {
          transform: translateX(0);
        }

        .sidebar.collapsed .sidebar-logo,
        .sidebar.collapsed .nav-text,
        .sidebar.collapsed .org-selector {
          display: block;
        }

        .main-content {
          margin-left: 0 !important;
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
  mobileOpen = false;
  pageTitle = "Dashboard";
  currentUser: User | null = null;
  organizations: Organization[] = [];
  selectedOrgId: string | null = null;
  toasts: { id: string; type: string; message: string }[] = [];

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

    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.sidebarCollapsed = false;
      this.mobileOpen = false;

      if (this.isSuperAdmin) {
        this.orgService.getOrganizations().subscribe((orgs) => {
          this.organizations = orgs;
        });
      }
    });
  }

  toggleSidebar(): void {
    if (window.innerWidth <= 768) {
      this.mobileOpen = false;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  toggleMobileSidebar(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobileSidebar(): void {
    this.mobileOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.sidebarCollapsed = false;
    this.mobileOpen = false;
    this.authService.logout();
  }

  onOrganizationChange(): void {
    this.orgService.setCurrentOrganization(this.selectedOrgId);
    this.toastService.show({
      type: "info",
      message: this.selectedOrgId
        ? `Switched to ${
            this.organizations.find((o) => o.id === this.selectedOrgId)?.name
          }`
        : "Viewing all Organizations here...",
    });
  }
}
