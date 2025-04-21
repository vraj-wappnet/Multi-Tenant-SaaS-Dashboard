// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { delay } from 'rxjs/operators';

// export interface UsageData {
//   apiCalls: {
//     dates: string[];
//     values: number[];
//   };
//   activeUsers: {
//     dates: string[];
//     values: number[];
//   };
//   storage: {
//     dates: string[];
//     values: number[];
//   };
// }

// export interface UsageQuota {
//   apiCallsLimit: number;
//   activeUsersLimit: number;
//   storageLimit: number;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class UsageService {

//   constructor() {}

//   // Generate realistic mock data for an organization
//   getUsageData(organizationId: string, dateRange?: {start: Date, end: Date}): Observable<UsageData> {
//     // Generate 30 days of data by default
//     const days = 30;
//     const now = new Date();
//     const dates: string[] = [];

//     // Create date strings for the past 30 days
//     for (let i = days - 1; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(now.getDate() - i);
//       dates.push(date.toISOString().split('T')[0]);
//     }

//     // Generate different patterns based on organization ID to make it look realistic
//     let apiCallsBase = 0;
//     let activeUsersBase = 0;
//     let storageBase = 0;

//     // Different baseline values based on organization
//     switch (organizationId) {
//       case 'org1': // Enterprise
//         apiCallsBase = 15000;
//         activeUsersBase = 250;
//         storageBase = 5000; // MB
//         break;
//       case 'org2': // Pro
//         apiCallsBase = 5000;
//         activeUsersBase = 85;
//         storageBase = 2000; // MB
//         break;
//       case 'org3': // Free
//         apiCallsBase = 1000;
//         activeUsersBase = 20;
//         storageBase = 500; // MB
//         break;
//       default:
//         apiCallsBase = 3000;
//         activeUsersBase = 50;
//         storageBase = 1000; // MB
//     }

//     // Generate values with some randomness and trends
//     const apiCallsValues = dates.map((_, index) => {
//       // Add weekly pattern (more during weekdays)
//       const dayOfWeek = new Date(dates[index]).getDay();
//       const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.2;

//       // Add some randomness
//       const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

//       // Add slight upward trend
//       const trendFactor = 1 + (index / dates.length) * 0.3;

//       return Math.round(apiCallsBase * weekdayFactor * randomFactor * trendFactor);
//     });

//     const activeUsersValues = dates.map((_, index) => {
//       // Less variance for users
//       const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1

//       // Slight weekly pattern
//       const dayOfWeek = new Date(dates[index]).getDay();
//       const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.9 : 1.1;

//       // Slight upward trend
//       const trendFactor = 1 + (index / dates.length) * 0.15;

//       return Math.round(activeUsersBase * randomFactor * weekdayFactor * trendFactor);
//     });

//     // Storage keeps increasing
//     const storageValues = dates.map((_, index) => {
//       // Storage generally increases
//       const growthFactor = 1 + (index / dates.length) * 0.25;

//       // Add small random fluctuations
//       const randomFactor = 0.99 + Math.random() * 0.02; // 0.99 to 1.01

//       return Math.round(storageBase * growthFactor * randomFactor);
//     });

//     return of({
//       apiCalls: {
//         dates,
//         values: apiCallsValues
//       },
//       activeUsers: {
//         dates,
//         values: activeUsersValues
//       },
//       storage: {
//         dates,
//         values: storageValues
//       }
//     }).pipe(delay(700));
//   }

//   getUsageQuota(organizationId: string): Observable<UsageQuota> {
//     // Different quotas based on plan
//     let quota: UsageQuota;

//     switch (organizationId) {
//       case 'org1': // Enterprise
//         quota = {
//           apiCallsLimit: 100000,
//           activeUsersLimit: 500,
//           storageLimit: 20000 // MB
//         };
//         break;
//       case 'org2': // Pro
//         quota = {
//           apiCallsLimit: 50000,
//           activeUsersLimit: 200,
//           storageLimit: 5000 // MB
//         };
//         break;
//       case 'org3': // Free
//         quota = {
//           apiCallsLimit: 10000,
//           activeUsersLimit: 50,
//           storageLimit: 1000 // MB
//         };
//         break;
//       default:
//         quota = {
//           apiCallsLimit: 10000,
//           activeUsersLimit: 50,
//           storageLimit: 1000 // MB
//         };
//     }

//     return of(quota).pipe(delay(300));
//   }

//   exportUsageData(organizationId: string, format: 'csv' | 'pdf'): Observable<boolean> {
//     return of(true).pipe(delay(1000));
//   }
// }

import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay, switchMap } from "rxjs/operators";

