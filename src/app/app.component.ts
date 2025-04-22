import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { DashboardLayoutComponent } from "./core/layouts/dashboard-layout/dashboard-layout.component";
import { ThemeService } from "./core/services/theme.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashboardLayoutComponent],
  template: `
    <div class="app-container" [ngClass]="{ 'dark-theme': isDarkMode }">
      <app-dashboard-layout>
        <router-outlet></router-outlet>
      </app-dashboard-layout>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      .dark-theme {
        --bg-primary: #121212;
        --bg-secondary: #1e1e1e;
        --bg-tertiary: #2d2d2d;
        --text-primary: #f8f8f8;
        --text-secondary: #b3b3b3;
        --border-color: #444444;
      }
    `,
  ],
})
export class AppComponent {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {
    this.themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }
}
