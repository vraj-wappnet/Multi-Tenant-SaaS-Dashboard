import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();
  
  constructor() {
    this.initTheme();
  }
  
  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      this.isDarkModeSubject.next(true);
    } else if (savedTheme === null) {
      // Check system preference if no saved preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkModeSubject.next(prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
  }
  
  public toggleTheme(): void {
    const newValue = !this.isDarkModeSubject.value;
    this.isDarkModeSubject.next(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  }
}