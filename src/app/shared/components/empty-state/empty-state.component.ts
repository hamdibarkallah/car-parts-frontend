import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div class="w-20 h-20 rounded-full bg-primary-800 flex items-center justify-center mb-6">
        <span class="text-3xl text-primary-400">{{ icon }}</span>
      </div>
      <h3 class="text-lg font-semibold text-primary-200 mb-2">{{ title }}</h3>
      <p class="text-sm text-primary-400 max-w-md">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon = '📦';
  @Input() title = 'Nothing here yet';
  @Input() description = '';
}
