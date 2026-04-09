import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-primary-50 tracking-tight">Supplier Dashboard</h1>
          <p class="text-sm text-primary-400 mt-1">Welcome back, {{ auth.user()?.first_name }}</p>
        </div>
        <a routerLink="/parts" class="btn-secondary text-sm">View Marketplace</a>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        @for (stat of stats; track stat.label) {
          <div class="card p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl">{{ stat.icon }}</span>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full"
                    [ngClass]="{
                      'bg-accent/10 text-accent': stat.trend === 'up',
                      'bg-primary-700 text-primary-400': stat.trend === 'neutral'
                    }">
                {{ stat.change }}
              </span>
            </div>
            <p class="text-2xl font-bold text-primary-50 font-mono">{{ stat.value }}</p>
            <p class="text-sm text-primary-400 mt-1">{{ stat.label }}</p>
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Manage Parts -->
        <div class="card-hover p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <span class="text-xl">🔧</span>
            </div>
            <div>
              <h3 class="font-semibold text-primary-100">Manage Parts</h3>
              <p class="text-sm text-primary-400">Add, edit, and manage your part listings</p>
            </div>
          </div>
          <p class="text-sm text-primary-300 mb-4">
            Create new part listings, update prices, manage stock levels, and upload images for your products.
          </p>
          <div class="text-sm text-accent font-medium">Coming in Phase 4 →</div>
        </div>

        <!-- Incoming Orders -->
        <div class="card-hover p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <span class="text-xl">📦</span>
            </div>
            <div>
              <h3 class="font-semibold text-primary-100">Incoming Orders</h3>
              <p class="text-sm text-primary-400">View and manage orders for your parts</p>
            </div>
          </div>
          <p class="text-sm text-primary-300 mb-4">
            Track orders placed by customers, update order statuses, and manage fulfillment.
          </p>
          <div class="text-sm text-accent font-medium">Coming in Phase 4 →</div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}

  stats: { icon: string; value: string; label: string; change: string; trend: string }[] = [
    { icon: '🔧', value: '—', label: 'Total Parts', change: '', trend: 'neutral' },
    { icon: '📦', value: '—', label: 'Active Orders', change: '', trend: 'neutral' },
    { icon: '👁', value: '—', label: 'Views Today', change: '', trend: 'neutral' },
    { icon: '💰', value: '—', label: 'Revenue', change: '', trend: 'neutral' }
  ];
}
