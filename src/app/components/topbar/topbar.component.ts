import { Component, ViewEncapsulation } from '@angular/core';
import { DarkModeToggleComponent } from '../dark-mode/dark-mode.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [DarkModeToggleComponent],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'], // Poprawione: styleUrls zamiast styleUrl
  encapsulation: ViewEncapsulation.None, // Dodaj to
})
export class TopbarComponent {}
