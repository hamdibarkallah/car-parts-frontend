import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

interface Language {
  code: string;
  label: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative" (clickOutside)="open = false">
      <button (click)="open = !open"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-primary-300
                     hover:text-primary-50 hover:bg-primary-800 transition-all duration-200 cursor-pointer">
        <span class="text-base leading-none">{{ currentLang.flag }}</span>
        <span class="hidden sm:inline text-xs font-medium">{{ currentLang.code.toUpperCase() }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 transition-transform" [class.rotate-180]="open"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      @if (open) {
        <div class="absolute right-0 top-full mt-1 w-40 bg-primary-800 border border-primary-700 rounded-lg shadow-xl
                    shadow-black/30 overflow-hidden animate-scale-in z-50">
          @for (lang of languages; track lang.code) {
            <button (click)="switchLang(lang)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors cursor-pointer"
                    [class]="lang.code === currentLang.code
                      ? 'bg-accent/10 text-accent'
                      : 'text-primary-300 hover:bg-primary-700 hover:text-primary-50'">
              <span class="text-base">{{ lang.flag }}</span>
              <span class="font-medium">{{ lang.label }}</span>
              @if (lang.code === currentLang.code) {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-auto" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  host: {
    '(document:click)': 'onDocClick($event)'
  }
})
export class LanguageSwitcherComponent implements OnInit {
  languages: Language[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'ar', label: 'العربية', flag: '🇹🇳', dir: 'rtl' },
    { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' }
  ];

  currentLang: Language = this.languages[0];
  open = false;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('lang') || 'fr';
    this.currentLang = this.languages.find(l => l.code === saved) || this.languages[0];
    this.translate.use(this.currentLang.code);
    this.applyDir(this.currentLang.dir);
  }

  switchLang(lang: Language): void {
    this.currentLang = lang;
    this.translate.use(lang.code);
    localStorage.setItem('lang', lang.code);
    this.applyDir(lang.dir);
    this.open = false;
  }

  private applyDir(dir: 'ltr' | 'rtl'): void {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', this.currentLang.code);
  }

  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-language-switcher')) {
      this.open = false;
    }
  }
}
