import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PartsService } from '../../../core/services/parts.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Part } from '../../../core/models/part.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-part-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      @if (loading()) {
        <div class="animate-pulse space-y-6">
          <div class="skeleton h-6 w-48"></div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="skeleton h-96 rounded-xl"></div>
            <div class="space-y-4">
              <div class="skeleton h-8 w-3/4"></div>
              <div class="skeleton h-4 w-1/2"></div>
              <div class="skeleton h-10 w-32"></div>
              <div class="skeleton h-4 w-full"></div>
              <div class="skeleton h-4 w-full"></div>
            </div>
          </div>
        </div>
      } @else if (part()) {
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-primary-400 mb-6">
          <a routerLink="/" class="hover:text-accent transition-colors">Home</a>
          <span>/</span>
          <a routerLink="/parts" class="hover:text-accent transition-colors">Parts</a>
          <span>/</span>
          <span class="text-primary-200">{{ part()!.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <!-- Image Section -->
          <div>
            <div class="aspect-square rounded-xl bg-primary-800 border border-primary-700 overflow-hidden flex items-center justify-center">
              @if (part()!.primary_image) {
                <img [src]="part()!.primary_image" [alt]="part()!.name" class="w-full h-full object-contain" />
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 text-primary-600" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              }
            </div>
          </div>

          <!-- Info Section -->
          <div class="space-y-6">
            <!-- Badges -->
            <div class="flex items-center gap-2">
              <span [class]="part()!.condition === 'NEW' ? 'badge-new' : 'badge-used'">
                {{ part()!.condition }}
              </span>
              <span [class]="part()!.in_stock ? 'badge-in-stock' : 'badge-out-of-stock'">
                {{ part()!.in_stock ? 'In Stock (' + part()!.available_quantity + ')' : 'Out of Stock' }}
              </span>
            </div>

            <!-- Title -->
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-primary-50 tracking-tight">{{ part()!.name }}</h1>
              <p class="text-sm text-primary-400 mt-1 font-mono">{{ part()!.reference }}</p>
            </div>

            <!-- Price -->
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-accent font-mono">{{ part()!.price }}</span>
              <span class="text-lg text-primary-400">TND</span>
            </div>

            <!-- Add to Cart -->
            @if (auth.isClient() && part()!.in_stock) {
              <div class="flex items-center gap-4">
                <div class="flex items-center border border-primary-600 rounded-lg">
                  <button (click)="decrementQty()" class="px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-700 rounded-l-lg transition-colors">
                    −
                  </button>
                  <span class="px-4 py-2 text-sm font-medium text-primary-100 min-w-[3rem] text-center">{{ quantity() }}</span>
                  <button (click)="incrementQty()" class="px-3 py-2 text-primary-300 hover:text-primary-50 hover:bg-primary-700 rounded-r-lg transition-colors">
                    +
                  </button>
                </div>
                <button (click)="addToCart()" [disabled]="addingToCart()" class="btn-primary flex-1">
                  @if (addingToCart()) {
                    <app-loading-spinner size="sm" />
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                    </svg>
                    Add to Cart
                  }
                </button>
              </div>
            } @else if (!auth.loggedIn()) {
              <a routerLink="/auth/login" class="btn-primary w-full text-center">Sign in to purchase</a>
            }

            <!-- Specs -->
            <div class="card p-5 space-y-3">
              <h3 class="text-sm font-semibold text-primary-200 uppercase tracking-wider">Specifications</h3>
              <div class="grid grid-cols-2 gap-y-3 text-sm">
                <span class="text-primary-400">Brand</span>
                <span class="text-primary-100">{{ part()!.brand_name }}</span>
                <span class="text-primary-400">Model</span>
                <span class="text-primary-100">{{ part()!.model_name }}</span>
                <span class="text-primary-400">Year</span>
                <span class="text-primary-100">{{ part()!.model_year_value }}</span>
                @if (part()!.engine_name) {
                  <span class="text-primary-400">Engine</span>
                  <span class="text-primary-100">{{ part()!.engine_name }}</span>
                }
                <span class="text-primary-400">Category</span>
                <span class="text-primary-100">{{ part()!.category_name }}</span>
                <span class="text-primary-400">Supplier</span>
                <span class="text-primary-100">{{ part()!.supplier_name }}</span>
              </div>
            </div>

            <!-- Description -->
            @if (part()!.description) {
              <div>
                <h3 class="text-sm font-semibold text-primary-200 uppercase tracking-wider mb-2">Description</h3>
                <p class="text-sm text-primary-300 leading-relaxed">{{ part()!.description }}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class PartDetailComponent implements OnInit {
  part = signal<Part | null>(null);
  loading = signal(true);
  quantity = signal(1);
  addingToCart = signal(false);

  constructor(
    private route: ActivatedRoute,
    private partsService: PartsService,
    private cartService: CartService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.partsService.getPart(id).subscribe({
      next: (part) => { this.part.set(part); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  incrementQty(): void {
    const max = this.part()?.available_quantity ?? 99;
    if (this.quantity() < max) this.quantity.update(q => q + 1);
  }

  decrementQty(): void {
    if (this.quantity() > 1) this.quantity.update(q => q - 1);
  }

  addToCart(): void {
    if (!this.part()) return;
    this.addingToCart.set(true);
    this.cartService.addItem(this.part()!.id, this.quantity()).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.toast.success(`${this.part()!.name} added to cart!`);
      },
      error: (err) => {
        this.addingToCart.set(false);
        this.toast.error(err.error?.error || 'Failed to add to cart');
      }
    });
  }
}
