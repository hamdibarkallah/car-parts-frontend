import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-floating-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <!-- Floating Cart Button -->
    @if (isVisible()) {
      <button
        (click)="toggleDrawer()"
        class="fixed bottom-6 end-6 z-50 w-14 h-14 bg-accent hover:bg-accent-400
               text-white rounded-full shadow-lg shadow-accent/30 flex items-center justify-center
               transition-all duration-300 hover:scale-110 group"
        [class.animate-bounce-subtle]="justAdded()">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
        <span class="absolute -top-1 -right-1 w-6 h-6 bg-danger text-white text-xs font-bold
                     rounded-full flex items-center justify-center ring-2 ring-primary-900">
          {{ cartService.itemCount() }}
        </span>
      </button>
    }

    <!-- Backdrop -->
    @if (drawerOpen()) {
      <div (click)="toggleDrawer()" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in"></div>
    }

    <!-- Drawer Panel -->
    <div class="fixed top-0 end-0 z-50 h-full w-full max-w-md bg-primary-800 border-s border-primary-700
                shadow-2xl shadow-black/50 transform transition-transform duration-300 ease-out flex flex-col"
         [class.translate-x-0]="drawerOpen()"
         [class]="!drawerOpen() ? (isRtl ? '-translate-x-full' : 'translate-x-full') : ''">

      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-primary-700">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <h2 class="text-lg font-bold text-primary-50">{{ 'CART.TITLE' | translate }}</h2>
          <span class="px-2 py-0.5 bg-accent/10 text-accent text-xs font-bold rounded-full">
            {{ cartService.itemCount() }}
          </span>
        </div>
        <button (click)="toggleDrawer()"
                class="p-2 rounded-lg text-primary-400 hover:text-primary-50 hover:bg-primary-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

      <!-- Items -->
      <div class="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
        @if (!cartService.cart() || cartService.cart()!.items.length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center py-12">
            <div class="w-16 h-16 rounded-full bg-primary-700 flex items-center justify-center mb-4">
              <span class="text-2xl">🛒</span>
            </div>
            <p class="text-primary-300 font-medium mb-1">{{ 'CART.EMPTY' | translate }}</p>
            <p class="text-primary-500 text-sm mb-4">{{ 'CART.EMPTY_DESC' | translate }}</p>
            <a routerLink="/parts" (click)="toggleDrawer()" class="btn-primary text-sm">
              {{ 'CART.BROWSE' | translate }}
            </a>
          </div>
        } @else {
          @for (item of cartService.cart()!.items; track item.id) {
            <div class="bg-primary-900/50 rounded-xl p-4 flex gap-3 group hover:bg-primary-900/80 transition-colors">
              <!-- Part icon -->
              <div class="w-12 h-12 rounded-lg bg-primary-700 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary-500" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <a [routerLink]="['/parts', item.part]" (click)="toggleDrawer()"
                   class="text-sm font-medium text-primary-100 hover:text-accent transition-colors line-clamp-1 block">
                  {{ item.part_detail.name }}
                </a>
                <p class="text-xs text-primary-500 font-mono mt-0.5">{{ item.part_detail.reference }}</p>

                <!-- Qty controls -->
                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center border border-primary-600 rounded-lg">
                    <button (click)="updateQuantity(item, item.quantity - 1)"
                            [disabled]="item.quantity <= 1"
                            class="px-2 py-0.5 text-xs text-primary-300 hover:text-primary-50 hover:bg-primary-700
                                   rounded-l-lg transition-colors disabled:opacity-30">−</button>
                    <span class="px-2.5 py-0.5 text-xs font-medium text-primary-100 min-w-[1.75rem] text-center">
                      {{ item.quantity }}
                    </span>
                    <button (click)="updateQuantity(item, item.quantity + 1)"
                            class="px-2 py-0.5 text-xs text-primary-300 hover:text-primary-50 hover:bg-primary-700
                                   rounded-r-lg transition-colors">+</button>
                  </div>
                  <span class="text-sm font-bold text-accent font-mono">{{ item.subtotal }} TND</span>
                </div>
              </div>

              <!-- Remove -->
              <button (click)="removeItem(item)"
                      class="self-start p-1 rounded-lg text-primary-600 hover:text-danger hover:bg-danger/10
                             transition-all opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          }
        }
      </div>

      <!-- Footer -->
      @if (cartService.cart() && cartService.cart()!.items.length > 0) {
        <div class="border-t border-primary-700 px-5 py-4 space-y-3 bg-primary-800">
          <div class="flex items-center justify-between">
            <span class="text-sm text-primary-300">{{ 'CART.TOTAL' | translate }}</span>
            <span class="text-xl font-bold text-accent font-mono">{{ cartService.cart()!.total }} TND</span>
          </div>
          <div class="flex gap-2">
            <a routerLink="/cart" (click)="toggleDrawer()"
               class="btn-ghost flex-1 text-center text-sm py-2.5">
              {{ 'MINI_CART.VIEW_CART' | translate }}
            </a>
            <a routerLink="/checkout" (click)="toggleDrawer()"
               class="btn-primary flex-1 text-center text-sm py-2.5">
              {{ 'CART.CHECKOUT' | translate }}
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-bounce-subtle {
      animation: bounce-subtle 0.5s ease;
    }
    @keyframes bounce-subtle {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    .scrollbar-thin::-webkit-scrollbar { width: 4px; }
    .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
    .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
  `]
})
export class FloatingCartComponent implements OnInit {
  drawerOpen = signal(false);
  justAdded = signal(false);
  private currentUrl = signal('');
  private prevItemCount = 0;

  // Hidden pages where the floating cart shouldn't show (cart & checkout pages)
  private hiddenRoutes = ['/cart', '/checkout'];

  isVisible = computed(() => {
    return this.auth.isClient()
      && this.cartService.itemCount() > 0
      && !this.hiddenRoutes.includes(this.currentUrl());
  });

  get isRtl(): boolean {
    return document.documentElement.getAttribute('dir') === 'rtl';
  }

  constructor(
    public cartService: CartService,
    public auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Track route changes to hide on cart/checkout pages
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.currentUrl.set(e.urlAfterRedirects);
      // Auto-close drawer on navigation
      if (this.drawerOpen()) this.drawerOpen.set(false);
    });

    // Load cart if logged in
    if (this.auth.isClient()) {
      this.cartService.loadCart().subscribe();
    }
  }

  toggleDrawer(): void {
    this.drawerOpen.update(v => !v);
  }

  updateQuantity(item: CartItem, newQty: number): void {
    if (newQty < 1) return;
    this.cartService.updateItem(item.id, newQty).subscribe({
      error: (err: any) => this.toast.error(err.error?.error || 'Failed to update')
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.id).subscribe({
      error: () => this.toast.error('Failed to remove item')
    });
  }

  // Close drawer on Escape key
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.drawerOpen()) this.drawerOpen.set(false);
  }
}
