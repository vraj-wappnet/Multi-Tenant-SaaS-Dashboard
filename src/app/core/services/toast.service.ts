import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  
  constructor() {}
  
  show(toast: Omit<Toast, 'id'>): void {
    const id = Date.now().toString();
    const newToast: Toast = { ...toast, id };
    
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }
  
  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }
  
  clear(): void {
    this.toastsSubject.next([]);
  }
}