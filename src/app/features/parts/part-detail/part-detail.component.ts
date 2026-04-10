import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PartsService } from '../../../core/services/parts.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Part, PartImage } from '../../../core/models/part.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-part-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
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
          <span class="text-primary-200 line-clamp-1">{{ part()!.name }}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <!-- Image Gallery -->
          <div class="space-y-3">
            <!-- Main Image -->
            <div class="aspect-square rounded-xl bg-primary-800 border border-primary-700 overflow-hidden flex items-center justify-center relative">
              @if (currentImage()) {
                <img [src]="currentImage()" [alt]="part()!.name"
                     class="w-full h-full object-contain transition-opacity duration-200" />
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 text-primary-600" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
              }
              <!-- Image counter -->
              @if (allImages().length > 1) {
                <div class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs text-white font-medium">
                  {{ selectedImageIndex() + 1 }} / {{ allImages().length }}
                </div>
              }
              <!-- Nav arrows -->
              @if (allImages().length > 1) {
                <button (click)="prevImage()"
                        class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm
                               flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <button (click)="nextImage()"
                        class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm
                               flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              }
            </div>
            <!-- Thumbnails -->
            @if (allImages().length > 1) {
              <div class="flex gap-2 overflow-x-auto pb-1">
                @for (img of allImages(); track img.id; let i = $index) {
                  <button (click)="selectedImageIndex.set(i)"
                          class="w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all"
                          [class]="i === selectedImageIndex()
                            ? 'border-accent shadow-lg shadow-accent/20'
                            : 'border-primary-700 hover:border-primary-500 opacity-60 hover:opacity-100'">
                    <img [src]="img.image_url || img.image" [alt]="'Image ' + (i + 1)"
                         class="w-full h-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Info Section -->
          <div class="space-y-6">
            <!-- Badges -->
            <div class="flex items-center gap-2">
              <span [class]="part()!.condition === 'NEW' ? 'badge-new' : 'badge-used'">
                {{ part()!.condition }}
              </span>
              <span [class]="part()!.is_in_stock ? 'badge-in-stock' : 'badge-out-of-stock'">
                {{ part()!.is_in_stock ? ('PARTS.IN_STOCK' | translate) + ' (' + part()!.available_quantity + ')' : ('PARTS.OUT_OF_STOCK' | translate) }}
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
            @if (auth.isClient() && part()!.is_in_stock) {
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
                    {{ 'PART_DETAIL.ADD_TO_CART' | translate }}
                  }
                </button>
              </div>
            } @else if (!auth.loggedIn()) {
              <a routerLink="/auth/login" class="btn-primary w-full text-center">{{ 'PART_DETAIL.SIGN_IN_TO_BUY' | translate }}</a>
            }

            <!-- Specs -->
            <div class="card p-5 space-y-3">
              <h3 class="text-sm font-semibold text-primary-200 uppercase tracking-wider">{{ 'PART_DETAIL.SPECS' | translate }}</h3>
              <div class="grid grid-cols-2 gap-y-3 text-sm">
                <span class="text-primary-400">{{ 'PART_DETAIL.BRAND' | translate }}</span>
                <span class="text-primary-100">{{ part()!.brand_name }}</span>
                <span class="text-primary-400">{{ 'PART_DETAIL.MODEL' | translate }}</span>
                <span class="text-primary-100">{{ part()!.model_name }}</span>
                <span class="text-primary-400">{{ 'PART_DETAIL.YEAR' | translate }}</span>
                <span class="text-primary-100">{{ part()!.model_year_value }}</span>
                @if (part()!.engine_name) {
                  <span class="text-primary-400">{{ 'PART_DETAIL.ENGINE' | translate }}</span>
                  <span class="text-primary-100">{{ part()!.engine_name }}</span>
                }
                <span class="text-primary-400">{{ 'PART_DETAIL.CATEGORY' | translate }}</span>
                <span class="text-primary-100">{{ part()!.category_name }}</span>
                <span class="text-primary-400">{{ 'PART_DETAIL.SUPPLIER' | translate }}</span>
                <span class="text-primary-100">{{ part()!.supplier_name }}</span>
              </div>
            </div>

            <!-- Description -->
            @if (part()!.description) {
              <div>
                <h3 class="text-sm font-semibold text-primary-200 uppercase tracking-wider mb-2">{{ 'PART_DETAIL.DESCRIPTION' | translate }}</h3>
                <p class="text-sm text-primary-300 leading-relaxed whitespace-pre-line">{{ part()!.description }}</p>
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
  allImages = signal<PartImage[]>([]);
  loading = signal(true);
  quantity = signal(1);
  addingToCart = signal(false);
  selectedImageIndex = signal(0);

  currentImage = computed(() => {
    const images = this.allImages();
    const idx = this.selectedImageIndex();
    if (images.length > 0 && idx < images.length) {
      return images[idx].image_url || images[idx].image;
    }
    return this.part()?.primary_image || null;
  });

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
      next: (part) => {
        this.part.set(part);
        this.loading.set(false);
        if (part.images && part.images.length > 0) {
          this.allImages.set(part.images);
        }
        this.loadImages(id);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadImages(partId: number): void {
    this.partsService.getPartImages(partId).subscribe({
      next: (images) => {
        if (images && images.length > 0) {
          this.allImages.set(images);
        }
      }
    });
  }

  prevImage(): void {
    const len = this.allImages().length;
    if (len <= 1) return;
    this.selectedImageIndex.set((this.selectedImageIndex() - 1 + len) % len);
  }

  nextImage(): void {
    const len = this.allImages().length;
    if (len <= 1) return;
    this.selectedImageIndex.set((this.selectedImageIndex() + 1) % len);
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
