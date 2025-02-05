import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private isDarkMode = false;
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);

    if (this.isBrowser()) {
      // Sprawdź stan z localStorage tylko w przeglądarce
      const savedMode = localStorage.getItem('isDarkMode');
      this.isDarkMode = savedMode === 'true';
    } else {
      // Ustaw domyślną wartość dla środowisk bez localStorage
      this.isDarkMode = false;
    }

    this.updateDarkModeClass();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isBrowser()) {
      localStorage.setItem('isDarkMode', String(this.isDarkMode));
    }

    this.updateDarkModeClass();
  }

  isDarkModeEnabled(): boolean {
    return this.isDarkMode;
  }

  // DarkModeService
private updateDarkModeClass() {
  if (this.isBrowser()) {
    if (this.isDarkMode) {
      this.renderer.addClass(document.documentElement, 'dark');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark');
    }
  }
}


  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
