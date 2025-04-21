import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Organization } from '../../shared/models/organization.model';
import { ToastService } from './toast.service';

// Mock data
const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org1',
    name: 'Acme Corporation',
    industry: 'Technology',
    logo: 'https://via.placeholder.com/100?text=Acme',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: 'org2',
    name: 'Globex Corp',
    industry: 'Finance',
    logo: 'https://via.placeholder.com/100?text=Globex',
    plan: 'PRO',
    status: 'ACTIVE',
    createdAt: new Date('2023-03-22'),
  },
  {
    id: 'org3',
    name: 'Startup Hub',
    industry: 'Education',
    logo: 'https://via.placeholder.com/100?text=Startup',
    plan: 'FREE',
    status: 'ACTIVE',
    createdAt: new Date('2023-05-10'),
  },
  {
    id: 'org4',
    name: 'CloudSoft',
    industry: 'Technology',
    logo: 'https://via.placeholder.com/100?text=CloudSoft',
    plan: 'PRO',
    status: 'SUSPENDED',
    createdAt: new Date('2023-02-08'),
  },
  {
    id: 'org5',
    name: 'MediCare Plus',
    industry: 'Healthcare',
    logo: 'https://via.placeholder.com/100?text=MediCare',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    createdAt: new Date('2023-04-18'),
  },
];

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private organizations = [...MOCK_ORGANIZATIONS];
  private organizationsSubject = new BehaviorSubject<Organization[]>(this.organizations);
  private currentOrgIdSubject = new BehaviorSubject<string | null>(null);
  
  organizations$ = this.organizationsSubject.asObservable();
  currentOrgId$ = this.currentOrgIdSubject.asObservable();
  
  constructor(private toastService: ToastService) {}
  
  getOrganizations(search?: string, status?: string): Observable<Organization[]> {
    let filteredOrgs = [...this.organizations];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrgs = filteredOrgs.filter(org => 
        org.name.toLowerCase().includes(searchLower) || 
        org.industry.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      filteredOrgs = filteredOrgs.filter(org => org.status === status);
    }
    
    return of(filteredOrgs).pipe(delay(500));
  }
  
  getOrganization(id: string): Observable<Organization> {
    const org = this.organizations.find(o => o.id === id);
    
    if (!org) {
      return throwError(() => `Organization with id ${id} not found`);
    }
    
    return of(org).pipe(delay(300));
  }
  
  createOrganization(org: Omit<Organization, 'id' | 'createdAt'>): Observable<Organization> {
    // Check for duplicate name
    if (this.organizations.some(o => o.name.toLowerCase() === org.name.toLowerCase())) {
      return throwError(() => 'An organization with this name already exists');
    }
    
    const newOrg: Organization = {
      ...org,
      id: 'org' + (this.organizations.length + 1),
      createdAt: new Date()
    };
    
    this.organizations.push(newOrg);
    this.organizationsSubject.next([...this.organizations]);
    
    this.toastService.show({
      type: 'success',
      message: `Organization "${newOrg.name}" created successfully`
    });
    
    return of(newOrg).pipe(delay(500));
  }
  
  updateOrganization(id: string, updates: Partial<Organization>): Observable<Organization> {
    const index = this.organizations.findIndex(o => o.id === id);
    
    if (index === -1) {
      return throwError(() => `Organization with id ${id} not found`);
    }
    
    // Check for name uniqueness if name is being updated
    if (updates.name && 
        this.organizations.some(o => o.id !== id && o.name.toLowerCase() === updates.name!.toLowerCase())) {
      return throwError(() => 'An organization with this name already exists');
    }
    
    const updatedOrg = { ...this.organizations[index], ...updates };
    this.organizations[index] = updatedOrg;
    this.organizationsSubject.next([...this.organizations]);
    
    this.toastService.show({
      type: 'success',
      message: `Organization "${updatedOrg.name}" updated successfully`
    });
    
    return of(updatedOrg).pipe(delay(500));
  }
  
  deleteOrganization(id: string): Observable<void> {
    const index = this.organizations.findIndex(o => o.id === id);
    
    if (index === -1) {
      return throwError(() => `Organization with id ${id} not found`);
    }
    
    const orgName = this.organizations[index].name;
    this.organizations.splice(index, 1);
    this.organizationsSubject.next([...this.organizations]);
    
    this.toastService.show({
      type: 'success',
      message: `Organization "${orgName}" deleted successfully`
    });
    
    return of(undefined).pipe(delay(500));
  }
  
  setCurrentOrganization(orgId: string | null): void {
    this.currentOrgIdSubject.next(orgId);
  }
  
  getCurrentOrganization(): Observable<Organization | null> {
    return this.currentOrgId$.pipe(
      map(orgId => {
        if (!orgId) return null;
        return this.organizations.find(o => o.id === orgId) || null;
      })
    );
  }
}