import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart, CartItem } from '../../core/models/cart.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-primary-50 tracking-tight mb-8">{{ 'CART.TITLE' | translate }}</h1>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="card p-5 flex gap-5">
              <div class="skeleton w-20 h-20 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="skeleton h-4 w-1/2"></div>
                <div class="skeleton h-3 w-1/3"></div>
              </div>
              <div class="skeleton h-8 w-24"></div>
            </div>
          }
        </div>
      } @else if (!cart() || cart()!.items.length === 0) {
        <app-empty-state
          icon="🛒"
          [title]="'CART.EMPTY' | translate"
          [description]="'CART.EMPTY_DESC' | translate">
          <a routerLink="/parts" class="btn-primary mt-6">{{ 'CART.BROWSE' | translate }}</a>
        </app-empty-state>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-4">
            @for (item of cart()!.items; track item.id) {
              <div class="card p-5 flex flex-col sm:flex-row gap-5 animate-fade-in">
                <!-- Image placeholder -->
                <div class="w-full sm:w-20 h-32 sm:h-20 rounded-lg bg-primary-700 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary-500" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>

                <!-- Details -->
                <div class="flex-1 min-w-0">
                  <a [routerLink]="['/parts', item.part]"
                     class="font-semibold text-primary-100 hover:text-accent transition-colors line-clamp-1">
                    {{ item.part_detail.name }}
                  </a>
                  <p class="text-xs text-primary-400 mt-0.5 font-mono">{{ item.part_detail.reference }}</p>
                  <p class="text-xs text-primary-400 mt-1">
                    <span [class]="item.part_detail.condition === 'NEW' ? 'text-accent' : 'text-warning'">
                      {{ item.part_detail.condition }}
                    </span>
                    · {{ item.part_detail.supplier }}
                  </p>
                </div>

                <!-- Qty + Price -->
                <div class="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                  <div class="flex items-center border border-primary-600 rounded-lg">
                    <button (click)="updateQuantity(item, item.quantity - 1)"
                            [disabled]="item.quantity <= 1"
                            class="px-2.5 py-1 text-sm text-primary-300 hover:text-primary-50 hover:bg-primary-700
                                   rounded-l-lg transition-colors disabled:opacity-30">
                      −
                    </button>
                    <span class="px-3 py-1 text-sm font-medium text-primary-100 min-w-[2.5rem] text-center">
                      {{ item.quantity }}
                    </span>
                    <button (click)="updateQuantity(item, item.quantity + 1)"
                            class="px-2.5 py-1 text-sm text-primary-300 hover:text-primary-50 hover:bg-primary-700
                                   rounded-r-lg transition-colors">
                      +
                    </button>
                  </div>
                  <span class="text-lg font-bold text-accent font-mono">{{ item.subtotal }} TND</span>
                </div>

                <!-- Remove -->
                <button (click)="removeItem(item)"
                        class="self-start p-1.5 rounded-lg text-primary-500 hover:text-danger hover:bg-danger/10 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="card p-6 sticky top-24 space-y-5">
              <h3 class="text-lg font-semibold text-primary-100">{{ 'CHECKOUT.ORDER_SUMMARY' | translate }}</h3>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between text-primary-300">
                  <span>Items ({{ cart()!.item_count }})</span>
                  <span class="font-mono">{{ cart()!.total }} TND</span>
                </div>
                <div class="flex justify-between text-primary-300">
                  <span>Shipping</span>
                  <span class="text-success">Free</span>
                </div>
                <div class="border-t border-primary-700 pt-3 flex justify-between">
                  <span class="font-semibold text-primary-100">{{ 'CART.TOTAL' | translate }}</span>
                  <span class="text-xl font-bold text-accent font-mono">{{ cart()!.total }} TND</span>
                </div>
              </div>

              <a routerLink="/checkout" class="btn-primary w-full py-3 text-center block">
                {{ 'CART.CHECKOUT' | translate }}
              </a>

              <a routerLink="/parts" class="btn-ghost w-full text-center text-sm block">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CartComponent implements OnInit {
  loading = signal(true);

  constructor(
    public cartService: CartService,
    private toast: ToastService
  ) {}

  get cart() { return this.cartService.cart; }

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  updateQuantity(item: CartItem, newQty: number): void {
    if (newQty < 1) return;
    this.cartService.updateItem(item.id, newQty).subscribe({
      error: (err: any) => this.toast.error(err.error?.error || 'Failed to update quantity')
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.id).subscribe({
      next: () => this.toast.success('Item removed from cart'),
      error: () => this.toast.error('Failed to remove item')
    });
  }
}
