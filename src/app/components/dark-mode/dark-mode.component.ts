import { Component, ViewEncapsulation } from '@angular/core';
import { DarkModeService } from '../../services/dark-mode.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dark-mode-toggle',
  template: `
   <!-- Dark Mode Toggle -->
<button (click)="toggleDarkMode()" class="p-2 rounded-full focus:outline-none transition-colors duration-200" [title]="isDarkMode ? 'Tryb Jasny' : 'Tryb Ciemny'">
  <span *ngIf="!isDarkMode">🌞</span>
  <span *ngIf="isDarkMode">🌙</span>
</button>

  `,
  standalone: true, // Dodaj to
  imports: [CommonModule], // Dodaj to
  encapsulation: ViewEncapsulation.None, // Dodaj to
})
export class DarkModeToggleComponent {
  isDarkMode = false;

  constructor(private darkModeService: DarkModeService) {
    this.isDarkMode = this.darkModeService.isDarkModeEnabled();
  }

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
    this.isDarkMode = this.darkModeService.isDarkModeEnabled();
  }
}
