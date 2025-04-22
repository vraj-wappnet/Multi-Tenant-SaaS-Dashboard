import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { OrganizationService } from "../../../core/services/organization.service";
import {
  Organization,
  OrganizationPlan,
  OrganizationStatus,
} from "../../../shared/models/organization.model";
import { ToastService } from "../../../core/services/toast.service";

@Component({
  selector: "app-organization-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div class="page-title">
          <h1>{{ isEditMode ? "Edit" : "Add" }} Organization</h1>
          <p class="text-muted">
            {{
              isEditMode
                ? "Update organization details"
                : "Create a new organization"
            }}
          </p>
        </div>
      </div>

      @if (loading) {
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading organization data...</p>
      </div>
      } @else {
      <div class="card">
        <form (ngSubmit)="onSubmit()" #orgForm="ngForm">
          <div class="card-body">
            @if (errorMessage) {
            <div class="alert alert-danger mb-4">{{ errorMessage }}</div>
            }

            <div class="form-section">
              <h3>Basic Information</h3>

              <div class="form-control">
                <label for="name" class="form-label">Organization Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  class="form-input"
                  [(ngModel)]="organization.name"
                  required
                  #nameInput="ngModel"
                />
                @if (nameInput.invalid && (nameInput.dirty ||
                nameInput.touched)) {
                <div class="form-error">Organization name is required</div>
                }
              </div>

              <div class="form-control">
                <label for="industry" class="form-label">Industry *</label>
                <select
                  id="industry"
                  name="industry"
                  class="form-select"
                  [(ngModel)]="organization.industry"
                  required
                  #industryInput="ngModel"
                >
                  <option value="" disabled>Select an industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
                @if (industryInput.invalid && (industryInput.dirty ||
                industryInput.touched)) {
                <div class="form-error">Industry is required</div>
                }
              </div>

              <div class="form-control">
                <label for="logo" class="form-label">Logo URL</label>
                <input
                  type="text"
                  id="logo"
                  name="logo"
                  class="form-input"
                  [(ngModel)]="organization.logo"
                  placeholder="https://example.com/logo.png"
                />
                @if (organization.logo) {
                <div class="logo-preview">
                  <img
                    [src]="organization.logo"
                    alt="Logo preview"
                    width="50"
                    height="50"
                  />
                </div>
                }
              </div>
            </div>

            <div class="form-section">
              <h3>Plan & Status</h3>

              <div class="form-control">
                <label for="plan" class="form-label">Subscription Plan *</label>
                <select
                  id="plan"
                  name="plan"
                  class="form-select"
                  [(ngModel)]="organization.plan"
                  required
                  #planInput="ngModel"
                >
                  <option value="" disabled>Select a plan</option>
                  <option value="FREE">Free</option>
                  <option value="PRO">Pro</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
                @if (planInput.invalid && (planInput.dirty ||
                planInput.touched)) {
                <div class="form-error">Plan is required</div>
                }

                <div class="plan-details mt-2">
                  @if (organization.plan === 'FREE') {
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    Basic features
                  </div>
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    Up to 5 users
                  </div>
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    10,000 API calls per month
                  </div>
                  } @else if (organization.plan === 'PRO') {
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    All Free features
                  </div>
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    Unlimited users
                  </div>
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    50,000 API calls per month
                  </div>
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    Advanced reporting
                  </div>
                  } @else if (organization.plan === 'ENTERPRISE') {
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    All Pro features
                  </div>
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    Unlimited API calls
                  </div>
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    Custom branding
                  </div>
                  <div class="plan-detail">
                    <span class="plan-icon">✓</span>
                    Dedicated support
                  </div>
                  }
                </div>
              </div>

              <div class="form-control">
                <label for="status" class="form-label">Status *</label>
                <select
                  id="status"
                  name="status"
                  class="form-select"
                  [(ngModel)]="organization.status"
                  required
                  #statusInput="ngModel"
                >
                  <option value="" disabled>Select a status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                @if (statusInput.invalid && (statusInput.dirty ||
                statusInput.touched)) {
                <div class="form-error">Status is required</div>
                } @if (organization.status === 'SUSPENDED') {
                <div class="alert alert-warning mt-2">
                  <strong>Note:</strong> Suspended organizations will have all
                  users disabled and cannot access the system.
                </div>
                }
              </div>
            </div>
          </div>

          <div class="card-footer">
            <button type="button" class="btn btn-secondary" (click)="goBack()">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="orgForm.invalid || isSaving"
            >
              @if (isSaving) {
              <span class="loading-spinner"></span>
              <span>Saving...</span>
              } @else {
              <span>{{ isEditMode ? "Update" : "Create" }} Organization</span>
              }
            </button>
          </div>
        </form>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
        margin: 0 auto;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-12);
      }

      .form-section {
        margin-bottom: var(--space-6);
      }

      .form-section h3 {
        margin-bottom: var(--space-3);
        padding-bottom: var(--space-2);
        border-bottom: 1px solid var(--border-color);
      }

      .logo-preview {
        margin-top: var(--space-2);
        width: 50px;
        height: 50px;
        border-radius: var(--radius-sm);
        overflow: hidden;
        border: 1px solid var(--border-color);
      }

      .logo-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .plan-details {
        margin-top: var(--space-2);
      }

      .plan-detail {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-1);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .plan-icon {
        color: var(--success-600);
        font-weight: bold;
      }

      .card-footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
      }
    `,
  ],
})
export class OrganizationFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private toastService = inject(ToastService);

  organization: Partial<Organization> = {
    name: "",
    industry: "",
    logo: "https://via.placeholder.com/100?text=Logo",
    plan: "FREE" as OrganizationPlan,
    status: "ACTIVE" as OrganizationStatus,
  };

  isEditMode = false;
  organizationId = "";
  loading = false;
  isSaving = false;
  errorMessage = "";

  ngOnInit() {
    this.organizationId = this.route.snapshot.params["id"];
    this.isEditMode = !!this.organizationId;

    if (this.isEditMode) {
      this.loadOrganization();
    }
  }

  loadOrganization() {
    this.loading = true;

    this.orgService.getOrganization(this.organizationId).subscribe({
      next: (org) => {
        this.organization = { ...org };
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading organization:", error);
        this.toastService.show({
          type: "error",
          message: "Error loading organization",
        });
        this.loading = false;
        this.goBack();
      },
    });
  }

  onSubmit() {
    this.isSaving = true;
    this.errorMessage = "";

    if (this.isEditMode) {
      this.orgService
        .updateOrganization(this.organizationId, this.organization)
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.router.navigate(["/organizations"]);
          },
          error: (error) => {
            this.isSaving = false;
            this.errorMessage = error;
            console.error("Error updating organization:", error);
          },
        });
    } else {
      this.orgService
        .createOrganization(
          this.organization as Omit<Organization, "id" | "createdAt">
        )
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.router.navigate(["/organizations"]);
          },
          error: (error) => {
            this.isSaving = false;
            this.errorMessage = error;
            console.error("Error creating organization:", error);
          },
        });
    }
  }

  goBack() {
    this.router.navigate(["/organizations"]);
  }
}
