import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalStorageService } from '../localStorage/localstorage.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
 constructor(
    private router: Router,
    private localStorageService: LocalStorageService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const token = this.localStorageService.getToken();

    const authRequest = token
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : request;

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {

        if (this.isUnauthorized(error)) {
          this.handleLogout();
        }

        return throwError(() => error);
      })
    );
  }

  // 🔹 Central unauthorized check
  private isUnauthorized(error: HttpErrorResponse): boolean {
    return (
      error.status === 401 ||
      error.status === 403 ||
      this.invalidTokenError(error) ||
      this.unAuthorizedError(error)
    );
  }

  // 🔹 Clear storage & redirect
  private handleLogout(): void {
    this.localStorageService.clear();
    this.router.navigateByUrl('/login');
  }

  private invalidTokenError(error: any): boolean {
    return error?.error?.errors?.some(
      (e: any) => e.type === 'InvalidTokenError'
    );
  }

  private unAuthorizedError(error: any): boolean {
    return error?.error?.errors?.some(
      (e: any) => e.type === 'UnauthorizedError'
    );
  }
}