import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from './components/topbar/topbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/popups/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    TopbarComponent,
    FooterComponent,
    ToastComponent,
  ],
  template: `
    <app-topbar></app-topbar>
    <main
      class="min-h-fit bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 py-8"
    >
      <router-outlet></router-outlet>
      <app-toast></app-toast>
    </main>
    <app-footer></app-footer>
  `,
  styles: [],
})
export class AppComponent {
  title = 'Project';
}
