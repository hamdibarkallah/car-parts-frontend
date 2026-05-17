import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdersService, Order } from '../../../core/services/orders.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-primary-50 tracking-tight">📋 Mes Commandes</h1>
          <p class="text-sm text-primary-400 mt-1">{{ orders().length }} commandes passées</p>
        </div>
        <button (click)="createOrder()" 
                [disabled]="cartService.cartItems().length === 0"
                class="btn-primary text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M2 12h20"/>
          </svg>
          Commander depuis le panier
        </button>
      </div>

      <!-- Cart Summary -->
      @if (cartService.cartItems().length > 0) {
        <div class="card p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-primary-50">Panier actuel</h3>
              <p class="text-sm text-primary-400">{{ cartService.cartItems().length }} articles • {{ cartService.cartTotal() }} TND</p>
            </div>
            <button (click)="createOrder()" class="btn-success">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Passer commande
            </button>
          </div>
        </div>
      }

      <!-- Filter Tabs -->
      <div class="flex space-x-1 mb-6">
        <button (click)="selectedStatus.set('')" 
                [class]="selectedStatus() === '' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm">
          Toutes ({{ orders().length }})
        </button>
        <button (click)="selectedStatus.set('SUPPLIER_PENDING')" 
                [class]="selectedStatus() === 'SUPPLIER_PENDING' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm">
          En attente ({{ getOrdersByStatus('SUPPLIER_PENDING').length }})
        </button>
        <button (click)="selectedStatus.set('APPROVED')" 
                [class]="selectedStatus() === 'APPROVED' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm">
          Approuvées ({{ getOrdersByStatus('APPROVED').length }})
        </button>
        <button (click)="selectedStatus.set('REJECTED')" 
                [class]="selectedStatus() === 'REJECTED' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm">
          Rejetées ({{ getOrdersByStatus('REJECTED').length }})
        </button>
        <button (click)="selectedStatus.set('PAID')" 
                [class]="selectedStatus() === 'PAID' ? 'btn-primary' : 'btn-secondary'"
                class="text-sm">
          Payées ({{ getOrdersByStatus('PAID').length }})
        </button>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="card p-4 flex items-center gap-4">
              <div class="skeleton w-16 h-16 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="skeleton h-4 w-1/3"></div>
                <div class="skeleton h-3 w-1/4"></div>
              </div>
              <div class="skeleton h-8 w-20"></div>
            </div>
          }
        </div>
      } @else if (filteredOrders().length === 0) {
        <app-empty-state
          icon="📋"
          title="Aucune commande trouvée"
          description="Vous n'avez pas encore passé de commande">
        </app-empty-state>
      } @else {
        <div class="space-y-4">
          @for (order of filteredOrders(); track order.id) {
            <div class="card p-6">
              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <!-- Order Info -->
                <div class="flex-1">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-lg bg-primary-700 flex items-center justify-center shrink-0">
                      <span class="text-xl">📦</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-3 mb-2">
                        <h3 class="font-semibold text-primary-50">Commande #{{ order.id }}</h3>
                        <span [class]="'badge-' + ordersService.getStatusColor(order.status)" class="text-xs">
                          {{ ordersService.getStatusText(order.status) }}
                        </span>
                      </div>
                      
                      <div class="space-y-1 text-sm text-primary-400">
                        <p>Date: {{ formatDate(order.created_at) }}</p>
                        <p>Total: <span class="font-bold text-accent">{{ order.total_price }} TND</span></p>
                        @if (order.supplier_notes) {
                          <p class="text-info">Notes du fournisseur: {{ order.supplier_notes }}</p>
                        }
                      </div>
                      
                      <!-- Order Items -->
                      <div class="mt-4 space-y-2">
                        @for (item of order.items; track item.id) {
                          <div class="flex items-center gap-3 p-3 bg-primary-800/50 rounded-lg">
                            @if (item.part.primary_image) {
                              <img [src]="item.part.primary_image" [alt]="item.part.name" 
                                   class="w-12 h-12 rounded-lg object-cover" />
                            } @else {
                              <div class="w-12 h-12 rounded-lg bg-primary-700 flex items-center justify-center">
                                <span class="text-xs">🔧</span>
                              </div>
                            }
                            <div class="flex-1 min-w-0">
                              <p class="font-medium text-primary-100 text-sm">{{ item.part.name }}</p>
                              <p class="text-xs text-primary-400">{{ item.part.reference }} • {{ item.quantity }}x • {{ item.price }} TND</p>
                              <p class="text-xs text-primary-400">Vendeur: {{ item.supplier.company_name }}</p>
                            </div>
                            <div class="text-right">
                              <p class="font-bold text-accent text-sm">{{ item.total_price }} TND</p>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-2 lg:ml-6">
                  <button (click)="viewOrderDetails(order)" 
                          class="btn-secondary text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    Détails
                  </button>
                  
                  @if (ordersService.canPay(order.status)) {
                    <button (click)="payOrder(order)" 
                            class="btn-success text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                      Payer
                    </button>
                  }
                  
                  @if (ordersService.canCancel(order.status)) {
                    <button (click)="cancelOrder(order)" 
                            class="btn-danger text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      Annuler
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ClientOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  selectedStatus = signal('');

  constructor(
    private ordersService: OrdersService,
    private cartService: CartService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.ordersService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Failed to load orders');
      }
    });
  }

  filteredOrders(): Order[] {
    const status = this.selectedStatus();
    if (!status) return this.orders();
    return this.orders().filter(order => order.status === status);
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders().filter(order => order.status === status);
  }

  createOrder(): void {
    if (this.cartService.cartItems().length === 0) {
      this.toast.warning('Votre panier est vide');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir passer cette commande ? Le panier sera vidé après confirmation.')) {
      return;
    }

    this.ordersService.createOrder().subscribe({
      next: (order) => {
        this.toast.success('Commande passée avec succès !');
        this.loadOrders();
        this.cartService.loadCart(); // Refresh cart to show it's empty
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to create order');
      }
    });
  }

  payOrder(order: Order): void {
    // TODO: Implement payment flow
    this.toast.info('Fonctionnalité de paiement bientôt disponible');
  }

  cancelOrder(order: Order): void {
    if (!confirm(`Êtes-vous sûr de vouloir annuler la commande #${order.id} ?`)) return;
    
    // TODO: Implement cancel order API
    this.toast.info('Fonctionnalité d\'annulation bientôt disponible');
  }

  viewOrderDetails(order: Order): void {
    // TODO: Navigate to order details page or open modal
    console.log('View order details:', order);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
