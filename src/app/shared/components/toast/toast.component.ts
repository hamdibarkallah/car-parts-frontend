import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="animate-slide-down rounded-lg px-4 py-3 shadow-xl border backdrop-blur-sm flex items-start gap-3"
          [ngClass]="{
            'bg-success-500/10 border-success-500/30 text-success-500': toast.type === 'success',
            'bg-danger-500/10 border-danger-500/30 text-danger-500': toast.type === 'error',
            'bg-warning-500/10 border-warning-500/30 text-warning-500': toast.type === 'warning',
            'bg-accent/10 border-accent/30 text-accent': toast.type === 'info'
          }">
          <span class="text-lg mt-0.5">
            @switch (toast.type) {
              @case ('success') { &#10003; }
              @case ('error') { &#10007; }
              @case ('warning') { &#9888; }
              @case ('info') { &#8505; }
            }
          </span>
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="text-current opacity-60 hover:opacity-100 transition-opacity ml-2">
            &#10005;
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
