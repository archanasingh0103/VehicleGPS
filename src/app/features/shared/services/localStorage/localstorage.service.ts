import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../core/app.reducer';
import { clearAuth } from '../../../../core/app.action';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
   private tokenExpirationTimer: any;
  constructor(
    private store : Store<AppState>,
    private cookieService : CookieService,
    private router : Router
  ) { }
  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  //**setitem in localstorage */
  setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(key, value);
    }
  }

  //**getitem from localstorage */
  getItem(key: string): string | null {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem(key);
    } else {
      return null;
    }
  }

  //**remove item from lovalstorage */
  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  //**clear localstorage */
  clear(): void {
   this.store.dispatch(clearAuth());
   this.cookieService.delete(`vahan_token`, '/');
   this.router.navigateByUrl("/login")
  }

  getToken(): string {    
    return this.cookieService.get(`vahan_token`);
  }

  isLoggedIn() {
    const token = this.getToken();
    return  token !== null;
  }
}
