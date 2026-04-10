import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent, TranslateModule],
  template: `
    <div class="w-full max-w-md animate-fade-in">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-50 tracking-tight">{{ 'AUTH.LOGIN_TITLE' | translate }}</h1>
        <p class="mt-2 text-primary-400">{{ 'AUTH.LOGIN_TITLE' | translate }}</p>
      </div>

      <!-- Form Card -->
      <div class="card p-8">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

          <!-- Username -->
          <div>
            <label for="username" class="label">{{ 'AUTH.USERNAME' | translate }}</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="input"
              [class.input-error]="isFieldInvalid('username')"
              placeholder="Enter your username"
              autocomplete="username" />
            @if (isFieldInvalid('username')) {
              <p class="mt-1 text-xs text-danger">Username is required</p>
            }
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="label">{{ 'AUTH.PASSWORD' | translate }}</label>
            <div class="relative">
              <input
                id="password"
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                class="input pr-10"
                [class.input-error]="isFieldInvalid('password')"
                placeholder="Enter your password"
                autocomplete="current-password" />
              <button
                type="button"
                (click)="togglePassword()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  @if (showPassword()) {
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  } @else {
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  }
                </svg>
              </button>
            </div>
            @if (isFieldInvalid('password')) {
              <p class="mt-1 text-xs text-danger">Password is required</p>
            }
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div class="bg-danger/10 border border-danger/30 rounded-lg px-4 py-3 text-sm text-danger animate-slide-up">
              {{ errorMessage() }}
            </div>
          }

          <!-- Submit -->
          <button
            type="submit"
            [disabled]="loading()"
            class="btn-primary w-full py-3">
            @if (loading()) {
              <app-loading-spinner size="sm" />
              <span>{{ 'AUTH.LOGIN_BTN' | translate }}...</span>
            } @else {
              <span>{{ 'AUTH.LOGIN_BTN' | translate }}</span>
            }
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-6 pt-6 border-t border-primary-700 text-center">
          <p class="text-sm text-primary-400">
            {{ 'AUTH.NO_ACCOUNT' | translate }}
            <a routerLink="/auth/register" class="text-accent hover:text-accent-400 font-medium transition-colors">
              {{ 'NAV.SIGN_UP' | translate }}
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.value).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.toast.success(`Welcome back, ${response.user.first_name}!`);
        const role = response.user.role;
        if (role === 'SUPPLIER') {
          this.router.navigate(['/supplier']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.error || err.error?.detail || 'Invalid credentials. Please try again.';
        this.errorMessage.set(msg);
      }
    });
  }
}
