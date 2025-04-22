import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { FeatureService } from "../../core/services/feature.service";
import { OrganizationService } from "../../core/services/organization.service";
import { Organization } from "../../shared/models/organization.model";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../core/services/toast.service";
import { Feature } from "../../shared/models/feature.model";

@Component({
  selector: "app-feature-toggles",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div class="page-title">
          <h1>Feature Toggles</h1>
          <p class="text-muted">
            @if (isSuperAdmin && currentOrg) { Manage feature toggles for
            {{ currentOrg.name }}
            } @else if (isSuperAdmin) { Select an organization to manage its
            features } @else { Manage feature toggles for your organization }
          </p>
        </div>
      </div>

      @if (isSuperAdmin && !organizationId) {
      <div class="org-selector-card">
        <div class="form-control">
          <label for="org-select" class="form-label">Select Organization</label>
          <select
            id="org-select"
            class="form-select"
            [(ngModel)]="selectedOrgId"
            (change)="onOrganizationChange()"
          >
            <option [value]="null" disabled>Choose an organization</option>
            @for (org of organizations; track org.id) {
            <option [value]="org.id">{{ org.name }} ({{ org.plan }})</option>
            }
          </select>
        </div>
      </div>
      } @if (loading) {
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading features...</p>
      </div>
      } @else if (organizationId) {
      <div class="feature-toggles-header">
        <div class="plan-info">
          <span
            class="badge"
            [ngClass]="{
              'badge-primary': currentOrg?.plan === 'FREE',
              'badge-success': currentOrg?.plan === 'PRO',
              'badge-warning': currentOrg?.plan === 'ENTERPRISE'
            }"
          >
            {{ currentOrg?.plan }} Plan
          </span>
          @if (currentOrg?.plan === 'FREE') {
          <div class="plan-upgrade-info">
            <a href="#">Upgrade to Pro</a> to unlock more features
          </div>
          }
        </div>
      </div>

      <div class="card">
        <div class="feature-toggles-table">
          <table class="table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Description</th>
                <th>Available On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (item of orgFeatures; track item.feature.id) {
              <tr [class.disabled-feature]="!item.canToggle">
                <td>{{ item.feature.name }}</td>
                <td>{{ item.feature.description }}</td>
                <td>
                  <div class="plan-badges">
                    @for (plan of item.feature.availableOnPlans; track plan) {
                    <span
                      class="plan-badge"
                      [ngClass]="{
                        'plan-badge-free': plan === 'FREE',
                        'plan-badge-pro': plan === 'PRO',
                        'plan-badge-enterprise': plan === 'ENTERPRISE'
                      }"
                    >
                      {{ plan }}
                    </span>
                    }
                  </div>
                </td>
                <td>
                  <div class="toggle-container">
                    <div
                      class="feature-toggle"
                      [class.disabled]="!item.canToggle"
                    >
                      <input
                        type="checkbox"
                        [id]="'feature-' + item.feature.id"
                        [checked]="item.isEnabled"
                        [disabled]="
                          !item.canToggle || toggling[item.feature.id]
                        "
                        (change)="toggleFeature(item.feature, $event)"
                      />
                      <label
                        [for]="'feature-' + item.feature.id"
                        [title]="
                          !item.canToggle
                            ? 'Not available on ' + currentOrg?.plan + ' plan'
                            : ''
                        "
                      >
                        <span class="toggle-switch"></span>
                      </label>
                    </div>
                    @if (toggling[item.feature.id]) {
                    <div class="loading-spinner toggle-spinner"></div>
                    } @else {
                    <span class="toggle-status">{{
                      item.isEnabled ? "Enabled" : "Disabled"
                    }}</span>
                    } @if (!item.canToggle) {
                    <div class="toggle-tooltip">
                      Not available on {{ currentOrg?.plan }} plan. Upgrade to
                      @if (currentOrg?.plan === 'FREE' &&
                      item.feature.availableOnPlans.includes('PRO')) { PRO }
                      @else { ENTERPRISE } to enable this feature.
                    </div>
                    }
                  </div>
                </td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      } @else {
      <div class="alert alert-info">
        Please select an organization to manage its features.
      </div>
      }
    </div>
  `,
  styles: [
    `
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

      .org-selector-card {
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        margin-bottom: var(--space-6);
        box-shadow: var(--shadow-md);
      }

      .feature-toggles-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--space-4);
      }

      .plan-info {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }

      .plan-upgrade-info {
        font-size: var(--text-sm);
      }

      .plan-upgrade-info a {
        color: var(--primary-600);
        text-decoration: none;
        font-weight: 500;
      }

      .plan-upgrade-info a:hover {
        text-decoration: underline;
      }

      .plan-badges {
        display: flex;
        gap: var(--space-1);
      }

      .plan-badge {
        font-size: 0.7rem;
        padding: 0.1rem 0.3rem;
        border-radius: var(--radius-sm);
      }

      .plan-badge-free {
        background-color: var(--primary-100);
        color: var(--primary-800);
      }

      .plan-badge-pro {
        background-color: var(--success-100);
        color: var(--success-800);
      }

      .plan-badge-enterprise {
        background-color: var(--warning-100);
        color: var(--warning-800);
      }

      .toggle-container {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        position: relative;
      }

      .feature-toggle {
        position: relative;
        display: inline-block;
      }

      .feature-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-switch {
        display: inline-block;
        width: 36px;
        height: 20px;
        background-color: var(--neutral-300);
        border-radius: 10px;
        position: relative;
        transition: background-color 0.3s;
        cursor: pointer;
      }

      .toggle-switch::after {
        content: "";
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: white;
        top: 2px;
        left: 2px;
        transition: transform 0.3s;
      }

      .feature-toggle input:checked + label .toggle-switch {
        background-color: var(--success-500);
      }

      .feature-toggle input:checked + label .toggle-switch::after {
        transform: translateX(16px);
      }

      .feature-toggle.disabled .toggle-switch {
        background-color: var(--neutral-200);
        cursor: not-allowed;
      }

      .toggle-status {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .toggle-spinner {
        width: 16px;
        height: 16px;
        border-width: 2px;
      }

      .toggle-tooltip {
        position: absolute;
        bottom: 100%;
        left: 0;
        width: 200px;
        padding: var(--space-2);
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        font-size: var(--text-xs);
        z-index: 10;
        display: none;
        border: 1px solid var(--border-color);
      }

      .toggle-container:hover .toggle-tooltip {
        display: block;
      }

      .disabled-feature {
        opacity: 0.7;
      }

      @media (max-width: 768px) {
        .feature-toggles-table {
          overflow-x: auto;
        }
      }
    `,
  ],
})
export class FeatureTogglesComponent {
  private route = inject(ActivatedRoute);
  private featureService = inject(FeatureService);
  private orgService = inject(OrganizationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  organizations: Organization[] = [];
  selectedOrgId: string | null = null;
  currentOrg: Organization | null = null;
  features: Feature[] = [];
  orgFeatures: { feature: Feature; isEnabled: boolean; canToggle: boolean }[] =
    [];

  loading = true;
  toggling: { [key: string]: boolean } = {};

  // If the route has an organizationId parameter, use that instead of selection
  get organizationId(): string | null {
    return this.route.snapshot.params["id"] || this.selectedOrgId;
  }

  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === "SUPER_ADMIN";
  }

  ngOnInit() {
    // Load organizations for super admin
    if (this.isSuperAdmin) {
      this.orgService.getOrganizations().subscribe((orgs) => {
        this.organizations = orgs;

        // If route has organization ID, set it as selected
        if (this.route.snapshot.params["id"]) {
          this.selectedOrgId = this.route.snapshot.params["id"];
          this.loadOrganizationData();
        }
      });
    } else {
      // For org admin, use their organization
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
    if (!this.organizationId) return;

    this.loading = true;

    // Load organization details
    this.orgService.getOrganization(this.organizationId).subscribe({
      next: (org) => {
        this.currentOrg = org;
        this.loadFeatures();
      },
      error: (error) => {
        console.error("Error loading organization:", error);
        this.toastService.show({
          type: "error",
          message: "Error loading organization",
        });
        this.loading = false;
      },
    });
  }

  loadFeatures() {
    if (!this.organizationId) return;

    this.featureService.getOrganizationFeatures(this.organizationId).subscribe({
      next: (features) => {
        this.orgFeatures = features;
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading features:", error);
        this.toastService.show({
          type: "error",
          message: "Error loading feature configurations",
        });
        this.loading = false;
      },
    });
  }

  toggleFeature(feature: Feature, event: Event) {
    if (!this.organizationId) return;

    const isEnabled = (event.target as HTMLInputElement).checked;

    // Set toggling state
    this.toggling[feature.id] = true;

    this.featureService
      .toggleFeature(this.organizationId, feature.id, isEnabled)
      .subscribe({
        next: () => {
          // Update toggling state
          setTimeout(() => {
            this.toggling[feature.id] = false;
          }, 200);
        },
        error: (error) => {
          console.error("Error toggling feature:", error);
          this.toastService.show({
            type: "error",
            message: "Error toggling feature",
          });
          this.toggling[feature.id] = false;
          // Revert the toggle
          const updatedFeatures = this.orgFeatures.map((item) => {
            if (item.feature.id === feature.id) {
              return { ...item, isEnabled: !isEnabled };
            }
            return item;
          });
          this.orgFeatures = updatedFeatures;
        },
      });
  }
}
