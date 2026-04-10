import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart } from '../../core/models/cart.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, TranslateModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <nav class="flex items-center gap-2 text-sm text-primary-400 mb-6">
        <a routerLink="/cart" class="hover:text-accent transition-colors">{{ 'CART.TITLE' | translate }}</a>
        <span>/</span>
        <span class="text-primary-200">{{ 'CHECKOUT.TITLE' | translate }}</span>
      </nav>

      <h1 class="text-2xl font-bold text-primary-50 tracking-tight mb-8">{{ 'CHECKOUT.TITLE' | translate }}</h1>

      @if (loading()) {
        <div class="space-y-4">
          <div class="card p-6 space-y-4">
            <div class="skeleton h-5 w-40"></div>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-3/4"></div>
          </div>
        </div>
      } @else if (!cart() || cart()!.items.length === 0) {
        <div class="card p-10 text-center">
          <p class="text-primary-400 mb-4">{{ 'CART.EMPTY' | translate }}</p>
          <a routerLink="/parts" class="btn-primary inline-flex">{{ 'CART.BROWSE' | translate }}</a>
        </div>
      } @else {
        <!-- Order Summary -->
        <div class="card p-6 mb-6">
          <h2 class="text-sm font-semibold text-primary-200 uppercase tracking-wider mb-4">{{ 'CHECKOUT.ORDER_SUMMARY' | translate }}</h2>

          <div class="divide-y divide-primary-700">
            @for (item of cart()!.items; track item.id) {
              <div class="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div class="w-14 h-14 rounded-lg bg-primary-700 overflow-hidden flex items-center justify-center shrink-0">
                  <span class="text-primary-500 text-sm">🔧</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-primary-100 line-clamp-1">{{ item.part_detail.name }}</p>
                  <p class="text-xs text-primary-400">Qty: {{ item.quantity }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-bold text-accent font-mono">{{ item.subtotal }} TND</p>
                  <p class="text-xs text-primary-500 font-mono">{{ item.part_detail.price }} each</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="card p-6 mb-6 space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-primary-400">Subtotal ({{ cart()!.items.length }} items)</span>
            <span class="text-primary-200 font-mono">{{ cart()!.total }} TND</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-primary-400">Shipping</span>
            <span class="text-success text-xs font-medium">Free</span>
          </div>
          <div class="border-t border-primary-700 pt-3 flex items-center justify-between">
            <span class="text-primary-100 font-semibold">{{ 'CART.TOTAL' | translate }}</span>
            <span class="text-xl font-bold text-accent font-mono">{{ cart()!.total }} TND</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button (click)="placeOrder()" [disabled]="placing()" class="btn-primary flex-1 text-center justify-center">
            @if (placing()) {
              <app-loading-spinner size="sm" />
              {{ 'CHECKOUT.PLACING' | translate }}
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
              {{ 'CHECKOUT.CONFIRM' | translate }}
            }
          </button>
          <a routerLink="/cart" class="btn-ghost text-center">{{ 'CHECKOUT.BACK_TO_CART' | translate }}</a>
        </div>

        <p class="text-xs text-primary-500 text-center mt-4">
          By placing this order, you agree to our terms of service.
        </p>
      }

      <!-- Success overlay -->
      @if (orderSuccess()) {
        <div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="card p-8 max-w-md w-full text-center animate-slide-up">
            <div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-primary-50 mb-2">{{ 'CHECKOUT.SUCCESS' | translate }}</h2>
            <p class="text-sm text-primary-400 mb-6">
              {{ 'CHECKOUT.SUCCESS_DESC' | translate }}
            </p>
            <div class="flex gap-3 justify-center">
              <a routerLink="/orders" class="btn-primary text-sm">{{ 'CHECKOUT.VIEW_ORDERS' | translate }}</a>
              <a routerLink="/parts" class="btn-secondary text-sm">{{ 'CHECKOUT.CONTINUE' | translate }}</a>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cart = signal<Cart | null>(null);
  loading = signal(true);
  placing = signal(false);
  orderSuccess = signal(false);

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.loadCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loading.set(false);
        if (!cart || cart.items.length === 0) {
          this.router.navigate(['/cart']);
        }
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/cart']);
      }
    });
  }

  placeOrder(): void {
    this.placing.set(true);
    this.orderService.createOrder().subscribe({
      next: () => {
        this.placing.set(false);
        this.orderSuccess.set(true);
      },
      error: (err) => {
        this.placing.set(false);
        this.toast.error(err.error?.error || 'Failed to place order');
      }
    });
  }
}
