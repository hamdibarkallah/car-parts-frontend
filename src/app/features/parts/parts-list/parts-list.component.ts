import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PartsService } from '../../../core/services/parts.service';
import { Part, PartFilters } from '../../../core/models/part.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-parts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-primary-50 tracking-tight">Parts Catalog</h1>
          <p class="text-sm text-primary-400 mt-1">{{ totalCount() }} parts available</p>
        </div>
        <!-- Search -->
        <div class="relative w-full sm:w-80">
          <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            class="input pl-10"
            placeholder="Search parts..." />
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters Sidebar -->
        <aside class="w-full lg:w-64 shrink-0">
          <div class="card p-5 space-y-5 sticky top-24">
            <h3 class="text-sm font-semibold text-primary-200 uppercase tracking-wider">Filters</h3>

            <!-- Condition -->
            <div>
              <label class="label">Condition</label>
              <select [(ngModel)]="filters.condition" (ngModelChange)="loadParts()" class="input text-sm">
                <option value="" class="bg-primary-800">All</option>
                <option value="NEW" class="bg-primary-800">New</option>
                <option value="USED" class="bg-primary-800">Used</option>
              </select>
            </div>

            <!-- In Stock -->
            <div>
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" [(ngModel)]="stockFilter" (ngModelChange)="onStockFilterChange()"
                       class="w-4 h-4 rounded bg-primary-700 border-primary-600 text-accent focus:ring-accent/50" />
                <span class="text-sm text-primary-300">In stock only</span>
              </label>
            </div>

            <!-- Clear -->
            <button (click)="clearFilters()" class="btn-ghost text-xs w-full">
              Clear Filters
            </button>
          </div>
        </aside>

        <!-- Parts Grid -->
        <div class="flex-1">
          @if (loading()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="card p-4 space-y-4">
                  <div class="skeleton h-40 w-full rounded-lg"></div>
                  <div class="skeleton h-4 w-3/4"></div>
                  <div class="skeleton h-3 w-1/2"></div>
                  <div class="skeleton h-8 w-24"></div>
                </div>
              }
            </div>
          } @else if (parts().length === 0) {
            <app-empty-state
              icon="🔧"
              title="No parts found"
              description="Try adjusting your filters or search terms.">
            </app-empty-state>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              @for (part of parts(); track part.id) {
                <a [routerLink]="['/parts', part.id]" class="card-hover p-4 group block">
                  <!-- Image -->
                  <div class="aspect-[4/3] rounded-lg bg-primary-700 mb-4 overflow-hidden flex items-center justify-center">
                    @if (part.primary_image) {
                      <img [src]="part.primary_image" [alt]="part.name"
                           class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-primary-500" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    }
                  </div>

                  <!-- Info -->
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <span [class]="part.condition === 'NEW' ? 'badge-new' : 'badge-used'">
                        {{ part.condition }}
                      </span>
                      <span [class]="part.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'">
                        {{ part.in_stock ? 'In Stock' : 'Out of Stock' }}
                      </span>
                    </div>

                    <h3 class="font-semibold text-primary-100 group-hover:text-accent transition-colors line-clamp-1">
                      {{ part.name }}
                    </h3>

                    <p class="text-xs text-primary-400">{{ part.supplier_name }}</p>

                    <div class="flex items-center justify-between pt-1">
                      <span class="text-lg font-bold text-accent font-mono">{{ part.price }} TND</span>
                      <span class="text-xs text-primary-400">{{ part.reference }}</span>
                    </div>
                  </div>
                </a>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class PartsListComponent implements OnInit {
  parts = signal<Part[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  searchQuery = '';
  stockFilter = false;
  filters: PartFilters = {};
  private searchTimeout: any;

  constructor(private partsService: PartsService) {}

  ngOnInit(): void {
    this.loadParts();
  }

  loadParts(): void {
    this.loading.set(true);
    const filters = { ...this.filters };
    if (this.searchQuery) filters.search = this.searchQuery;
    if (this.stockFilter) filters.in_stock = true;

    this.partsService.getParts(filters).subscribe({
      next: (res) => {
        this.parts.set(res.results);
        this.totalCount.set(res.count);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadParts(), 300);
  }

  onStockFilterChange(): void {
    this.loadParts();
  }

  clearFilters(): void {
    this.filters = {};
    this.searchQuery = '';
    this.stockFilter = false;
    this.loadParts();
  }
}
