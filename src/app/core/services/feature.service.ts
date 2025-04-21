import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Feature, OrganizationFeature } from '../../shared/models/feature.model';
import { OrganizationService } from './organization.service';
import { ToastService } from './toast.service';

// Mock features data
const MOCK_FEATURES: Feature[] = [
  {
    id: 'feature1',
    name: 'Export Data',
    description: 'Ability to export data in CSV, PDF, and Excel formats',
    availableOnPlans: ['PRO', 'ENTERPRISE'],
    isEnabled: true
  },
  {
    id: 'feature2',
    name: 'Custom Branding',
    description: 'Customize application with your company branding',
    availableOnPlans: ['ENTERPRISE'],
    isEnabled: true
  },
  {
    id: 'feature3',
    name: 'API Access',
    description: 'Access to RESTful API for integration',
    availableOnPlans: ['PRO', 'ENTERPRISE'],
    isEnabled: true
  },
  {
    id: 'feature4',
    name: 'Audit Logs',
    description: 'Track user actions and system changes',
    availableOnPlans: ['ENTERPRISE'],
    isEnabled: true
  },
  {
    id: 'feature5',
    name: 'Multi-Language',
    description: 'Support for multiple languages',
    availableOnPlans: ['PRO', 'ENTERPRISE'],
    isEnabled: true
  },
  {
    id: 'feature6',
    name: 'Basic Reports',
    description: 'Access to basic usage and performance reports',
    availableOnPlans: ['FREE', 'PRO', 'ENTERPRISE'],
    isEnabled: true
  }
];

// Mock organization-feature relationships
const MOCK_ORG_FEATURES: OrganizationFeature[] = [
  // Org1 (ENTERPRISE)
  { organizationId: 'org1', featureId: 'feature1', isEnabled: true, lastUpdatedAt: new Date() },
  { organizationId: 'org1', featureId: 'feature2', isEnabled: true, lastUpdatedAt: new Date() },
  { organizationId: 'org1', featureId: 'feature3', isEnabled: true, lastUpdatedAt: new Date() },
  { organizationId: 'org1', featureId: 'feature4', isEnabled: true, lastUpdatedAt: new Date() },
  { organizationId: 'org1', featureId: 'feature5', isEnabled: true, lastUpdatedAt: new Date() },
  { organizationId: 'org1', featureId: 'feature6', isEnabled: true, lastUpdatedAt: new Date() },
  
  // Org2 (PRO)
  { organizationId: 'org2', featureId: 'feature1', isEnabled: true, lastUpdatedAt: new Date() },
  { organizationId: 'org2', featureId: 'feature2', isEnabled: false, lastUpdatedAt: new Date() },
  { organizationId: 'org2', featureId: 'feature3', isEnabled: true, lastUpdatedAt: new Date() },
  { organizationId: 'org2', featureId: 'feature4', isEnabled: false, lastUpdatedAt: new Date() },
  { organizationId: 'org2', featureId: 'feature5', isEnabled: true, lastUpdatedAt: new Date() },
  { organizationId: 'org2', featureId: 'feature6', isEnabled: true, lastUpdatedAt: new Date() },
  
  // Org3 (FREE)
  { organizationId: 'org3', featureId: 'feature1', isEnabled: false, lastUpdatedAt: new Date() },
  { organizationId: 'org3', featureId: 'feature2', isEnabled: false, lastUpdatedAt: new Date() },
  { organizationId: 'org3', featureId: 'feature3', isEnabled: false, lastUpdatedAt: new Date() },
  { organizationId: 'org3', featureId: 'feature4', isEnabled: false, lastUpdatedAt: new Date() },
  { organizationId: 'org3', featureId: 'feature5', isEnabled: false, lastUpdatedAt: new Date() },
  { organizationId: 'org3', featureId: 'feature6', isEnabled: true, lastUpdatedAt: new Date() }
];

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private features = [...MOCK_FEATURES];
  private orgFeatures = [...MOCK_ORG_FEATURES];
  
  private featuresSubject = new BehaviorSubject<Feature[]>(this.features);
  private orgFeaturesSubject = new BehaviorSubject<OrganizationFeature[]>(this.orgFeatures);
  
  features$ = this.featuresSubject.asObservable();
  orgFeatures$ = this.orgFeaturesSubject.asObservable();
  
  constructor(
    private organizationService: OrganizationService,
    private toastService: ToastService
  ) {}
  
  getFeatures(): Observable<Feature[]> {
    return of([...this.features]).pipe(delay(300));
  }
  
  getFeature(id: string): Observable<Feature> {
    const feature = this.features.find(f => f.id === id);
    
    if (!feature) {
      return throwError(() => `Feature with id ${id} not found`);
    }
    
    return of(feature).pipe(delay(300));
  }
  
  getOrganizationFeatures(organizationId: string): Observable<{feature: Feature, isEnabled: boolean, canToggle: boolean}[]> {
    return this.organizationService.getOrganization(organizationId).pipe(
      delay(500),
      map(org => {
        return this.features.map(feature => {
          const orgFeature = this.orgFeatures.find(
            of => of.organizationId === organizationId && of.featureId === feature.id
          );
          
          const isEnabled = orgFeature ? orgFeature.isEnabled : false;
          const canToggle = feature.availableOnPlans.includes(org.plan);
          
          return { feature, isEnabled, canToggle };
        });
      })
    );
  }
  
  toggleFeature(organizationId: string, featureId: string, isEnabled: boolean): Observable<OrganizationFeature> {
    const index = this.orgFeatures.findIndex(
      of => of.organizationId === organizationId && of.featureId === featureId
    );
    
    if (index === -1) {
      // Create new relationship if it doesn't exist
      const newOrgFeature: OrganizationFeature = {
        organizationId,
        featureId,
        isEnabled,
        lastUpdatedAt: new Date()
      };
      
      this.orgFeatures.push(newOrgFeature);
      this.orgFeaturesSubject.next([...this.orgFeatures]);
      
      const feature = this.features.find(f => f.id === featureId);
      this.toastService.show({
        type: 'success',
        message: `Feature "${feature?.name}" has been ${isEnabled ? 'enabled' : 'disabled'}`
      });
      
      return of(newOrgFeature).pipe(delay(800));
    } else {
      // Update existing relationship
      const updatedOrgFeature: OrganizationFeature = {
        ...this.orgFeatures[index],
        isEnabled,
        lastUpdatedAt: new Date()
      };
      
      this.orgFeatures[index] = updatedOrgFeature;
      this.orgFeaturesSubject.next([...this.orgFeatures]);
      
      const feature = this.features.find(f => f.id === featureId);
      this.toastService.show({
        type: 'success',
        message: `Feature "${feature?.name}" has been ${isEnabled ? 'enabled' : 'disabled'}`
      });
      
      return of(updatedOrgFeature).pipe(delay(800));
    }
  }
  
  checkFeatureEligibility(organizationId: string, featureId: string): Observable<{eligible: boolean, reason?: string}> {
    return this.organizationService.getOrganization(organizationId).pipe(
      map(org => {
        const feature = this.features.find(f => f.id === featureId);
        
        if (!feature) {
          return { eligible: false, reason: 'Feature not found' };
        }
        
        if (!feature.availableOnPlans.includes(org.plan)) {
          return { 
            eligible: false, 
            reason: `This feature is not available on the ${org.plan} plan` 
          };
        }
        
        return { eligible: true };
      })
    );
  }
}