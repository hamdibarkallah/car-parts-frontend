import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="w-full max-w-lg animate-fade-in">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-50 tracking-tight">Create an account</h1>
        <p class="mt-2 text-primary-400">Join Tunisia's car parts marketplace</p>
      </div>

      <!-- Form Card -->
      <div class="card p-8">
        <!-- Role Toggle -->
        <div class="flex bg-primary-900 rounded-lg p-1 mb-6">
          <button
            type="button"
            (click)="setRole('CLIENT')"
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200"
            [class]="selectedRole() === 'CLIENT'
              ? 'bg-accent text-white shadow-md'
              : 'text-primary-400 hover:text-primary-200'">
            Client
          </button>
          <button
            type="button"
            (click)="setRole('SUPPLIER')"
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200"
            [class]="selectedRole() === 'SUPPLIER'
              ? 'bg-accent text-white shadow-md'
              : 'text-primary-400 hover:text-primary-200'">
            Supplier
          </button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Name Row -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="first_name" class="label">First Name</label>
              <input id="first_name" type="text" formControlName="first_name" class="input"
                     [class.input-error]="isFieldInvalid('first_name')" placeholder="John" />
              @if (isFieldInvalid('first_name')) {
                <p class="mt-1 text-xs text-danger">Required</p>
              }
            </div>
            <div>
              <label for="last_name" class="label">Last Name</label>
              <input id="last_name" type="text" formControlName="last_name" class="input"
                     [class.input-error]="isFieldInvalid('last_name')" placeholder="Doe" />
              @if (isFieldInvalid('last_name')) {
                <p class="mt-1 text-xs text-danger">Required</p>
              }
            </div>
          </div>

          <!-- Username -->
          <div>
            <label for="username" class="label">Username</label>
            <input id="username" type="text" formControlName="username" class="input"
                   [class.input-error]="isFieldInvalid('username')" placeholder="johndoe" autocomplete="username" />
            @if (isFieldInvalid('username')) {
              <p class="mt-1 text-xs text-danger">Username is required (min 3 characters)</p>
            }
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="label">Email</label>
            <input id="email" type="email" formControlName="email" class="input"
                   [class.input-error]="isFieldInvalid('email')" placeholder="john&#64;example.com" />
            @if (isFieldInvalid('email')) {
              <p class="mt-1 text-xs text-danger">Valid email is required</p>
            }
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="label">Phone</label>
            <input id="phone" type="tel" formControlName="phone" class="input"
                   [class.input-error]="isFieldInvalid('phone')" placeholder="+216 XX XXX XXX" />
            @if (isFieldInvalid('phone')) {
              <p class="mt-1 text-xs text-danger">Phone number is required</p>
            }
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="label">Password</label>
            <div class="relative">
              <input id="password" [type]="showPassword() ? 'text' : 'password'"
                     formControlName="password" class="input pr-10"
                     [class.input-error]="isFieldInvalid('password')" placeholder="Min 8 characters"
                     autocomplete="new-password" />
              <button type="button" (click)="togglePassword()"
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
              <p class="mt-1 text-xs text-danger">Password must be at least 8 characters</p>
            }
            <!-- Password Strength -->
            @if (form.get('password')?.value) {
              <div class="mt-2 flex gap-1">
                @for (i of [1,2,3,4]; track i) {
                  <div class="h-1 flex-1 rounded-full transition-all duration-300"
                       [ngClass]="{
                         'bg-danger': passwordStrength() >= i && passwordStrength() <= 1,
                         'bg-warning': passwordStrength() >= i && passwordStrength() === 2,
                         'bg-accent': passwordStrength() >= i && passwordStrength() === 3,
                         'bg-success': passwordStrength() >= i && passwordStrength() >= 4,
                         'bg-primary-700': passwordStrength() < i
                       }">
                  </div>
                }
              </div>
            }
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="password2" class="label">Confirm Password</label>
            <input id="password2" [type]="showPassword() ? 'text' : 'password'"
                   formControlName="password2" class="input"
                   [class.input-error]="isFieldInvalid('password2')" placeholder="Re-enter your password"
                   autocomplete="new-password" />
            @if (isFieldInvalid('password2')) {
              <p class="mt-1 text-xs text-danger">Please confirm your password</p>
            }
            @if (form.get('password2')?.touched && form.get('password')?.value && form.get('password2')?.value && form.get('password')?.value !== form.get('password2')?.value) {
              <p class="mt-1 text-xs text-danger">Passwords do not match</p>
            }
          </div>

          <!-- Supplier Fields -->
          @if (selectedRole() === 'SUPPLIER') {
            <div class="pt-2 space-y-4 border-t border-primary-700 mt-4 animate-slide-up">
              <p class="text-sm font-medium text-primary-300">Business Information</p>

              <div>
                <label for="business_name" class="label">Business Name</label>
                <input id="business_name" type="text" formControlName="business_name" class="input"
                       [class.input-error]="isFieldInvalid('business_name')" placeholder="Your business name" />
                @if (isFieldInvalid('business_name')) {
                  <p class="mt-1 text-xs text-danger">Business name is required</p>
                }
              </div>

              <div>
                <label for="address" class="label">Address</label>
                <input id="address" type="text" formControlName="address" class="input"
                       [class.input-error]="isFieldInvalid('address')" placeholder="Business address" />
                @if (isFieldInvalid('address')) {
                  <p class="mt-1 text-xs text-danger">Address is required</p>
                }
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="governorate" class="label">Governorate</label>
                  <select id="governorate" formControlName="governorate" class="input"
                          [class.input-error]="isFieldInvalid('governorate')">
                    <option value="" class="bg-primary-800">Select...</option>
                    @for (gov of governorates; track gov) {
                      <option [value]="gov" class="bg-primary-800">{{ gov }}</option>
                    }
                  </select>
                  @if (isFieldInvalid('governorate')) {
                    <p class="mt-1 text-xs text-danger">Required</p>
                  }
                </div>
                <div>
                  <label for="postal_code" class="label">Postal Code</label>
                  <input id="postal_code" type="text" formControlName="postal_code" class="input"
                         [class.input-error]="isFieldInvalid('postal_code')" placeholder="1000" />
                  @if (isFieldInvalid('postal_code')) {
                    <p class="mt-1 text-xs text-danger">Required</p>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Error -->
          @if (errorMessage()) {
            <div class="bg-danger/10 border border-danger/30 rounded-lg px-4 py-3 text-sm text-danger animate-slide-up">
              {{ errorMessage() }}
            </div>
          }

          <!-- Submit -->
          <button type="submit" [disabled]="loading()" class="btn-primary w-full py-3 mt-2">
            @if (loading()) {
              <app-loading-spinner size="sm" />
              <span>Creating account...</span>
            } @else {
              <span>Create Account</span>
            }
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-6 pt-6 border-t border-primary-700 text-center">
          <p class="text-sm text-primary-400">
            Already have an account?
            <a routerLink="/auth/login" class="text-accent hover:text-accent-400 font-medium transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  selectedRole = signal<'CLIENT' | 'SUPPLIER'>('CLIENT');

  governorates = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
    'Bizerte', 'Beja', 'Jendouba', 'Kef', 'Siliana', 'Sousse',
    'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
    'Gabes', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', Validators.required],
      business_name: [''],
      address: [''],
      governorate: [''],
      postal_code: ['']
    });
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  passwordStrength(): number {
    const pw = this.form.get('password')?.value || '';
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score;
  }

  setRole(role: 'CLIENT' | 'SUPPLIER'): void {
    this.selectedRole.set(role);
    if (role === 'SUPPLIER') {
      this.form.get('business_name')?.setValidators(Validators.required);
      this.form.get('address')?.setValidators(Validators.required);
      this.form.get('governorate')?.setValidators(Validators.required);
      this.form.get('postal_code')?.setValidators(Validators.required);
    } else {
      this.form.get('business_name')?.clearValidators();
      this.form.get('address')?.clearValidators();
      this.form.get('governorate')?.clearValidators();
      this.form.get('postal_code')?.clearValidators();
    }
    this.form.get('business_name')?.updateValueAndValidity();
    this.form.get('address')?.updateValueAndValidity();
    this.form.get('governorate')?.updateValueAndValidity();
    this.form.get('postal_code')?.updateValueAndValidity();
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

    const data = { ...this.form.value, role: this.selectedRole() };

    if (this.selectedRole() === 'CLIENT') {
      delete data.business_name;
      delete data.address;
      delete data.governorate;
      delete data.postal_code;
    }

    this.authService.register(data).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.toast.success(`Welcome, ${response.user.first_name}! Account created successfully.`);
        if (response.user.role === 'SUPPLIER') {
          this.router.navigate(['/supplier']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        if (err.error && typeof err.error === 'object') {
          const messages = Object.values(err.error).flat();
          this.errorMessage.set(messages.join(' '));
        } else {
          this.errorMessage.set('Registration failed. Please try again.');
        }
      }
    });
  }
}
