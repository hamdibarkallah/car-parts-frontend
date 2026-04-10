import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sticky top-0 z-40 bg-primary-900/80 backdrop-blur-xl border-b border-primary-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 bg-accent rounded-lg flex items-center justify-center
                        group-hover:shadow-lg group-hover:shadow-accent/20 transition-all duration-200">
              <span class="text-white font-bold text-sm">CP</span>
            </div>
            <span class="text-lg font-bold text-primary-50 tracking-tight hidden sm:block">
              Car<span class="text-accent">Parts</span>
            </span>
          </a>

          <!-- Desktop Nav Links -->
          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/" routerLinkActive="text-accent bg-accent/10"
               [routerLinkActiveOptions]="{exact: true}"
               class="px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50
                      hover:bg-primary-800 transition-all duration-200">
              Home
            </a>
            <a routerLink="/parts" routerLinkActive="text-accent bg-accent/10"
               class="px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50
                      hover:bg-primary-800 transition-all duration-200">
              Parts
            </a>
            @if (auth.isClient()) {
              <a routerLink="/orders" routerLinkActive="text-accent bg-accent/10"
                 class="px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50
                        hover:bg-primary-800 transition-all duration-200">
                Orders
              </a>
            }
            @if (auth.isSupplier()) {
              <a routerLink="/supplier" routerLinkActive="text-accent bg-accent/10"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50
                        hover:bg-primary-800 transition-all duration-200">
                Dashboard
              </a>
              <a routerLink="/supplier/parts" routerLinkActive="text-accent bg-accent/10"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50
                        hover:bg-primary-800 transition-all duration-200">
                My Parts
              </a>
              <a routerLink="/supplier/orders" routerLinkActive="text-accent bg-accent/10"
                 class="px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50
                        hover:bg-primary-800 transition-all duration-200">
                Orders
              </a>
            }
          </div>

          <!-- Right Side -->
          <div class="flex items-center gap-3">
            @if (auth.isClient()) {
              <!-- Cart Button -->
              <a routerLink="/cart"
                 class="relative p-2 rounded-lg text-primary-300 hover:text-primary-50
                        hover:bg-primary-800 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                @if (cartService.itemCount() > 0) {
                  <span class="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold
                               rounded-full flex items-center justify-center animate-scale-in">
                    {{ cartService.itemCount() }}
                  </span>
                }
              </a>
            }

            @if (auth.loggedIn()) {
              <!-- User Menu -->
              <div class="relative">
                <button (click)="toggleUserMenu()"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                               hover:bg-primary-800 transition-all duration-200">
                  <div class="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                    <span class="text-accent text-xs font-bold">
                      {{ auth.user()?.first_name?.charAt(0) || 'U' }}
                    </span>
                  </div>
                  <span class="text-primary-200 hidden sm:block">{{ auth.user()?.first_name }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary-400" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                @if (userMenuOpen()) {
                  <div class="absolute right-0 mt-2 w-48 bg-primary-800 border border-primary-700 rounded-xl
                              shadow-xl shadow-black/30 py-1 animate-scale-in origin-top-right">
                    <div class="px-4 py-2 border-b border-primary-700">
                      <p class="text-sm font-medium text-primary-100">{{ auth.user()?.first_name }} {{ auth.user()?.last_name }}</p>
                      <p class="text-xs text-primary-400">{{ auth.user()?.role }}</p>
                    </div>
                    <button (click)="auth.logout(); toggleUserMenu()"
                            class="w-full text-left px-4 py-2 text-sm text-danger hover:bg-primary-700
                                   transition-colors duration-150">
                      Sign Out
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/auth/login" class="btn-ghost text-sm">Sign In</a>
              <a routerLink="/auth/register" class="btn-primary text-sm">Sign Up</a>
            }

            <!-- Mobile Menu Toggle -->
            <button (click)="toggleMobileMenu()"
                    class="md:hidden p-2 rounded-lg text-primary-300 hover:bg-primary-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                @if (mobileMenuOpen()) {
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                } @else {
                  <line x1="4" x2="20" y1="12" y2="12"/>
                  <line x1="4" x2="20" y1="6" y2="6"/>
                  <line x1="4" x2="20" y1="18" y2="18"/>
                }
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden border-t border-primary-700/50 py-3 animate-slide-down">
            <a routerLink="/" (click)="toggleMobileMenu()"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50 hover:bg-primary-800">
              Home
            </a>
            <a routerLink="/parts" (click)="toggleMobileMenu()"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50 hover:bg-primary-800">
              Parts
            </a>
            @if (auth.isClient()) {
              <a routerLink="/orders" (click)="toggleMobileMenu()"
                 class="block px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50 hover:bg-primary-800">
                Orders
              </a>
            }
            @if (auth.isSupplier()) {
              <a routerLink="/supplier" (click)="toggleMobileMenu()"
                 class="block px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50 hover:bg-primary-800">
                Dashboard
              </a>
              <a routerLink="/supplier/parts" (click)="toggleMobileMenu()"
                 class="block px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50 hover:bg-primary-800">
                My Parts
              </a>
              <a routerLink="/supplier/orders" (click)="toggleMobileMenu()"
                 class="block px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-primary-50 hover:bg-primary-800">
                Orders
              </a>
            }
          </div>
        }
      </div>
    </nav>
  `
})
export class NavbarComponent {
  userMenuOpen = signal(false);
  mobileMenuOpen = signal(false);

  constructor(public auth: AuthService, public cartService: CartService) {}

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
    this.mobileMenuOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
    this.userMenuOpen.set(false);
  }
}
