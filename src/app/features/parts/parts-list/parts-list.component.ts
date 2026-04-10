import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PartsService } from '../../../core/services/parts.service';
import { CategoryService } from '../../../core/services/category.service';
import { Part, PartFilters } from '../../../core/models/part.model';
import { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { VehicleSelectorComponent, VehicleSelection } from '../../../shared/components/vehicle-selector/vehicle-selector.component';

@Component({
  selector: 'app-parts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, VehicleSelectorComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
            placeholder="Search by name, reference..." />
        </div>
      </div>

      <!-- Vehicle Selector -->
      <div class="card p-5 mb-6">
        <h3 class="text-sm font-semibold text-primary-200 uppercase tracking-wider mb-3">Find parts for your vehicle</h3>
        <app-vehicle-selector
          layout="horizontal"
          [showEngine]="true"
          (selectionChange)="onVehicleChange($event)">
        </app-vehicle-selector>
      </div>

      <!-- Active Filters Tags -->
      @if (activeFilterCount() > 0) {
        <div class="flex items-center gap-2 mb-6 flex-wrap">
          <span class="text-xs text-primary-400">Active filters:</span>
          @if (filters.condition) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
              {{ filters.condition }}
              <button (click)="filters.condition = undefined; loadParts()" class="hover:text-white ml-0.5">&times;</button>
            </span>
          }
          @if (filters.category) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
              {{ selectedCategoryName() }}
              <button (click)="filters.category = undefined; selectedCategoryName.set(''); loadParts()" class="hover:text-white ml-0.5">&times;</button>
            </span>
          }
          @if (priceMin || priceMax) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
              {{ priceMin || 0 }} – {{ priceMax || '∞' }} TND
              <button (click)="priceMin = null; priceMax = null; onPriceChange()" class="hover:text-white ml-0.5">&times;</button>
            </span>
          }
          @if (stockFilter) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
              In stock
              <button (click)="stockFilter = false; loadParts()" class="hover:text-white ml-0.5">&times;</button>
            </span>
          }
          @if (filters.brand) {
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
              Vehicle filter active
            </span>
          }
          <button (click)="clearFilters()" class="text-xs text-primary-400 hover:text-primary-200 transition-colors ml-1">
            Clear all
          </button>
        </div>
      }

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Filters Sidebar -->
        <aside class="w-full lg:w-64 shrink-0">
          <div class="card p-5 space-y-5 sticky top-24">
            <h3 class="text-sm font-semibold text-primary-200 uppercase tracking-wider">Filters</h3>

            <!-- Category -->
            <div>
              <label class="label">Category</label>
              <select [(ngModel)]="filters.category" (ngModelChange)="onCategoryChange()" class="input text-sm">
                <option [ngValue]="undefined" class="bg-primary-800">All Categories</option>
                @for (cat of categories(); track cat.id) {
                  <option [ngValue]="cat.id" class="bg-primary-800">{{ cat.name }}</option>
                }
              </select>
            </div>

            <!-- Condition -->
            <div>
              <label class="label">Condition</label>
              <div class="flex gap-2">
                <button (click)="filters.condition = undefined; currentPage = 1; loadParts()"
                        class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        [class]="!filters.condition ? 'bg-accent text-white' : 'bg-primary-800 text-primary-300 hover:bg-primary-700'">
                  All
                </button>
                <button (click)="filters.condition = 'NEW'; currentPage = 1; loadParts()"
                        class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        [class]="filters.condition === 'NEW' ? 'bg-accent text-white' : 'bg-primary-800 text-primary-300 hover:bg-primary-700'">
                  New
                </button>
                <button (click)="filters.condition = 'USED'; currentPage = 1; loadParts()"
                        class="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        [class]="filters.condition === 'USED' ? 'bg-accent text-white' : 'bg-primary-800 text-primary-300 hover:bg-primary-700'">
                  Used
                </button>
              </div>
            </div>

            <!-- Price Range -->
            <div>
              <label class="label">Price Range (TND)</label>
              <div class="flex items-center gap-2">
                <input type="number" [(ngModel)]="priceMin" (change)="onPriceChange()"
                       class="input text-sm w-full" placeholder="Min" min="0" />
                <span class="text-primary-500 text-sm">–</span>
                <input type="number" [(ngModel)]="priceMax" (change)="onPriceChange()"
                       class="input text-sm w-full" placeholder="Max" min="0" />
              </div>
            </div>

            <!-- In Stock -->
            <div>
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" [(ngModel)]="stockFilter" (ngModelChange)="loadParts()"
                       class="w-4 h-4 rounded bg-primary-700 border-primary-600 text-accent focus:ring-accent/50" />
                <span class="text-sm text-primary-300">In stock only</span>
              </label>
            </div>

            <!-- Clear -->
            @if (activeFilterCount() > 0) {
              <button (click)="clearFilters()" class="btn-ghost text-xs w-full">
                Clear All Filters
              </button>
            }
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
                <a [routerLink]="['/parts', part.id]" class="card-hover hover-glow p-4 group block animate-slide-up"
                   [style.animation-delay.ms]="$index * 50">
                  <!-- Image -->
                  <div class="aspect-[4/3] rounded-lg bg-primary-700 mb-4 overflow-hidden flex items-center justify-center">
                    @if (part.primary_image) {
                      <img [src]="part.primary_image" [alt]="part.name"
                           class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                           loading="lazy" />
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
                    <div class="flex items-center gap-2 flex-wrap">
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

                    <p class="text-xs text-primary-400 line-clamp-1">
                      {{ part.brand_name }} {{ part.model_name }} · {{ part.supplier_name }}
                    </p>

                    <div class="flex items-center justify-between pt-1">
                      <span class="text-lg font-bold text-accent font-mono">{{ part.price }} TND</span>
                      <span class="text-xs text-primary-500 font-mono">{{ part.reference }}</span>
                    </div>
                  </div>
                </a>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="flex items-center justify-center gap-2 mt-8">
                <button
                  (click)="goToPage(currentPage - 1)"
                  [disabled]="currentPage <= 1"
                  class="btn-ghost px-3 py-2 text-sm disabled:opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>

                @for (page of visiblePages(); track page) {
                  @if (page === -1) {
                    <span class="px-2 text-primary-500">...</span>
                  } @else {
                    <button
                      (click)="goToPage(page)"
                      class="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                      [class]="page === currentPage
                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                        : 'text-primary-400 hover:bg-primary-800 hover:text-primary-200'">
                      {{ page }}
                    </button>
                  }
                }

                <button
                  (click)="goToPage(currentPage + 1)"
                  [disabled]="currentPage >= totalPages()"
                  class="btn-ghost px-3 py-2 text-sm disabled:opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class PartsListComponent implements OnInit {
  parts = signal<Part[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  totalPages = signal(0);
  selectedCategoryName = signal('');
  searchQuery = '';
  stockFilter = false;
  priceMin: number | null = null;
  priceMax: number | null = null;
  currentPage = 1;
  pageSize = 12;
  filters: PartFilters = {};
  private searchTimeout: any;
  private priceTimeout: any;

  constructor(
    private partsService: PartsService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadParts();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res.results)
    });
  }

  loadParts(): void {
    this.loading.set(true);
    const filters: PartFilters = { ...this.filters, page: this.currentPage };
    if (this.searchQuery) filters.search = this.searchQuery;
    if (this.stockFilter) filters.in_stock = true;
    if (this.priceMin) filters.price_min = this.priceMin;
    if (this.priceMax) filters.price_max = this.priceMax;

    this.partsService.getParts(filters).subscribe({
      next: (res) => {
        this.parts.set(res.results);
        this.totalCount.set(res.count);
        this.totalPages.set(Math.ceil(res.count / this.pageSize));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadParts();
    }, 300);
  }

  onCategoryChange(): void {
    const cat = this.categories().find(c => c.id === this.filters.category);
    this.selectedCategoryName.set(cat?.name || '');
    this.currentPage = 1;
    this.loadParts();
  }

  onVehicleChange(selection: VehicleSelection): void {
    this.filters.brand = selection.brand?.id;
    this.filters.model = selection.model?.id;
    this.filters.model_year = selection.modelYear?.id;
    this.filters.engine = selection.engine?.id;
    this.currentPage = 1;
    this.loadParts();
  }

  onPriceChange(): void {
    clearTimeout(this.priceTimeout);
    this.priceTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadParts();
    }, 500);
  }

  activeFilterCount(): number {
    let count = 0;
    if (this.filters.condition) count++;
    if (this.filters.category) count++;
    if (this.stockFilter) count++;
    if (this.filters.brand) count++;
    if (this.priceMin || this.priceMax) count++;
    return count;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    this.loadParts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  visiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: number[] = [1];
    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  }

  clearFilters(): void {
    this.filters = {};
    this.searchQuery = '';
    this.stockFilter = false;
    this.priceMin = null;
    this.priceMax = null;
    this.currentPage = 1;
    this.selectedCategoryName.set('');
    this.loadParts();
  }
}
