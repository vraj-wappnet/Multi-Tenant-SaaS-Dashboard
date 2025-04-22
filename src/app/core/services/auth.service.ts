import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { delay, tap } from "rxjs/operators";
import { User } from "../../shared/models/user.model";
import { ToastService } from "./toast.service";

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly STORAGE_KEY = "auth_user";
  private currentUser: User | null = null;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable(); // Expose user state as Observable

  constructor(private router: Router, private toastService: ToastService) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    if (userJson) {
      try {
        this.currentUser = JSON.parse(userJson);
        this.currentUserSubject.next(this.currentUser); // Emit initial user state
      } catch (error) {
        console.error("Error parsing user from storage:", error);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    // In a real application, this would call an API
    // For demonstration, we'll simulate different users based on email
    if (
      credentials.email === "admin@example.com" &&
      credentials.password === "password"
    ) {
      const user: User = {
        id: "1",
        name: "Super Admin",
        email: "admin@example.com",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        organizationId: null, // Super admin doesn't belong to a specific org
      };

      return of(user).pipe(
        delay(800), // Simulate API delay
        tap((user) => {
          this.setCurrentUser(user);
          this.toastService.show({
            type: "success",
            message: "Welcome back, Super Admin!",
          });
        })
      );
    } else if (
      credentials.email === "orgadmin@example.com" &&
      credentials.password === "password"
    ) {
      const user: User = {
        id: "2",
        name: "Org Admin",
        email: "orgadmin@example.com",
        role: "ORG_ADMIN",
        status: "ACTIVE",
        organizationId: "org1",
      };

      return of(user).pipe(
        delay(800),
        tap((user) => {
          this.setCurrentUser(user);
          this.toastService.show({
            type: "success",
            message: "Welcome back, Org Admin!",
          });
        })
      );
    } else if (
      credentials.email === "user@example.com" &&
      credentials.password === "password"
    ) {
      const user: User = {
        id: "3",
        name: "Basic User",
        email: "user@example.com",
        role: "USER",
        status: "ACTIVE",
        organizationId: "org1",
      };

      return of(user).pipe(
        delay(800),
        tap((user) => {
          this.setCurrentUser(user);
          this.toastService.show({
            type: "success",
            message: "Welcome back, User!",
          });
        })
      );
    } else {
      return throwError(() => "Invalid credentials").pipe(delay(800));
    }
  }

  logout(): void {
    this.currentUser = null;
    this.currentUserSubject.next(null); // Emit null to notify logout
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(["/login"]);
    this.toastService.show({
      type: "error",
      message: "You have been logged out",
    });
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    this.currentUserSubject.next(user); // Emit new user state
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  hasRole(roles: string | string[]): boolean {
    if (!this.currentUser) {
      return false;
    }

    if (typeof roles === "string") {
      return this.currentUser.role === roles;
    }

    return roles.includes(this.currentUser.role);
  }
}
