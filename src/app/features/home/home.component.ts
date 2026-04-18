import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <!-- ═══════════ HERO ═══════════ -->
    <section class="hero-section relative min-h-[100vh] flex items-center overflow-hidden">
      <!-- Blueprint grid -->
      <div class="hero-grid absolute inset-0 opacity-[0.035]"></div>
      <!-- Radial glow -->
      <div class="absolute top-1/3 left-1/4 w-[900px] h-[600px] rounded-full bg-accent/[0.07] blur-[150px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-accent/[0.04] blur-[120px] pointer-events-none"></div>
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-transparent to-primary-900"></div>
      <!-- Grain texture -->
      <div class="hero-grain absolute inset-0 pointer-events-none opacity-[0.03]"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <!-- Left: Content -->
          <div class="lg:col-span-7 xl:col-span-7">
            <!-- Badge -->
            <div class="hero-badge inline-flex items-center gap-3 mb-8">
              <span class="h-px w-8 bg-accent"></span>
              <span class="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                {{ 'HOME.BADGE' | translate }}
              </span>
            </div>

            <!-- Giant Title -->
            <h1 class="hero-title font-display tracking-wide leading-[0.85]">
              <span class="block text-primary-50 hero-word" style="--delay: 0s">
                {{ 'HOME.HERO_TITLE_1' | translate }}
              </span>
              <span class="block text-accent hero-word" style="--delay: 0.12s">
                {{ 'HOME.HERO_TITLE_2' | translate }}
              </span>
            </h1>

            <!-- Accent line -->
            <div class="hero-line mt-8 mb-6"></div>

            <!-- Description -->
            <p class="hero-desc text-base sm:text-lg text-primary-300 max-w-lg leading-relaxed">
              {{ 'HOME.HERO_DESC' | translate }}
            </p>

            <!-- CTAs -->
            <div class="hero-ctas mt-10 flex flex-col sm:flex-row gap-4">
              <a routerLink="/parts"
                 class="group relative inline-flex items-center gap-3 px-8 py-4 bg-accent text-white
                        font-semibold text-sm tracking-wide rounded-lg overflow-hidden
                        transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <span class="relative z-10">{{ 'HOME.BROWSE_PARTS' | translate }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
                <div class="absolute inset-0 bg-gradient-to-r from-accent-600 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
              <a routerLink="/auth/register"
                 class="group inline-flex items-center gap-3 px-8 py-4 border border-primary-600
                        text-primary-200 font-semibold text-sm tracking-wide rounded-lg
                        transition-all duration-300 hover:border-accent/50 hover:text-accent hover:bg-accent/5">
                {{ 'HOME.BECOME_SUPPLIER' | translate }}
              </a>
            </div>
          </div>

          <!-- Right: Stats Column -->
          <div class="lg:col-span-5 xl:col-span-5 hidden lg:flex flex-col gap-4 items-end">
            @for (stat of stats; track stat.labelKey; let i = $index) {
              <div class="stat-glass w-full max-w-[280px]" [style.--delay]="(i * 0.1 + 0.4) + 's'">
                <div class="flex items-baseline justify-between">
                  <span class="font-display text-4xl xl:text-5xl text-accent tracking-wide">{{ stat.value }}</span>
                  <span class="text-xs font-medium text-primary-400 tracking-wider uppercase">{{ stat.labelKey | translate }}</span>
                </div>
                <div class="mt-2 h-px w-full bg-gradient-to-r from-accent/30 via-primary-600/50 to-transparent"></div>
              </div>
            }
          </div>
        </div>

        <!-- Mobile Stats -->
        <div class="lg:hidden grid grid-cols-2 gap-3 mt-14">
          @for (stat of stats; track stat.labelKey) {
            <div class="stat-glass-mobile text-center">
              <span class="font-display text-3xl text-accent tracking-wide block">{{ stat.value }}</span>
              <span class="text-[10px] font-medium text-primary-400 tracking-wider uppercase mt-1 block">{{ stat.labelKey | translate }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-indicator">
        <span class="text-[10px] uppercase tracking-[0.3em] text-primary-500">{{ 'HOME.SCROLL' | translate }}</span>
        <div class="w-px h-8 bg-gradient-to-b from-primary-500 to-transparent scroll-line"></div>
      </div>
    </section>

    <!-- ═══════════ BRANDS MARQUEE ═══════════ -->
    <section class="relative border-y border-primary-800/60 bg-primary-950/50 overflow-hidden">
      <div class="marquee-container py-5">
        <div class="marquee-track">
          @for (brand of brandsDouble; track $index) {
            <span class="text-sm font-display tracking-[0.15em] text-primary-500 uppercase whitespace-nowrap">{{ brand }}</span>
            <span class="text-accent/30 mx-6">◆</span>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════ HOW IT WORKS ═══════════ -->
    <section class="relative py-24 sm:py-32 overflow-hidden">
      <!-- Subtle background -->
      <div class="absolute inset-0 bg-gradient-to-b from-primary-900 via-primary-900/95 to-primary-900"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Section Header -->
        <div class="flex items-center gap-4 mb-4">
          <span class="h-px flex-1 bg-gradient-to-r from-transparent via-primary-700 to-transparent"></span>
        </div>
        <div class="text-center mb-20">
          <span class="text-xs font-semibold tracking-[0.25em] uppercase text-accent">{{ 'HOME.HOW_IT_WORKS' | translate }}</span>
          <h2 class="font-display text-4xl sm:text-5xl text-primary-50 tracking-wide mt-4">
            {{ 'HOME.HOW_SUBTITLE' | translate }}
          </h2>
        </div>

        <!-- Steps -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-0">
          @for (step of steps; track step.titleKey; let i = $index) {
            <div class="step-card group relative px-8 py-10 md:px-10"
                 [ngClass]="{
                   'md:border-x border-primary-800/60': i === 1,
                   'border-b md:border-b-0 border-primary-800/60': i < 2
                 }">
              <!-- Giant step number -->
              <span class="step-number font-display text-[8rem] sm:text-[10rem] leading-none text-primary-800/40
                           absolute -top-4 -left-2 select-none pointer-events-none
                           transition-colors duration-500 group-hover:text-accent/10">
                0{{ i + 1 }}
              </span>

              <div class="relative z-10">
                <!-- Icon + number -->
                <div class="flex items-center gap-3 mb-6">
                  <span class="text-2xl">{{ step.icon }}</span>
                  <span class="text-xs font-mono text-accent tracking-widest">STEP 0{{ i + 1 }}</span>
                </div>

                <h3 class="text-xl font-bold text-primary-100 mb-3 tracking-tight">
                  {{ step.titleKey | translate }}
                </h3>
                <p class="text-sm text-primary-400 leading-relaxed">
                  {{ step.descKey | translate }}
                </p>

                <!-- Decorative bottom line -->
                <div class="mt-6 h-px w-12 bg-accent/30 transition-all duration-500 group-hover:w-full group-hover:bg-accent/50"></div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════ CTA ═══════════ -->
    <section class="relative py-24 sm:py-32 overflow-hidden">
      <!-- Angular gradient background -->
      <div class="absolute inset-0 cta-gradient"></div>
      <div class="hero-grid absolute inset-0 opacity-[0.02]"></div>
      <!-- Glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/[0.08] rounded-full blur-[100px]"></div>

      <div class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="text-xs font-semibold tracking-[0.25em] uppercase text-accent/70 block mb-6">{{ 'HOME.CTA_LABEL' | translate }}</span>
        <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl text-primary-50 tracking-wide leading-[0.9]">
          {{ 'HOME.CTA_TITLE' | translate }}
        </h2>
        <p class="mt-6 text-primary-300 max-w-md mx-auto leading-relaxed">
          {{ 'HOME.CTA_DESC' | translate }}
        </p>
        <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a routerLink="/parts"
             class="group relative inline-flex items-center justify-center gap-2 px-10 py-4 bg-accent text-white
                    font-semibold text-sm tracking-wide rounded-lg overflow-hidden
                    transition-all duration-300 hover:shadow-[0_0_50px_rgba(59,130,246,0.35)]">
            <span class="relative z-10">{{ 'HOME.START_SHOPPING' | translate }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
            <div class="absolute inset-0 bg-gradient-to-r from-accent-600 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          <a routerLink="/auth/register"
             class="inline-flex items-center justify-center px-10 py-4 border border-primary-600
                    text-primary-200 font-semibold text-sm tracking-wide rounded-lg
                    transition-all duration-300 hover:border-accent/50 hover:text-accent hover:bg-accent/5">
            {{ 'HOME.CREATE_ACCOUNT' | translate }}
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ── Blueprint Grid ── */
    .hero-grid {
      background-image:
        linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px);
      background-size: 80px 80px;
    }

    /* ── Grain Texture ── */
    .hero-grain {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-size: 128px 128px;
    }

    /* ── Hero Title ── */
    .hero-title {
      font-size: clamp(3.5rem, 9vw, 7.5rem);
    }

    .hero-word {
      display: block;
      opacity: 0;
      transform: translateY(30px);
      animation: heroReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: var(--delay, 0s);
    }

    @keyframes heroReveal {
      to { opacity: 1; transform: translateY(0); }
    }

    /* ── Badge ── */
    .hero-badge {
      opacity: 0;
      animation: heroReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
    }

    /* ── Accent Line ── */
    .hero-line {
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #3B82F6, transparent);
      animation: lineGrow 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s forwards;
    }
    @keyframes lineGrow {
      to { width: 120px; }
    }

    /* ── Description ── */
    .hero-desc {
      opacity: 0;
      transform: translateY(15px);
      animation: heroReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
    }

    /* ── CTAs ── */
    .hero-ctas {
      opacity: 0;
      transform: translateY(15px);
      animation: heroReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.55s forwards;
    }

    /* ── Stat Glass Cards ── */
    .stat-glass {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4));
      backdrop-filter: blur(12px);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 12px;
      padding: 20px 24px;
      opacity: 0;
      transform: translateX(30px);
      animation: statReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      animation-delay: var(--delay, 0.4s);
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .stat-glass:hover {
      border-color: rgba(59, 130, 246, 0.3);
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.08);
    }
    @keyframes statReveal {
      to { opacity: 1; transform: translateX(0); }
    }

    .stat-glass-mobile {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.3));
      backdrop-filter: blur(8px);
      border: 1px solid rgba(51, 65, 85, 0.4);
      border-radius: 10px;
      padding: 16px 12px;
    }

    /* ── Scroll Indicator ── */
    .scroll-indicator {
      opacity: 0;
      animation: heroReveal 0.5s ease 1.2s forwards;
    }
    .scroll-line {
      animation: scrollPulse 2s ease-in-out infinite;
    }
    @keyframes scrollPulse {
      0%, 100% { opacity: 0.3; transform: scaleY(1); }
      50% { opacity: 0.8; transform: scaleY(1.3); }
    }

    /* ── Brands Marquee ── */
    .marquee-container {
      mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
      -webkit-mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
    }
    .marquee-track {
      display: flex;
      align-items: center;
      width: max-content;
      animation: marquee 35s linear infinite;
    }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    /* ── Step Cards ── */
    .step-card {
      transition: background-color 0.4s;
    }
    .step-card:hover {
      background-color: rgba(30, 41, 59, 0.3);
    }

    /* ── CTA Gradient ── */
    .cta-gradient {
      background: linear-gradient(160deg, #0F172A 0%, #0c1425 40%, #111c36 60%, #0F172A 100%);
    }
  `]
})
export class HomeComponent {
  stats = [
    { value: '10K+', labelKey: 'HOME.STAT_PARTS' },
    { value: '500+', labelKey: 'HOME.STAT_SUPPLIERS' },
    { value: '24', labelKey: 'HOME.STAT_GOVERNORATES' },
    { value: '99%', labelKey: 'HOME.STAT_SATISFACTION' }
  ];

  steps = [
    { icon: '🚗', titleKey: 'HOME.STEP1_TITLE', descKey: 'HOME.STEP1_DESC' },
    { icon: '🔍', titleKey: 'HOME.STEP2_TITLE', descKey: 'HOME.STEP2_DESC' },
    { icon: '📦', titleKey: 'HOME.STEP3_TITLE', descKey: 'HOME.STEP3_DESC' }
  ];

  brands = [
    'VOLKSWAGEN', 'PEUGEOT', 'RENAULT', 'CITROËN', 'FIAT',
    'TOYOTA', 'HYUNDAI', 'KIA', 'BMW', 'MERCEDES',
    'AUDI', 'NISSAN', 'FORD', 'OPEL', 'SEAT'
  ];

  brandsDouble = [...this.brands, ...this.brands];
}
