import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupplierOrdersService, Order, OrderValidationRequest } from '../../../core/services/supplier-orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order-detail-perfect',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, TranslateModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <button (click)="goBack()" class="btn-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour aux commandes
        </button>
        <h1 class="text-3xl font-bold text-primary-50 tracking-tight">Détails de la Commande</h1>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (order()) {
        <div class="space-y-6">
          <!-- ORDER HEADER CARD -->
          <div class="card p-6 border-2 border-primary-700">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-4">
                  <h2 class="text-2xl font-bold text-primary-50">Commande #{{ order()?.id }}</h2>
                  <span [class]="'badge-' + ordersService.getStatusColor(order()?.status || '')" class="text-sm font-medium px-4 py-2 rounded-full">
                    {{ ordersService.getStatusText(order()?.status || '') }}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-3">
                    <div>
                      <p class="text-sm text-primary-400 mb-1">👤 Client</p>
                      <p class="font-semibold text-primary-100 text-lg">{{ order()?.client?.user?.username }}</p>
                      <p class="text-primary-300">{{ order()?.client?.user?.email }}</p>
                    </div>
                    
                    <div>
                      <p class="text-sm text-primary-400 mb-1">📅 Date de commande</p>
                      <p class="font-medium text-primary-100">{{ formatDate(order()?.created_at || '') }}</p>
                      <p class="text-primary-300">Mise à jour: {{ formatDate(order()?.updated_at || '') }}</p>
                    </div>
                  </div>
                  
                  <div class="space-y-3">
                    <div>
                      <p class="text-sm text-primary-400 mb-1">💰 Total de la commande</p>
                      <p class="text-3xl font-bold text-accent">{{ order()?.total_price }} TND</p>
                    </div>
                    
                    @if (order()?.supplier_notes) {
                      <div>
                        <p class="text-sm text-primary-400 mb-1">📝 Notes du fournisseur</p>
                        <div class="p-3 bg-primary-800/50 rounded-lg border border-primary-600">
                          <p class="text-primary-100">{{ order()?.supplier_notes }}</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ORDER ITEMS CARD -->
          <div class="card p-6 border-2 border-primary-700">
            <h3 class="text-xl font-semibold text-primary-200 mb-6 flex items-center gap-2">
              📋 Articles de la commande ({{ order()?.items?.length || 0 }})
            </h3>
            
            <div class="space-y-4">
              @for (item of order()?.items || []; track item.id; let i = $index) {
                <div class="flex items-center gap-4 p-4 bg-primary-800/50 rounded-lg border border-primary-600">
                  @if (item.part.primary_image) {
                    <img [src]="item.part.primary_image" [alt]="item.part.name" 
                         class="w-24 h-24 rounded-lg object-cover shrink-0 border-2 border-primary-600" />
                  } @else {
                    <div class="w-24 h-24 rounded-lg bg-primary-700 flex items-center justify-center shrink-0 border-2 border-primary-600">
                      <span class="text-2xl">🔧</span>
                    </div>
                  }
                  
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-primary-100 text-lg mb-2">{{ item.part.name }}</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p class="text-primary-400">Référence</p>
                        <p class="font-medium text-primary-100">{{ item.part.reference }}</p>
                      </div>
                      <div>
                        <p class="text-primary-400">Quantité</p>
                        <p class="font-medium text-primary-100">{{ item.quantity }} unité(s)</p>
                      </div>
                      <div>
                        <p class="text-primary-400">Prix unitaire</p>
                        <p class="font-medium text-primary-100">{{ item.price }} TND</p>
                      </div>
                    </div>
                    <div class="mt-3 flex items-center gap-4">
                      <span class="text-primary-400">Vendeur:</span>
                      <span class="font-medium text-primary-100">{{ item.supplier.company_name }}</span>
                      <span class="text-accent font-bold">Total: {{ item.total_price }} TND</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- VALIDATION ACTIONS CARD -->
          @if (ordersService.canValidate(order()?.status || '')) {
            <div class="card p-6 border-2 border-warning">
              <h3 class="text-xl font-semibold text-primary-200 mb-6 flex items-center gap-2">
                ⚡ Actions de Validation
              </h3>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- APPROVE SECTION -->
                <div class="border-l-4 border-success bg-success/10 p-6 rounded-lg">
                  <div class="mb-4">
                    <h4 class="font-semibold text-success text-lg mb-2 flex items-center gap-2">
                      ✅ Approuver la commande
                    </h4>
                    <p class="text-sm text-primary-300">
                      Approuver cette commande signifie que vous pouvez livrer les articles demandés. Le client sera notifié et pourra procéder au paiement.
                    </p>
                  </div>
                  
                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-primary-400 mb-2">
                        Notes pour le client (optionnel)
                      </label>
                      <textarea [(ngModel)]="approveNotes" 
                                placeholder="Ex: Délai de livraison, instructions spéciales, confirmation de stock..."
                                class="input w-full"
                                rows="4"></textarea>
                    </div>
                    
                    <button (click)="approveOrder()" 
                            [disabled]="isProcessing()"
                            class="btn-success w-full font-medium py-3">
                      @if (isProcessing()) {
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement en cours...
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 inline" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Approuver cette commande
                      }
                    </button>
                  </div>
                </div>
                
                <!-- REJECT SECTION -->
                <div class="border-l-4 border-danger bg-danger/10 p-6 rounded-lg">
                  <div class="mb-4">
                    <h4 class="font-semibold text-danger text-lg mb-2 flex items-center gap-2">
                      ❌ Rejeter la commande
                    </h4>
                    <p class="text-sm text-primary-300">
                      Rejeter cette commande si vous ne pouvez pas livrer les articles. Le stock sera restauré et le client sera notifié.
                    </p>
                  </div>
                  
                  <div class="space-y-3">
                    <div>
                      <label class="block text-sm font-medium text-primary-400 mb-2">
                        Raison du rejet (obligatoire)
                      </label>
                      <textarea [(ngModel)]="rejectNotes" 
                                placeholder="Veuillez expliquer pourquoi vous ne pouvez pas accepter cette commande..."
                                class="input w-full"
                                rows="4"
                                required></textarea>
                    </div>
                    
                    <button (click)="rejectOrder()" 
                            [disabled]="isProcessing() || !rejectNotes.trim()"
                            class="btn-danger w-full font-medium py-3">
                      @if (isProcessing()) {
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement en cours...
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 inline" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        Rejeter cette commande
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          
          <!-- ORDER STATUS INFO -->
          @if (!ordersService.canValidate(order()?.status || '')) {
            <div class="card p-6 border-2 border-primary-700">
              <h3 class="text-xl font-semibold text-primary-200 mb-4 flex items-center gap-2">
                ℹ️ Statut de la commande
              </h3>
              <div class="flex items-center gap-4">
                <span [class]="'badge-' + ordersService.getStatusColor(order()?.status || '')" class="text-sm font-medium px-4 py-2 rounded-full">
                  {{ ordersService.getStatusText(order()?.status || '') }}
                </span>
                <div class="text-sm text-primary-300">
                  @if (ordersService.isApproved(order()?.status || '')) {
                    <p>✅ Cette commande a été approuvée et attend le paiement du client.</p>
                  } @else if (ordersService.isRejected(order()?.status || '')) {
                    <p>❌ Cette commande a été rejetée par le fournisseur.</p>
                  } @else if (ordersService.isCompleted(order()?.status || '')) {
                    <p>🎉 Cette commande est terminée.</p>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="card p-12 text-center border-2 border-danger">
          <p class="text-danger text-lg">Commande non trouvée</p>
        </div>
      }
    </div>
  `
})
export class OrderDetailPerfectComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);
  processing = signal(false);
  approveNotes = '';
  rejectNotes = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public ordersService: SupplierOrdersService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      console.log('🔍 Loading order details for ID:', orderId);
      this.loadOrderDetails(+orderId);
    } else {
      console.error('❌ No order ID provided');
      this.toast.error('ID de commande non valide');
      this.goBack();
    }
  }

  loadOrderDetails(orderId: number): void {
    console.log('📦 Loading order details...');
    this.loading.set(true);
    this.ordersService.getOrderDetails(orderId).subscribe({
      next: (order) => {
        console.log('✅ Order details loaded:', order);
        this.order.set(order);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error loading order details:', err);
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Failed to load order details');
        this.goBack();
      }
    });
  }

  // approveOrder(): void {
  //   if (!this.order()) return;

  //   console.log('🟢 Approving order:', this.order()!.id);
    
  //   if (!confirm(`✅ Confirmer l'approbation de la commande #${this.order()!.id} ?\n\nTotal: ${this.order()!.total_price} TND\nClient: ${this.order()!.client.user.username}`)) {
  //     return;
  //   }

  //   this.processing.set(true);
  //   const validation: OrderValidationRequest = {
  //     action: 'approve',
  //     notes: this.approveNotes.trim() || 'Commande approuvée par le fournisseur'
  //   };

  //   console.log('📤 Sending approval request to:', `${this.ordersService['baseUrl']}/supplier/orders/${this.order()!.id}/validate/`);
  //   console.log('📤 Request payload:', validation);
    
  //   this.ordersService.validateOrder(this.order()!.id, validation).subscribe({
  //     next: (response) => {
  //       console.log('✅ Order approved successfully:', response);
  //       this.processing.set(false);
  //       this.toast.success(`✅ Commande #${this.order()!.id} approuvée avec succès !`);
  //       this.loadOrderDetails(this.order()!.id); // Refresh order details
  //     },
  //     error: (err) => {
  //       console.error('❌ Error approving order:', err);
  //       console.error('❌ Error details:', err.error);
  //       this.processing.set(false);
  //       this.toast.error(err.error?.error || 'Failed to approve order');
  //     }
  //   });
  // }

  // rejectOrder(): void {
  //   if (!this.order()) return;

  //   const notes = this.rejectNotes.trim();
  //   if (!notes) {
  //     this.toast.warning('⚠️ Veuillez indiquer la raison du rejet');
  //     return;
  //   }

  //   console.log('🔴 Rejecting order:', this.order()!.id);
    
  //   if (!confirm(`❌ Confirmer le rejet de la commande #${this.order()!.id} ?\n\nTotal: ${this.order()!.total_price} TND\nClient: ${this.order()!.client.user.username}\n\nRaison: ${notes}`)) {
  //     return;
  //   }

  //   this.processing.set(true);
  //   const validation: OrderValidationRequest = {
  //     action: 'reject',
  //     notes: notes
  //   };

  //   console.log('📤 Sending rejection request to:', `${this.ordersService['baseUrl']}/supplier/orders/${this.order()!.id}/validate/`);
  //   console.log('📤 Request payload:', validation);
    
  //   this.ordersService.validateOrder(this.order()!.id, validation).subscribe({
  //     next: (response) => {
  //       console.log('✅ Order rejected successfully:', response);
  //       this.processing.set(false);
  //       this.toast.success(`❌ Commande #${this.order()!.id} rejetée avec succès !`);
  //       this.loadOrderDetails(this.order()!.id); // Refresh order details
  //     },
  //     error: (err) => {
  //       console.error('❌ Error rejecting order:', err);
  //       console.error('❌ Error details:', err.error);
  //       this.processing.set(false);
  //       this.toast.error(err.error?.error || 'Failed to reject order');
  //     }
  //   });
  // }


  approveOrder(): void {
  const order = this.order();
  if (!order) return;

  console.log('🟢 Approving order:', order.id);

  const clientName = order.client?.user?.username ?? 'ce client';

  if (!confirm(`✅ Confirmer l'approbation de la commande #${order.id} ?\n\nTotal: ${order.total_price} TND\nClient: ${clientName}`)) {
    return;
  }

  this.processing.set(true);
  const validation: OrderValidationRequest = {
    action: 'approve',
    notes: this.approveNotes.trim() || 'Commande approuvée par le fournisseur'
  };

  this.ordersService.validateOrder(order.id, validation).subscribe({
    next: (response) => {
      console.log('✅ Order approved successfully:', response);
      this.processing.set(false);
      this.toast.success(`✅ Commande #${order.id} approuvée avec succès !`);
      this.loadOrderDetails(order.id);
    },
    error: (err) => {
      console.error('❌ Error approving order:', err);
      this.processing.set(false);
      this.toast.error(err.error?.error || 'Failed to approve order');
    }
  });
}

rejectOrder(): void {
  const order = this.order();
  if (!order) return;

  const notes = this.rejectNotes.trim();
  if (!notes) {
    this.toast.warning('⚠️ Veuillez indiquer la raison du rejet');
    return;
  }

  console.log('🔴 Rejecting order:', order.id);

  const clientName = order.client?.user?.username ?? 'ce client';

  if (!confirm(`❌ Confirmer le rejet de la commande #${order.id} ?\n\nTotal: ${order.total_price} TND\nClient: ${clientName}\n\nRaison: ${notes}`)) {
    return;
  }

  this.processing.set(true);
  const validation: OrderValidationRequest = {
    action: 'reject',
    notes: notes
  };

  this.ordersService.validateOrder(order.id, validation).subscribe({
    next: (response) => {
      console.log('✅ Order rejected successfully:', response);
      this.processing.set(false);
      this.toast.success(`❌ Commande #${order.id} rejetée avec succès !`);
      this.loadOrderDetails(order.id);
    },
    error: (err) => {
      console.error('❌ Error rejecting order:', err);
      this.processing.set(false);
      this.toast.error(err.error?.error || 'Failed to reject order');
    }
  });
}

  isProcessing(): boolean {
    return this.processing();
  }

  goBack(): void {
    console.log('🔙 Going back to orders list');
    this.router.navigate(['/supplier/orders']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
