export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  organizationId: string | null;
}