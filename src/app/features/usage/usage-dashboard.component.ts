import {
  Component,
  inject,
  AfterViewInit,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { UsageService } from "../../core/services/usage.service";
import { OrganizationService } from "../../core/services/organization.service";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../core/services/toast.service";
import { Organization } from "../../shared/models/organization.model";

declare var Chart: any;

@Component({
  selector: "app-usage-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div class="page-title">
          <h1>Usage Dashboard</h1>
          <p class="text-muted">
            @if (currentOrg) { Monitor usage metrics for {{ currentOrg.name }}
            } @else if (isSuperAdmin) { Select an organization to view its usage
            metrics }
          </p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" (click)="exportData('csv')">
            Export CSV
          </button>
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
      } @else if (loading) {
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading usage data...</p>
      </div>
      } @else if (usageData && organizationId) {
      <div class="date-range-filters">
        <div class="form-control">
          <label class="form-label">Date Range</label>
          <div class="date-inputs">
            <div>
              <label for="start-date" class="filter-sublabel">Start Date</label>
              <input
                type="date"
                id="start-date"
                class="form-input"
                [(ngModel)]="startDate"
                (change)="onDateChange()"
              />
            </div>
            <div>
              <label for="end-date" class="filter-sublabel">End Date</label>
              <input
                type="date"
                id="end-date"
                class="form-input"
                [(ngModel)]="endDate"
                (change)="onDateChange()"
              />
            </div>
            <button class="btn btn-secondary" (click)="resetDateFilters()">
              Reset
            </button>
          </div>
        </div>
      </div>

      <div class="usage-metrics">
        <div class="metric-card api-calls">
          <div class="metric-header">
            <h2>API Calls</h2>
            <div class="quota-info">
              <div class="quota-text">
                <span class="quota-used">{{
                  getLatestValue(usageData.apiCalls.values) | number
                }}</span>
                /
                <span class="quota-total">{{
                  quotaData?.apiCallsLimit | number
                }}</span>
              </div>
              <div class="quota-bar">
                <div
                  class="quota-progress"
                  [style.width.%]="
                    getQuotaPercentage(
                      getLatestValue(usageData.apiCalls.values),
                      quotaData?.apiCallsLimit
                    )
                  "
                  [ngClass]="{
                    'quota-warning': isApproachingLimit(
                      getLatestValue(usageData.apiCalls.values),
                      quotaData?.apiCallsLimit
                    )
                  }"
                ></div>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <canvas #apiCallsChart></canvas>
          </div>
        </div>

        <div class="metric-card active-users">
          <div class="metric-header">
            <h2>Monthly Active Users</h2>
            <div class="quota-info">
              <div class="quota-text">
                <span class="quota-used">{{
                  getLatestValue(usageData.activeUsers.values) | number
                }}</span>
                /
                <span class="quota-total">{{
                  quotaData?.activeUsersLimit | number
                }}</span>
              </div>
              <div class="quota-bar">
                <div
                  class="quota-progress"
                  [style.width.%]="
                    getQuotaPercentage(
                      getLatestValue(usageData.activeUsers.values),
                      quotaData?.activeUsersLimit
                    )
                  "
                  [ngClass]="{
                    'quota-warning': isApproachingLimit(
                      getLatestValue(usageData.activeUsers.values),
                      quotaData?.activeUsersLimit
                    )
                  }"
                ></div>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <canvas #activeUsersChart></canvas>
          </div>
        </div>

        <div class="metric-card storage">
          <div class="metric-header">
            <h2>Storage Usage (MB)</h2>
            <div class="quota-info">
              <div class="quota-text">
                <span class="quota-used">{{
                  getLatestValue(usageData.storage.values) | number
                }}</span>
                /
                <span class="quota-total">{{
                  quotaData?.storageLimit | number
                }}</span>
              </div>
              <div class="quota-bar">
                <div
                  class="quota-progress"
                  [style.width.%]="
                    getQuotaPercentage(
                      getLatestValue(usageData.storage.values),
                      quotaData?.storageLimit
                    )
                  "
                  [ngClass]="{
                    'quota-warning': isApproachingLimit(
                      getLatestValue(usageData.storage.values),
                      quotaData?.storageLimit
                    )
                  }"
                ></div>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <canvas #storageChart></canvas>
          </div>
        </div>
      </div>
      } @else {
      <div class="alert alert-info">
        Please select an organization to view usage data.
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

      .page-actions {
        display: flex;
        gap: var(--space-2);
      }

      .org-selector-card {
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        padding: var(--space-6);
        margin-bottom: var(--space-6);
        box-shadow: var(--shadow-md);
      }

      .date-range-filters {
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        padding: var(--space-4) var(--space-6);
        margin-bottom: var(--space-6);
        box-shadow: var(--shadow-md);
      }

      .date-inputs {
        display: flex;
        gap: var(--space-4);
        align-items: flex-end;
      }

      .filter-sublabel {
        display: block;
        font-size: var(--text-xs);
        color: var(--text-secondary);
        margin-bottom: var(--space-1);
      }

      .usage-metrics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-6);
      }

      .metric-card {
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        overflow: hidden;
        padding: var(--space-6);
      }

      .metric-card.storage {
        grid-column: span 2;
      }

      .metric-header {
        margin-bottom: var(--space-4);
      }

      .metric-header h2 {
        margin-bottom: var(--space-2);
        font-size: var(--text-xl);
      }

      .quota-info {
        margin-top: var(--space-2);
      }

      .quota-text {
        display: flex;
        justify-content: flex-end;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        margin-bottom: var(--space-1);
      }

      .quota-used {
        font-weight: 600;
        color: var(--text-primary);
      }

      .quota-bar {
        height: 6px;
        background-color: var(--neutral-200);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }

      .quota-progress {
        height: 100%;
        background-color: var(--primary-500);
        border-radius: var(--radius-sm);
        transition: width var(--transition-normal) ease-in-out;
      }

      .quota-progress.quota-warning {
        background-color: var(--warning-500);
      }

      .chart-container {
        height: 250px;
        position: relative;
      }

      @media (max-width: 992px) {
        .usage-metrics {
          grid-template-columns: 1fr;
        }

        .metric-card.storage {
          grid-column: span 1;
        }
      }

      @media (max-width: 768px) {
        .date-inputs {
          flex-direction: column;
          gap: var(--space-3);
          align-items: stretch;
        }

        .page-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class UsageDashboardComponent implements AfterViewInit {
  @ViewChild("apiCallsChart") apiCallsChartRef!: ElementRef;
  @ViewChild("activeUsersChart") activeUsersChartRef!: ElementRef;
  @ViewChild("storageChart") storageChartRef!: ElementRef;

  private usageService = inject(UsageService);
  private orgService = inject(OrganizationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  organizations: Organization[] = [];
  selectedOrgId: string | null = null;
  currentOrg: Organization | null = null;

  usageData: any = null;
  quotaData: any = null;
  loading = false;

  // Chart objects
  apiCallsChart: any;
  activeUsersChart: any;
  storageChart: any;

  // Date filters
  startDate: string = "";
  endDate: string = "";

  get organizationId(): string | null {
    return this.selectedOrgId;
  }

  get isSuperAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === "SUPER_ADMIN";
  }

  constructor() {
    // Initialize date filters to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.endDate = today.toISOString().split("T")[0];
    this.startDate = thirtyDaysAgo.toISOString().split("T")[0];
  }

  ngOnInit() {
    // Subscribe to currentUser changes for reactive role updates
    this.authService.currentUser$.subscribe((user) => {
      // Reload organizations and data when user changes
      if (user?.role === "SUPER_ADMIN") {
        this.loadOrganizations();
      } else if (user?.organizationId) {
        this.selectedOrgId = user.organizationId;
        this.loadOrganizationData();
      } else {
        this.selectedOrgId = null;
        this.currentOrg = null;
        this.organizations = [];
        this.usageData = null;
        this.quotaData = null;
      }
    });

    // Listen for organization selection from sidebar
    this.orgService.currentOrgId$.subscribe((orgId) => {
      if (orgId) {
        this.selectedOrgId = orgId;
        this.loadOrganizationData();
      }
    });
  }

  ngAfterViewInit() {
    // Charts are initialized after data is loaded
  }

  private loadOrganizations() {
    this.orgService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
      },
      error: (error) => {
        console.error("Error loading organizations:", error);
        this.toastService.show({
          type: "error",
          message: "Error loading organizations",
        });
      },
    });
  }

  onOrganizationChange() {
    if (this.selectedOrgId) {
      this.loadOrganizationData();
    }
  }

  loadOrganizationData() {
    if (!this.selectedOrgId) return;

    // Load organization details
    this.orgService.getOrganization(this.selectedOrgId).subscribe({
      next: (org) => {
        this.currentOrg = org;
        this.loadUsageData();
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

  loadUsageData() {
    if (!this.selectedOrgId) return;

    this.loading = true;

    // Load usage quota
    this.usageService.getUsageQuota(this.selectedOrgId).subscribe({
      next: (quotaData) => {
        this.quotaData = quotaData;
      },
      error: (error) => {
        console.error("Error loading quota data:", error);
        this.toastService.show({
          type: "error",
          message: "Error loading quota data",
        });
      },
    });

    // Load usage data
    const dateRange = this.getDateRange();
    this.usageService.getUsageData(this.selectedOrgId, dateRange).subscribe({
      next: (usageData) => {
        this.usageData = usageData;
        this.loading = false;

        // Initialize charts after data is loaded
        setTimeout(() => {
          this.initCharts();
        }, 0);
      },
      error: (error) => {
        console.error("Error loading usage data:", error);
        this.toastService.show({
          type: "error",
          message: "Error loading usage data",
        });
        this.loading = false;
      },
    });
  }

  getDateRange() {
    if (!this.startDate || !this.endDate) return undefined;

    return {
      start: new Date(this.startDate),
      end: new Date(this.endDate),
    };
  }

  onDateChange() {
    this.loadUsageData();
  }

  resetDateFilters() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.endDate = today.toISOString().split("T")[0];
    this.startDate = thirtyDaysAgo.toISOString().split("T")[0];

    this.loadUsageData();
  }

  initCharts() {
    if (!this.usageData) return;

    // Load Chart.js dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = () => {
      this.createCharts();
    };
    document.head.appendChild(script);
  }

  createCharts() {
    if (!this.usageData || typeof Chart === "undefined") return;

    // Destroy existing charts if they exist
    if (this.apiCallsChart) this.apiCallsChart.destroy();
    if (this.activeUsersChart) this.activeUsersChart.destroy();
    if (this.storageChart) this.storageChart.destroy();

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    };

    // API Calls Chart
    this.apiCallsChart = new Chart(this.apiCallsChartRef.nativeElement, {
      type: "line",
      data: {
        labels: this.usageData.apiCalls.dates,
        datasets: [
          {
            label: "API Calls",
            data: this.usageData.apiCalls.values,
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      },
      options: chartOptions,
    });

    // Active Users Chart
    this.activeUsersChart = new Chart(this.activeUsersChartRef.nativeElement, {
      type: "line",
      data: {
        labels: this.usageData.activeUsers.dates,
        datasets: [
          {
            label: "Active Users",
            data: this.usageData.activeUsers.values,
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      },
      options: chartOptions,
    });

    // Storage Chart
    this.storageChart = new Chart(this.storageChartRef.nativeElement, {
      type: "line",
      data: {
        labels: this.usageData.storage.dates,
        datasets: [
          {
            label: "Storage (MB)",
            data: this.usageData.storage.values,
            backgroundColor: "rgba(139, 92, 246, 0.2)",
            borderColor: "rgba(139, 92, 246, 1)",
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      },
      options: chartOptions,
    });
  }

  getLatestValue(values: number[]): number {
    if (!values || values.length === 0) return 0;
    return values[values.length - 1];
  }

  getQuotaPercentage(used: number, total: number | undefined): number {
    if (!total || total === 0) return 0;
    const percentage = (used / total) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  }

  isApproachingLimit(used: number, total: number | undefined): boolean {
    if (!total) return false;
    return used / total > 0.8; // Warning when above 80%
  }

  exportData(format: "csv" | "pdf") {
    if (!this.selectedOrgId) {
      this.toastService.show({
        type: "warning",
        message: "Please select an organization to export data",
      });
      return;
    }

    this.usageService.exportUsageData(this.selectedOrgId, format).subscribe({
      next: (result) => {
        if (format === "csv") {
          // Create a Blob for the CSV content
          const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });

          // Create a download link
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute(
            "download",
            `usage_data_${this.currentOrg?.name || this.selectedOrgId}_${
              new Date().toISOString().split("T")[0]
            }.csv`
          );
          link.style.visibility = "hidden";

          // Trigger the download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          this.toastService.show({
            type: "success",
            message: "Usage data exported as CSV",
          });
        } else {
          this.toastService.show({
            type: "info",
            message: "PDF export not supported",
          });
        }
      },
      error: (error) => {
        console.error("Error exporting data:", error);
        this.toastService.show({
          type: "error",
          message: `Error exporting data as ${format.toUpperCase()}`,
        });
      },
    });
  }
}
