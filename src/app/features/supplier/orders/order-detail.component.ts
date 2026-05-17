import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SupplierOrdersService, Order, OrderValidationRequest } from '../../../core/services/supplier-orders.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order-detail',
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
          Retour
        </button>
        <h1 class="text-2xl font-bold text-primary-50 tracking-tight">Détails de la Commande</h1>
      </div>

      @if (loading()) {
        <app-loading-spinner></app-loading-spinner>
      } @else if (order()) {
        <div class="space-y-6">
          <!-- Order Header -->
          <div class="card p-6">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <div class="flex items-center gap-3 mb-4">
                  <h2 class="text-xl font-bold text-primary-50">Commande #{{ order().id }}</h2>
                  <span [class]="'badge-' + ordersService.getStatusColor(order().status)" class="text-sm">
                    {{ ordersService.getStatusText(order().status) }}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div class="space-y-2">
                    <p class="text-primary-400">Client</p>
                    <p class="font-medium text-primary-100">{{ order().client.user.username }}</p>
                    <p class="text-primary-300">{{ order().client.user.email }}</p>
                  </div>
                  
                  <div class="space-y-2">
                    <p class="text-primary-400">Date</p>
                    <p class="font-medium text-primary-100">{{ formatDate(order().created_at) }}</p>
                    <p class="text-primary-300">Mise à jour: {{ formatDate(order().updated_at) }}</p>
                  </div>
                </div>
                
                @if (order().supplier_notes) {
                  <div class="mt-4 p-4 bg-primary-800/50 rounded-lg">
                    <p class="text-sm text-primary-400 mb-1">Notes du fournisseur</p>
                    <p class="text-primary-100">{{ order().supplier_notes }}</p>
                  </div>
                }
              </div>
              
              <div class="text-right">
                <p class="text-sm text-primary-400 mb-2">Total</p>
                <p class="text-3xl font-bold text-accent">{{ order().total_price }} TND</p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-primary-200 mb-6">Articles de la commande</h3>
            
            <div class="space-y-4">
              @for (item of order().items; track item.id) {
                <div class="flex items-center gap-4 p-4 bg-primary-800/50 rounded-lg">
                  @if (item.part.primary_image) {
                    <img [src]="item.part.primary_image" [alt]="item.part.name" 
                         class="w-20 h-20 rounded-lg object-cover shrink-0" />
                  } @else {
                    <div class="w-20 h-20 rounded-lg bg-primary-700 flex items-center justify-center shrink-0">
                      <span class="text-xl">🔧</span>
                    </div>
                  }
                  
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-primary-100 text-lg">{{ item.part.name }}</h4>
                    <p class="text-primary-400 mb-2">{{ item.part.reference }}</p>
                    <div class="flex flex-wrap gap-4 text-sm">
                      <span class="text-primary-300">Quantité: <span class="font-medium text-primary-100">{{ item.quantity }}</span></span>
                      <span class="text-primary-300">Prix unitaire: <span class="font-medium text-primary-100">{{ item.price }} TND</span></span>
                      <span class="text-primary-300">Total: <span class="font-bold text-accent">{{ item.total_price }} TND</span></span>
                    </div>
                  </div>
                  
                  <div class="text-right shrink-0">
                    <p class="text-sm text-primary-400 mb-1">Vendeur</p>
                    <p class="font-medium text-primary-100">{{ item.supplier.business_name }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Validation Actions -->
          @if (ordersService.canValidate(order().status)) {
            <div class="card p-6">
              <h3 class="text-lg font-semibold text-primary-200 mb-6">Actions de validation</h3>
              
              <div class="space-y-4">
                <!-- Approve Section -->
                <div class="border-l-4 border-success pl-6">
                  <h4 class="font-medium text-success mb-2">✅ Approuver la commande</h4>
                  <p class="text-sm text-primary-400 mb-4">
                    Approuver cette commande signifie que vous pouvez livrer les articles demandés.
                  </p>
                  
                  <div class="space-y-3">
                    <textarea [(ngModel)]="approveNotes" 
                              placeholder="Notes optionnelles pour le client (ex: Délai de livraison, instructions spéciales)"
                              class="input w-full"
                              rows="3"></textarea>
                    
                    <button (click)="approveOrder()" 
                            [disabled]="isProcessing()"
                            class="btn-success">
                      @if (isProcessing()) {
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement...
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Approuver la commande
                      }
                    </button>
                  </div>
                </div>
                
                <!-- Reject Section -->
                <div class="border-l-4 border-danger pl-6">
                  <h4 class="font-medium text-danger mb-2">❌ Rejeter la commande</h4>
                  <p class="text-sm text-primary-400 mb-4">
                    Rejeter cette commande si vous ne pouvez pas livrer les articles.
                  </p>
                  
                  <div class="space-y-3">
                    <textarea [(ngModel)]="rejectNotes" 
                              placeholder="Veuillez indiquer la raison du rejet (obligatoire)"
                              class="input w-full"
                              rows="3"
                              required></textarea>
                    
                    <button (click)="rejectOrder()" 
                            [disabled]="isProcessing() || !rejectNotes.trim()"
                            class="btn-danger">
                      @if (isProcessing()) {
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement...
                      } @else {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        Rejeter la commande
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          
          <!-- Order Status Info -->
          @if (!ordersService.canValidate(order().status)) {
            <div class="card p-6">
              <h3 class="text-lg font-semibold text-primary-200 mb-4">Statut de la commande</h3>
              <div class="flex items-center gap-3">
                <span [class]="'badge-' + ordersService.getStatusColor(order().status)" class="text-sm">
                  {{ ordersService.getStatusText(order().status) }}
                </span>
                <p class="text-sm text-primary-400">
                  @if (ordersService.isApproved(order().status)) {
                    Cette commande a été approuvée et attend le paiement du client.
                  } @else if (ordersService.isRejected(order().status)) {
                    Cette commande a été rejetée par le fournisseur.
                  } @else if (ordersService.isCompleted(order().status)) {
                    Cette commande est terminée.
                  }
                </p>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="card p-12 text-center">
          <p class="text-primary-400">Commande non trouvée</p>
        </div>
      }
    </div>
  `
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(true);
  processing = signal(false);
  approveNotes = '';
  rejectNotes = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: SupplierOrdersService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(+orderId);
    } else {
      this.toast.error('ID de commande non valide');
      this.goBack();
    }
  }

  loadOrderDetails(orderId: number): void {
    this.loading.set(true);
    this.ordersService.getOrderDetails(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Failed to load order details');
        this.goBack();
      }
    });
  }

  approveOrder(): void {
    if (!this.order()) return;

    if (!confirm('Êtes-vous sûr de vouloir approuver cette commande ?')) return;

    this.processing.set(true);
    const validation: OrderValidationRequest = {
      action: 'approve',
      notes: this.approveNotes.trim()
    };

    this.ordersService.validateOrder(this.order()!.id, validation).subscribe({
      next: (response) => {
        this.processing.set(false);
        this.toast.success(response.message);
        this.loadOrderDetails(this.order()!.id); // Refresh order details
      },
      error: (err) => {
        this.processing.set(false);
        this.toast.error(err.error?.error || 'Failed to approve order');
      }
    });
  }

  rejectOrder(): void {
    if (!this.order()) return;

    const notes = this.rejectNotes.trim();
    if (!notes) {
      this.toast.warning('Veuillez indiquer la raison du rejet');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir rejeter cette commande ?')) return;

    this.processing.set(true);
    const validation: OrderValidationRequest = {
      action: 'reject',
      notes: notes
    };

    this.ordersService.validateOrder(this.order()!.id, validation).subscribe({
      next: (response) => {
        this.processing.set(false);
        this.toast.success(response.message);
        this.loadOrderDetails(this.order()!.id); // Refresh order details
      },
      error: (err) => {
        this.processing.set(false);
        this.toast.error(err.error?.error || 'Failed to reject order');
      }
    });
  }

  isProcessing(): boolean {
    return this.processing();
  }

  goBack(): void {
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
