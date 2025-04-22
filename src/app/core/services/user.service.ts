import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { delay, map, switchMap } from "rxjs/operators";
import { User } from "../../shared/models/user.model";
import { ToastService } from "./toast.service";
import { OrganizationService } from "./organization.service";

// Mock users data
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Super Admin",
    email: "admin@example.com",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    organizationId: null,
  },
  {
    id: "2",
    name: "Org Admin 1",
    email: "orgadmin1@example.com",
    role: "ORG_ADMIN",
    status: "ACTIVE",
    organizationId: "org1",
  },
  {
    id: "3",
    name: "User 1",
    email: "user1@example.com",
    role: "USER",
    status: "ACTIVE",
    organizationId: "org1",
  },
  {
    id: "4",
    name: "User 2",
    email: "user2@example.com",
    role: "USER",
    status: "ACTIVE",
    organizationId: "org1",
  },
  {
    id: "5",
    name: "Org Admin 2",
    email: "orgadmin2@example.com",
    role: "ORG_ADMIN",
    status: "ACTIVE",
    organizationId: "org2",
  },
  {
    id: "6",
    name: "User 3",
    email: "user3@example.com",
    role: "USER",
    status: "INACTIVE",
    organizationId: "org2",
  },
  {
    id: "7",
    name: "User 4",
    email: "user4@example.com",
    role: "USER",
    status: "ACTIVE",
    organizationId: "org3",
  },
  {
    id: "8",
    name: "Org Admin 3",
    email: "orgadmin3@example.com",
    role: "ORG_ADMIN",
    status: "ACTIVE",
    organizationId: "org3",
  },
];

@Injectable({
  providedIn: "root",
})
export class UserService {
  private users = [...MOCK_USERS];
  private usersSubject = new BehaviorSubject<User[]>(this.users);
  users$ = this.usersSubject.asObservable();

  constructor(
    private toastService: ToastService,
    private organizationService: OrganizationService
  ) {
    // Listen for organization suspension to disable users
    this.organizationService.organizations$.subscribe((orgs) => {
      let usersUpdated = false;

      // For each suspended organization, suspend all its users
      orgs.forEach((org) => {
        if (org.status === "SUSPENDED") {
          this.users.forEach((user) => {
            if (user.organizationId === org.id && user.status !== "SUSPENDED") {
              user.status = "SUSPENDED";
              usersUpdated = true;
            }
          });
        }
      });

      if (usersUpdated) {
        this.usersSubject.next([...this.users]);
      }
    });
  }

  getUsers(organizationId?: string): Observable<User[]> {
    let filteredUsers = [...this.users];

    if (organizationId) {
      filteredUsers = filteredUsers.filter(
        (user) => user.organizationId === organizationId
      );
    }

    return of(filteredUsers).pipe(delay(500));
  }

  getUser(id: string): Observable<User> {
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      return throwError(() => `User with id ${id} not found`);
    }

    return of(user).pipe(delay(300));
  }

  createUser(user: Omit<User, "id">): Observable<User> {
    if (
      this.users.some(
        (u) =>
          u.email.toLowerCase() === user.email.toLowerCase() &&
          u.organizationId === user.organizationId
      )
    ) {
      return throwError(
        () => "A user with this email already exists in this organization"
      );
    }

    // Check user limit for FREE plan organizations
    if (user.organizationId) {
      const currentOrgUsers = this.users.filter(
        (u) => u.organizationId === user.organizationId
      );

      return this.organizationService.getOrganization(user.organizationId).pipe(
        switchMap((org) => {
          // Check if organization is on FREE plan and has reached user limit
          if (org.plan === "FREE" && currentOrgUsers.length >= 5) {
            return throwError(
              () => "Free plan is limited to 5 users. Please upgrade your plan."
            );
          }

          // Proceed with user creation
          const newUser: User = {
            ...user,
            id: (this.users.length + 1).toString(),
          };

          this.users.push(newUser);
          this.usersSubject.next([...this.users]);

          this.toastService.show({
            type: "success",
            message: `User "${newUser.name}" created successfully`,
          });

          return of(newUser).pipe(delay(500));
        })
      );
    }

    // No organization ID (e.g., super admin), proceed with user creation
    const newUser: User = {
      ...user,
      id: (this.users.length + 1).toString(),
    };

    this.users.push(newUser);
    this.usersSubject.next([...this.users]);

    this.toastService.show({
      type: "success",
      message: `User "${newUser.name}" created successfully`,
    });

    return of(newUser).pipe(delay(500));
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    const index = this.users.findIndex((u) => u.id === id);

    if (index === -1) {
      return throwError(() => `User with id ${id} not found`);
    }

    // Check if email already exists in the same organization when updating email
    if (
      updates.email &&
      this.users.some(
        (u) =>
          u.id !== id &&
          u.email.toLowerCase() === updates.email!.toLowerCase() &&
          u.organizationId === this.users[index].organizationId
      )
    ) {
      return throwError(
        () => "A user with this email already exists in this organization"
      );
    }

    const updatedUser = { ...this.users[index], ...updates };
    this.users[index] = updatedUser;
    this.usersSubject.next([...this.users]);

    this.toastService.show({
      type: "success",
      message: `User "${updatedUser.name}" updated successfully`,
    });

    return of(updatedUser).pipe(delay(500));
  }

  deleteUser(id: string): Observable<void> {
    const index = this.users.findIndex((u) => u.id === id);

    if (index === -1) {
      return throwError(() => `User with id ${id} not found`);
    }

    const userName = this.users[index].name;
    this.users.splice(index, 1);
    this.usersSubject.next([...this.users]);

    this.toastService.show({
      type: "success",
      message: `User "${userName}" deleted successfully`,
    });

    return of(undefined).pipe(delay(500));
  }

  getUsersCountByOrganization(organizationId: string): Observable<number> {
    return this.getUsers(organizationId).pipe(map((users) => users.length));
  }

  checkUserLimitForOrganization(
    organizationId: string
  ): Observable<{ canAddUser: boolean; reason?: string }> {
    return this.organizationService.getOrganization(organizationId).pipe(
      map((org) => {
        if (org.plan === "FREE") {
          const orgUsers = this.users.filter(
            (u) => u.organizationId === organizationId
          );
          if (orgUsers.length >= 5) {
            return {
              canAddUser: false,
              reason:
                "Free plan is limited to 5 users. Please upgrade to add more users.",
            };
          }
        }
        return { canAddUser: true };
      })
    );
  }

  sendPasswordResetLink(email: string): Observable<boolean> {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return throwError(() => "User not found");
    }

    this.toastService.show({
      type: "info",
      message: `Password reset email sent to ${email}`,
    });

    return of(true).pipe(delay(1000));
  }
}
