export type OrganizationPlan = 'FREE' | 'PRO' | 'ENTERPRISE';
export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED';

export interface Organization {
  id: string;
  name: string;
  logo: string;
  industry: string;
  plan: OrganizationPlan;
  status: OrganizationStatus;
  createdAt: Date;
}