export interface UsageData {
  apiCalls: {
    dates: string[];
    values: number[];
  };
  activeUsers: {
    dates: string[];
    values: number[];
  };
  storage: {
    dates: string[];
    values: number[];
  };
}

export interface UsageQuota {
  apiCallsLimit: number;
  activeUsersLimit: number;
  storageLimit: number;
}

@Injectable({
  providedIn: "root",
})
export class UsageService {
  constructor() {}

  // Generate realistic mock data for an organization
  getUsageData(
    organizationId: string,
    dateRange?: { start: Date; end: Date }
  ): Observable<UsageData> {
    // Generate 30 days of data by default
    const days = 30;
    const now = new Date();
    const dates: string[] = [];

    // Create date strings for the past 30 days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    // Generate different patterns based on organization ID to make it look realistic
    let apiCallsBase = 0;
    let activeUsersBase = 0;
    let storageBase = 0;

    // Different baseline values based on organization
    switch (organizationId) {
      case "org1": // Enterprise
        apiCallsBase = 15000;
        activeUsersBase = 250;
        storageBase = 5000; // MB
        break;
      case "org2": // Pro
        apiCallsBase = 5000;
        activeUsersBase = 85;
        storageBase = 2000; // MB
        break;
      case "org3": // Free
        apiCallsBase = 1000;
        activeUsersBase = 20;
        storageBase = 500; // MB
        break;
      default:
        apiCallsBase = 3000;
        activeUsersBase = 50;
        storageBase = 1000; // MB
    }

    // Generate values with some randomness and trends
    const apiCallsValues = dates.map((_, index) => {
      // Add weekly pattern (more during weekdays)
      const dayOfWeek = new Date(dates[index]).getDay();
      const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.2;

      // Add some randomness
      const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

      // Add slight upward trend
      const trendFactor = 1 + (index / dates.length) * 0.3;

      return Math.round(
        apiCallsBase * weekdayFactor * randomFactor * trendFactor
      );
    });

    const activeUsersValues = dates.map((_, index) => {
      // Less variance for users
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1

      // Slight weekly pattern
      const dayOfWeek = new Date(dates[index]).getDay();
      const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.9 : 1.1;

      // Slight upward trend
      const trendFactor = 1 + (index / dates.length) * 0.15;

      return Math.round(
        activeUsersBase * randomFactor * weekdayFactor * trendFactor
      );
    });

    // Storage keeps increasing
    const storageValues = dates.map((_, index) => {
      // Storage generally increases
      const growthFactor = 1 + (index / dates.length) * 0.25;

      // Add small random fluctuations
      const randomFactor = 0.99 + Math.random() * 0.02; // 0.99 to 1.01

      return Math.round(storageBase * growthFactor * randomFactor);
    });

    return of({
      apiCalls: {
        dates,
        values: apiCallsValues,
      },
      activeUsers: {
        dates,
        values: activeUsersValues,
      },
      storage: {
        dates,
        values: storageValues,
      },
    }).pipe(delay(700));
  }

  getUsageQuota(organizationId: string): Observable<UsageQuota> {
    // Different quotas based on plan
    let quota: UsageQuota;

    switch (organizationId) {
      case "org1": // Enterprise
        quota = {
          apiCallsLimit: 100000,
          activeUsersLimit: 500,
          storageLimit: 20000, // MB
        };
        break;
      case "org2": // Pro
        quota = {
          apiCallsLimit: 50000,
          activeUsersLimit: 200,
          storageLimit: 5000, // MB
        };
        break;
      case "org3": // Free
        quota = {
          apiCallsLimit: 10000,
          activeUsersLimit: 50,
          storageLimit: 1000, // MB
        };
        break;
      default:
        quota = {
          apiCallsLimit: 10000,
          activeUsersLimit: 50,
          storageLimit: 1000, // MB
        };
    }

    return of(quota).pipe(delay(300));
  }

  exportUsageData(
    organizationId: string,
    format: "csv" | "pdf"
  ): Observable<string> {
    if (format === "pdf") {
      return of("PDF export not supported").pipe(delay(1000));
    }

    // Fetch usage data for CSV export
    return this.getUsageData(organizationId).pipe(
      switchMap((usageData) => {
        // Generate CSV content
        const headers = ["Date", "API Calls", "Active Users", "Storage (MB)"];
        const rows = usageData.apiCalls.dates.map((date, index) => [
          date,
          usageData.apiCalls.values[index],
          usageData.activeUsers.values[index],
          usageData.storage.values[index],
        ]);

        // Convert to CSV string
        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.join(",")),
        ].join("\n");

        return of(csvContent).pipe(delay(1000)); // Simulate API delay
      })
    );
  }
}
