import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [ngClass]="containerClass">
      <div
        class="border-2 border-primary-600 border-t-accent rounded-full animate-spin"
        [ngClass]="{
          'w-5 h-5': size === 'sm',
          'w-8 h-8': size === 'md',
          'w-12 h-12': size === 'lg'
        }">
      </div>
      @if (message) {
        <span class="ml-3 text-sm text-primary-400">{{ message }}</span>
      }
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message = '';
  @Input() containerClass = '';
}
