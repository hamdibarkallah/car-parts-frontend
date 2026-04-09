import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-primary-950 border-t border-primary-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">

          <!-- Brand -->
          <div class="md:col-span-1">
            <a routerLink="/" class="flex items-center gap-2.5 mb-4">
              <div class="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">CP</span>
              </div>
              <span class="text-lg font-bold text-primary-50 tracking-tight">
                Car<span class="text-accent">Parts</span>
              </span>
            </a>
            <p class="text-sm text-primary-400 leading-relaxed">
              Tunisia's premier marketplace for car spare parts. Find the right parts for your vehicle.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-sm font-semibold text-primary-200 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><a routerLink="/parts" class="text-sm text-primary-400 hover:text-accent transition-colors">Browse Parts</a></li>
              <li><a routerLink="/auth/register" class="text-sm text-primary-400 hover:text-accent transition-colors">Create Account</a></li>
            </ul>
          </div>

          <!-- For Suppliers -->
          <div>
            <h4 class="text-sm font-semibold text-primary-200 uppercase tracking-wider mb-4">For Suppliers</h4>
            <ul class="space-y-2">
              <li><a routerLink="/auth/register" class="text-sm text-primary-400 hover:text-accent transition-colors">Become a Supplier</a></li>
              <li><a routerLink="/supplier" class="text-sm text-primary-400 hover:text-accent transition-colors">Supplier Dashboard</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-sm font-semibold text-primary-200 uppercase tracking-wider mb-4">Contact</h4>
            <ul class="space-y-2">
              <li class="text-sm text-primary-400">Tunis, Tunisia</li>
              <li class="text-sm text-primary-400">support&#64;carparts.tn</li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-primary-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-xs text-primary-500">&copy; 2026 CarParts. All rights reserved.</p>
          <p class="text-xs text-primary-500">Made in Tunisia</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
