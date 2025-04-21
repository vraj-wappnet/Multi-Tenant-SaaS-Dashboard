import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { OrganizationService } from "../../../core/services/organization.service";
import { Organization } from "../../../shared/models/organization.model";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-organizations-list",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="organizations-container">
      <div class="page-header">
        <div class="page-title">
          <h1>Organizations</h1>
          <p class="text-muted">Manage all organizations in the system</p>
        </div>
        <div class="page-actions">
          <a routerLink="/organizations/new" class="btn btn-primary">
            <span>+ Add Organization</span>
          </a>
        </div>
      </div>

      <div class="card mb-4">
        <div class="filters">
          <div class="search-box">
            <input
              type="text"
              class="form-input"
              placeholder="Search organizations..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
            />
          </div>

          <div class="status-filter">
            <select
              class="form-select"
              [(ngModel)]="statusFilter"
              (change)="onSearch()"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Industry</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (loading) {
              <tr>
                <td colspan="6" class="text-center py-4">
                  <div class="loading-spinner"></div>
                  <p>Loading organizations...</p>
                </td>
              </tr>
              } @else if (organizations.length === 0) {
              <tr>
                <td colspan="6" class="text-center py-4">
                  <p>No organizations found</p>
                  @if (searchQuery || statusFilter) {
                  <button
                    class="btn btn-secondary btn-sm mt-2"
                    (click)="clearFilters()"
                  >
                    Clear Filters
                  </button>
                  }
                </td>
              </tr>
              } @else { @for (org of organizations; track org.id) {
              <tr>
                <td>
                  <div class="org-name-cell">
                    <div class="org-name">{{ org.name }}</div>
                  </div>
                </td>
                <td>{{ org.industry }}</td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="{
                      'badge-primary': org.plan === 'FREE',
                      'badge-success': org.plan === 'PRO',
                      'badge-warning': org.plan === 'ENTERPRISE'
                    }"
                  >
                    {{ org.plan }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="{
                      'badge-success': org.status === 'ACTIVE',
                      'badge-danger': org.status === 'SUSPENDED'
                    }"
                  >
                    {{ org.status }}
                  </span>
                </td>
                <td>{{ org.createdAt | date : "MMM d, yyyy" }}</td>
                <td>
                  <div class="actions">
                    <a
                      [routerLink]="['/organizations', org.id]"
                      class="btn btn-sm btn-secondary"
                    >
                      View
                    </a>
                    <a
                      [routerLink]="['/organizations', org.id, 'edit']"
                      class="btn btn-sm btn-primary"
                    >
                      Edit
                    </a>
                    <button
                      class="btn btn-sm btn-danger"
                      (click)="toggleSuspendOrg(org)"
                    >
                      {{ org.status === "ACTIVE" ? "Suspend" : "Activate" }}
                    </button>
                  </div>
                </td>
              </tr>
              } }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <div class="pagination-info">
            Showing {{ organizations.length }} of {{ totalOrgs }} organizations
          </div>
          <div class="pagination-buttons">
            <button
              class="btn btn-sm btn-secondary"
              [disabled]="currentPage === 1"
              (click)="prevPage()"
            >
              Previous
            </button>
            <span class="pagination-current">Page {{ currentPage }}</span>
            <button
              class="btn btn-sm btn-secondary"
              [disabled]="isLastPage"
              (click)="nextPage()"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .organizations-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-6);
      }

      .page-title p {
        margin-top: var(--space-1);
      }

      .filters {
        display: flex;
        gap: var(--space-4);
        padding: var(--space-4);
      }

      .search-box {
        flex: 1;
      }

      .status-filter {
        width: 180px;
      }

      .org-name-cell {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .org-logo {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        overflow: hidden;
        background-color: var(--bg-secondary);
      }

      .org-logo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .org-name {
        font-weight: 500;
      }

      .actions {
        display: flex;
        gap: var(--space-2);
      }

      .pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-4);
        border-top: 1px solid var(--border-color);
      }

      .pagination-current {
        margin: 0 var(--space-3);
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

        .pagination {
          flex-direction: column;
          gap: var(--space-3);
        }
      }
    `,
  ],
})
export class OrganizationsListComponent {
  private orgService = inject(OrganizationService);
  private toastService = inject(ToastService);

  organizations: Organization[] = [];
  loading = true;
  searchQuery = "";
  statusFilter = "";

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalOrgs = 0;
  isLastPage = true;

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.loading = true;

    this.orgService
      .getOrganizations(this.searchQuery, this.statusFilter)
      .subscribe({
        next: (orgs) => {
          this.totalOrgs = orgs.length;

          // Apply pagination
          const start = (this.currentPage - 1) * this.pageSize;
          const end = start + this.pageSize;
          this.organizations = orgs.slice(start, end);

          this.isLastPage = end >= this.totalOrgs;
          this.loading = false;
        },
        error: (error) => {
          console.error("Error loading organizations:", error);
          this.toastService.show({
            type: "error",
            message: "Error loading organizations",
          });
          this.loading = false;
        },
      });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadOrganizations();
  }

  clearFilters() {
    this.searchQuery = "";
    this.statusFilter = "";
    this.onSearch();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadOrganizations();
    }
  }

  nextPage() {
    if (!this.isLastPage) {
      this.currentPage++;
      this.loadOrganizations();
    }
  }

  toggleSuspendOrg(org: Organization) {
    const newStatus = org.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const actionText = newStatus === "ACTIVE" ? "activate" : "suspend";

    if (confirm(`Are you sure you want to ${actionText} "${org.name}"?`)) {
      this.orgService
        .updateOrganization(org.id, { status: newStatus })
        .subscribe({
          next: (updatedOrg) => {
            // Update the organization in the current list
            const index = this.organizations.findIndex((o) => o.id === org.id);
            if (index !== -1) {
              this.organizations[index] = updatedOrg;
            }

            this.toastService.show({
              type: "success",
              message: `Organization ${
                newStatus === "ACTIVE" ? "activated" : "suspended"
              } successfully`,
            });
          },
          error: (error) => {
            console.error(`Error ${actionText}ing organization:`, error);
            this.toastService.show({
              type: "error",
              message: `Error ${actionText}ing organization`,
            });
          },
        });
    }
  }
}
