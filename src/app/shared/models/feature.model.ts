export interface Feature {
  id: string;
  name: string;
  description: string;
  availableOnPlans: string[]; // FREE, PRO, ENTERPRISE
  isEnabled: boolean;
}

export interface OrganizationFeature {
  organizationId: string;
  featureId: string;
  isEnabled: boolean;
  lastUpdatedAt: Date;
}