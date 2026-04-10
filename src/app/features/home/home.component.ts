import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <!-- Background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-900 to-accent/10"></div>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-fade-in">
            <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span class="text-xs font-medium text-accent">Tunisia's #1 Car Parts Marketplace</span>
          </div>

          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-50 tracking-tight leading-tight animate-slide-up">
            Find the right parts
            <span class="text-accent"> for your vehicle</span>
          </h1>

          <p class="mt-6 text-lg text-primary-300 max-w-xl leading-relaxed animate-slide-up" style="animation-delay: 0.1s; opacity: 0">
            Browse thousands of car spare parts from trusted Tunisian suppliers.
            New and used parts for every make and model.
          </p>

          <div class="mt-10 flex flex-col sm:flex-row gap-4 animate-slide-up" style="animation-delay: 0.2s; opacity: 0">
            <a routerLink="/parts" class="btn-primary text-base px-8 py-3.5">
              Browse Parts
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </a>
            <a routerLink="/auth/register" class="btn-secondary text-base px-8 py-3.5">
              Become a Supplier
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="border-y border-primary-800 bg-primary-900/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          @for (stat of stats; track stat.label) {
            <div class="text-center animate-slide-up" [style.animation-delay.ms]="$index * 100" style="opacity: 0">
              <p class="text-2xl sm:text-3xl font-bold text-accent">{{ stat.value }}</p>
              <p class="text-sm text-primary-400 mt-1">{{ stat.label }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-14">
        <h2 class="text-3xl font-bold text-primary-50 tracking-tight">How It Works</h2>
        <p class="mt-3 text-primary-400">Find your parts in three simple steps</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        @for (step of steps; track step.title; let i = $index) {
          <div class="card-hover hover-glow p-8 text-center animate-slide-up" [style.animation-delay.ms]="i * 120" style="opacity: 0">
            <div class="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <span class="text-2xl">{{ step.icon }}</span>
            </div>
            <div class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold mb-4">
              {{ i + 1 }}
            </div>
            <h3 class="text-lg font-semibold text-primary-100 mb-2">{{ step.title }}</h3>
            <p class="text-sm text-primary-400 leading-relaxed">{{ step.description }}</p>
          </div>
        }
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-accent/10 via-primary-800 to-accent/10 border-y border-primary-700">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-primary-50 tracking-tight">
          Ready to find your parts?
        </h2>
        <p class="mt-3 text-primary-300 max-w-lg mx-auto">
          Join thousands of Tunisian car owners who find quality spare parts at the best prices.
        </p>
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/parts" class="btn-primary text-base px-8 py-3">Start Shopping</a>
          <a routerLink="/auth/register" class="btn-secondary text-base px-8 py-3">Create Free Account</a>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent {
  stats = [
    { value: '10K+', label: 'Parts Available' },
    { value: '500+', label: 'Trusted Suppliers' },
    { value: '24', label: 'Governorates' },
    { value: '99%', label: 'Satisfaction' }
  ];

  steps = [
    {
      icon: '🚗',
      title: 'Select Your Vehicle',
      description: 'Choose your car brand, model, year, and engine to find compatible parts.'
    },
    {
      icon: '🔍',
      title: 'Browse & Compare',
      description: 'Search through thousands of parts from multiple suppliers. Compare prices and conditions.'
    },
    {
      icon: '📦',
      title: 'Order & Receive',
      description: 'Add to cart, place your order, and receive your parts from verified suppliers.'
    }
  ];
}
