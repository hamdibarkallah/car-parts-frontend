import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, RegisterRequest, AuthTokens } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);

  readonly user = this.currentUser.asReadonly();
  readonly loggedIn = this.isAuthenticated.asReadonly();
  readonly isClient = computed(() => this.currentUser()?.role === 'CLIENT');
  readonly isSupplier = computed(() => this.currentUser()?.role === 'SUPPLIER');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = this.getAccessToken();
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        this.currentUser.set(JSON.parse(userData));
        this.isAuthenticated.set(true);
      } catch {
        this.clearStorage();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login/`, credentials).pipe(
      tap(response => {
        this.storeTokens(response.tokens);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/register/`, data).pipe(
      tap(response => {
        this.storeTokens(response.tokens);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    const refresh = this.getRefreshToken();
    if (refresh) {
      this.http.post(`${this.apiUrl}/auth/logout/`, { refresh }).subscribe({
        complete: () => this.clearAndRedirect(),
        error: () => this.clearAndRedirect()
      });
    } else {
      this.clearAndRedirect();
    }
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = this.getRefreshToken();
    return this.http.post<{ access: string }>(`${this.apiUrl}/auth/token/refresh/`, { refresh }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  private clearStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private clearAndRedirect(): void {
    this.clearStorage();
    this.router.navigate(['/auth/login']);
  }
}
