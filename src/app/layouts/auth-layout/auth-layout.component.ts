import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-primary-900 flex flex-col">
      <!-- Minimal top bar -->
      <div class="p-4">
        <a routerLink="/" class="inline-flex items-center gap-2.5 group">
          <div class="w-9 h-9 bg-accent rounded-lg flex items-center justify-center
                      group-hover:shadow-lg group-hover:shadow-accent/20 transition-all duration-200">
            <span class="text-white font-bold text-sm">CP</span>
          </div>
          <span class="text-lg font-bold text-primary-50 tracking-tight">
            Car<span class="text-accent">Parts</span>
          </span>
        </a>
      </div>

      <!-- Centered content -->
      <div class="flex-1 flex items-center justify-center px-4 py-8">
        <router-outlet />
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
