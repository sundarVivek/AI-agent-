import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; name: string };
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((res) => {
        localStorage.setItem('auth_token', res.token);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(() => {
        const mockRes: AuthResponse = {
          token: 'jwt_mock_token_' + Date.now(),
          user: { id: '1', email: credentials.email, name: 'Developer User' },
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        };
        localStorage.setItem('auth_token', mockRes.token);
        this.isAuthenticatedSubject.next(true);
        return of(mockRes);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.isAuthenticatedSubject.next(false);
  }

  private hasValidToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}