import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../core/services/user.service";
import { OrganizationService } from "../../../core/services/organization.service";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { User, UserRole, UserStatus } from "../../../shared/models/user.model";
import { Organization } from "../../../shared/models/organization.model";

@Component({
  selector: "app-user-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div class="page-title">
          <h1>{{ isEditMode ? "Edit" : "Add" }} User</h1>
          <p class="text-muted">
            {{ isEditMode ? "Update user details" : "Create a new user" }}
            @if (currentOrg) { for {{ currentOrg.name }}
            }
          </p>
        </div>
      </div>

      @if (loading) {
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
      } @else if (isSuperAdmin && !selectedOrgId && !isEditMode) {
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
            <option [value]="org.id">{{ org.name }}</option>
            }
          </select>
        </div>
      </div>
      } @else if (!canAddUser && !isEditMode) {
      <div class="alert alert-warning">
        <strong>User limit reached:</strong> {{ addUserTooltip }}
      </div>
      <button class="btn btn-secondary" (click)="goBack()">
        Back to Users
      </button>
      } @else {
      <div class="card">
        <form (ngSubmit)="onSubmit()" #userForm="ngForm">
          <div class="card-body">
            @if (errorMessage) {
            <div class="alert alert-danger mb-4">{{ errorMessage }}</div>
            } @if (emailCheckingStatus === 'checking') {
            <div class="alert alert-info mb-4">
              <div class="d-flex align-items-center gap-2">
                <div class="loading-spinner"></div>
                <span>Checking email availability...</span>
              </div>
            </div>
            } @else if (emailCheckingStatus === 'error') {
            <div class="alert alert-danger mb-4">
              This email is already in use by another user in this organization.
            </div>
            }

            <div class="form-section">
              <h3>User Information</h3>

              <div class="form-control">
                <label for="name" class="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  class="form-input"
                  [(ngModel)]="user.name"
                  required
                  #nameInput="ngModel"
                />
                @if (nameInput.invalid && (nameInput.dirty ||
                nameInput.touched)) {
                <div class="form-error">Name is required</div>
                }
              </div>

              <div class="form-control">
                <label for="email" class="form-label">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  class="form-input"
                  [(ngModel)]="user.email"
                  required
                  (blur)="checkEmailAvailability()"
                  [disabled]="isEditMode"
                  #emailInput="ngModel"
                />
                @if (emailInput.invalid && (emailInput.dirty ||
                emailInput.touched)) {
                <div class="form-error">Valid email is required</div>
                }
              </div>

              <div class="form-control">
                <label for="role" class="form-label">Role *</label>
                <select
                  id="role"
                  name="role"
                  class="form-select"
                  [(ngModel)]="user.role"
                  required
                  #roleInput="ngModel"
                >
                  <option value="" disabled>Select a role</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                  <option value="USER">Regular User</option>
                </select>
                @if (roleInput.invalid && (roleInput.dirty ||
                roleInput.touched)) {
                <div class="form-error">Role is required</div>
                }

                <div class="role-details mt-2">
                  @if (user.role === 'ORG_ADMIN') {
                  <div class="role-detail">
                    <span class="badge badge-warning">Admin</span>
                    Can manage users, feature toggles, and view usage data
                  </div>
                  } @else if (user.role === 'USER') {
                  <div class="role-detail">
                    <span class="badge badge-primary">User</span>
                    Basic access to features according to plan
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
                  [(ngModel)]="user.status"
                  required
                  #statusInput="ngModel"
                >
                  <option value="" disabled>Select a status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                @if (statusInput.invalid && (statusInput.dirty ||
                statusInput.touched)) {
                <div class="form-error">Status is required</div>
                } @if (user.status === 'INACTIVE') {
                <div class="alert alert-warning mt-2">
                  <strong>Note:</strong> Inactive users cannot log in to the
                  system.
                </div>
                }
              </div>
            </div>

            @if (!isEditMode) {
            <div class="form-section">
              <h3>Initial Password</h3>
              <div class="alert alert-info">
                <p>
                  A temporary password will be generated and sent to the user's
                  email address.
                </p>
                <p>They will be prompted to change it on first login.</p>
              </div>
            </div>
            }
          </div>

          <div class="card-footer">
            <button type="button" class="btn btn-secondary" (click)="goBack()">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="
                userForm.invalid ||
                isSaving ||
                emailCheckingStatus === 'checking' ||
                emailCheckingStatus === 'error'
              "
            >
              @if (isSaving) {
              <span class="loading-spinner"></span>
              <span>Saving...</span>
              } @else {
              <span>{{ isEditMode ? "Update" : "Create" }} User</span>
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

      .org-selector-card {
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        margin-bottom: var(--space-6);
        box-shadow: var(--shadow-md);
      }

      .form-section {
        margin-bottom: var(--space-6);
      }

      .form-section h3 {
        margin-bottom: var(--space-3);
        padding-bottom: var(--space-2);
        border-bottom: 1px solid var(--border-color);
      }

      .role-details {
        margin-top: var(--space-2);
      }

      .role-detail {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        margin-bottom: var(--space-1);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .card-footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
      }
    `,
  ],
})
export class UserFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private orgService = inject(OrganizationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  user: Partial<User> = {
    name: "",
    email: "",
    role: "USER" as UserRole,
    status: "ACTIVE" as UserStatus,
    organizationId: null,
  };

  organizations: Organization[] = [];
  currentOrg: Organization | null = null;
  selectedOrgId: string | null = null;

  isEditMode = false;
  userId = "";
  loading = false;
  isSaving = false;
  errorMessage = "";

  emailCheckTimeout: any;
  emailCheckingStatus: "idle" | "checking" | "valid" | "error" = "idle";

  canAddUser = true;
  addUserTooltip = "";

  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === "SUPER_ADMIN";
  }

  ngOnInit() {
    this.userId = this.route.snapshot.params["id"];
    this.isEditMode = !!this.userId;

    // For super admin, load organizations for selection
    if (this.isSuperAdmin) {
      this.orgService.getOrganizations().subscribe((orgs) => {
        this.organizations = orgs;
      });

      // Listen for organization selection from sidebar (only for super admin)
      this.orgService.currentOrgId$.subscribe((orgId) => {
        if (orgId) {
          this.selectedOrgId = orgId;
          this.user.organizationId = orgId;
          this.loadOrganizationData();
        }
      });
    } else {
      // For regular users and org admins, use their organization
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.organizationId) {
        this.selectedOrgId = currentUser.organizationId;
        this.user.organizationId = currentUser.organizationId;
        this.loadOrganizationData();
      }
    }

    if (this.isEditMode) {
      this.loadUser();
    }
  }

  onOrganizationChange() {
    if (this.selectedOrgId) {
      this.user.organizationId = this.selectedOrgId;
      this.loadOrganizationData();
    }
  }

  loadOrganizationData() {
    if (!this.selectedOrgId) return;

    // Load organization details
    this.orgService.getOrganization(this.selectedOrgId).subscribe({
      next: (org) => {
        this.currentOrg = org;
        this.checkUserLimit();
      },
      error: (error) => {
        console.error("Error loading organization:", error);
        this.toastService.show({
          type: "error",
          message: "Error loading organization",
        });
      },
    });
  }

  loadUser() {
    this.loading = true;

    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.user = { ...user };
        this.selectedOrgId = user.organizationId;

        if (user.organizationId) {
          this.loadOrganizationData();
        }

        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading user:", error);
        this.toastService.show({
          type: "error",
          message: "Error loading user",
        });
        this.loading = false;
        this.goBack();
      },
    });
  }

  checkUserLimit() {
    if (!this.selectedOrgId || this.isEditMode) return;

    this.userService
      .checkUserLimitForOrganization(this.selectedOrgId)
      .subscribe({
        next: (result) => {
          this.canAddUser = result.canAddUser;
          this.addUserTooltip = result.reason || "";
        },
        error: (error) => {
          console.error("Error checking user limit:", error);
        },
      });
  }

  checkEmailAvailability() {
    if (!this.user.email || !this.user.organizationId || this.isEditMode)
      return;

    // Clear any existing timeout
    if (this.emailCheckTimeout) {
      clearTimeout(this.emailCheckTimeout);
    }

    this.emailCheckingStatus = "checking";

    // Set a short timeout to avoid too many checks while typing
    this.emailCheckTimeout = setTimeout(() => {
      // Check if email exists in the same organization
      const emailExists = this.userService
        .getUsers(this.user.organizationId!)
        .subscribe((users) => {
          const exists = users.some(
            (u) => u.email.toLowerCase() === this.user.email!.toLowerCase()
          );

          if (exists) {
            this.emailCheckingStatus = "error";
          } else {
            this.emailCheckingStatus = "valid";
          }
        });
    }, 500);
  }

  onSubmit() {
    if (!this.user.organizationId) {
      this.errorMessage = "Organization is required";
      return;
    }

    this.isSaving = true;
    this.errorMessage = "";

    if (this.isEditMode) {
      this.userService.updateUser(this.userId, this.user).subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(["/users"]);
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = error;
          console.error("Error updating user:", error);
        },
      });
    } else {
      this.userService.createUser(this.user as Omit<User, "id">).subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(["/users"]);
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = error;
          console.error("Error creating user:", error);
        },
      });
    }
  }

  goBack() {
    this.router.navigate(["/users"]);
  }
}
