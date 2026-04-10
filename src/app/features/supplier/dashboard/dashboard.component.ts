import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PartsService } from '../../../core/services/parts.service';
import { Part } from '../../../core/models/part.model';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-primary-50 tracking-tight">Supplier Dashboard</h1>
          <p class="text-sm text-primary-400 mt-1">Welcome back, {{ auth.user()?.first_name }}</p>
        </div>
        <div class="flex gap-3">
          <a routerLink="/supplier/parts/new" class="btn-primary text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Add Part
          </a>
          <a routerLink="/parts" class="btn-secondary text-sm">View Marketplace</a>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div class="card p-5">
          <span class="text-2xl mb-2 block">🔧</span>
          <p class="text-2xl font-bold text-primary-50 font-mono">{{ totalParts() }}</p>
          <p class="text-sm text-primary-400 mt-1">Total Parts Listed</p>
        </div>
        <div class="card p-5">
          <span class="text-2xl mb-2 block">✅</span>
          <p class="text-2xl font-bold text-success font-mono">{{ inStockCount() }}</p>
          <p class="text-sm text-primary-400 mt-1">In Stock</p>
        </div>
        <div class="card p-5">
          <span class="text-2xl mb-2 block">⚠️</span>
          <p class="text-2xl font-bold text-warning font-mono">{{ outOfStockCount() }}</p>
          <p class="text-sm text-primary-400 mt-1">Out of Stock</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <h2 class="text-lg font-semibold text-primary-100 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <a routerLink="/supplier/parts" class="card-hover p-6 block group">
          <div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4
                      group-hover:bg-accent/20 transition-colors">
            <span class="text-xl">🔧</span>
          </div>
          <h3 class="font-semibold text-primary-100 group-hover:text-accent transition-colors">My Parts</h3>
          <p class="text-sm text-primary-400 mt-1">View, edit, and manage all your listings</p>
        </a>

        <a routerLink="/supplier/parts/new" class="card-hover p-6 block group">
          <div class="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4
                      group-hover:bg-success/20 transition-colors">
            <span class="text-xl">➕</span>
          </div>
          <h3 class="font-semibold text-primary-100 group-hover:text-accent transition-colors">Add New Part</h3>
          <p class="text-sm text-primary-400 mt-1">Create a new part listing with images</p>
        </a>

        <a routerLink="/supplier/orders" class="card-hover p-6 block group">
          <div class="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4
                      group-hover:bg-warning/20 transition-colors">
            <span class="text-xl">📦</span>
          </div>
          <h3 class="font-semibold text-primary-100 group-hover:text-accent transition-colors">Incoming Orders</h3>
          <p class="text-sm text-primary-400 mt-1">Track and manage customer orders</p>
        </a>
      </div>

      <!-- Recent Parts -->
      @if (recentParts().length > 0) {
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-primary-100">Recent Parts</h2>
          <a routerLink="/supplier/parts" class="text-sm text-accent hover:text-accent-400 transition-colors">View all →</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (part of recentParts(); track part.id) {
            <a [routerLink]="['/supplier/parts', part.id, 'edit']" class="card-hover p-4 block group">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-lg bg-primary-700 flex items-center justify-center shrink-0 overflow-hidden">
                  @if (part.primary_image) {
                    <img [src]="part.primary_image" [alt]="part.name" class="w-full h-full object-cover" />
                  } @else {
                    <span class="text-primary-500 text-lg">�</span>
                  }
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-semibold text-primary-100 group-hover:text-accent transition-colors line-clamp-1">
                    {{ part.name }}
                  </h4>
                  <p class="text-xs text-primary-400 font-mono mt-0.5">{{ part.reference }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-sm font-bold text-accent font-mono">{{ part.price }} TND</span>
                    <span [class]="part.is_in_stock ? 'badge-in-stock' : 'badge-out-of-stock'" class="text-[10px]">
                      {{ part.is_in_stock ? 'In Stock' : 'Out' }}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  totalParts = signal(0);
  inStockCount = signal(0);
  outOfStockCount = signal(0);
  recentParts = signal<Part[]>([]);

  constructor(
    public auth: AuthService,
    private partsService: PartsService
  ) {}

  ngOnInit(): void {
    const supplierId = this.auth.user()?.id;
    if (supplierId) {
      this.partsService.getParts({ supplier: supplierId }).subscribe({
        next: (res) => {
          this.totalParts.set(res.count);
          this.recentParts.set(res.results.slice(0, 6));
          const inStock = res.results.filter(p => p.is_in_stock).length;
          this.inStockCount.set(inStock);
          this.outOfStockCount.set(res.results.length - inStock);
        }
      });
    }
  }
}
