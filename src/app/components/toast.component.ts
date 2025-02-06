import { Component, OnInit } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="fixed top-5 right-5 z-50">
      <div *ngFor="let toast of toasts"
           class="mb-2 p-4 rounded shadow-lg transition-all duration-300"
           [ngClass]="{
             'bg-green-500 text-white': toast.type === 'success',
             'bg-red-500 text-white': toast.type === 'error',
             'bg-blue-500 text-white': toast.type === 'info'
           }">
        {{ toast.message }}
      </div>
    </div>
  `,
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.subscribe((toast) => {
      this.toasts.push(toast);
      // Usuwamy toast po 3 sekundach
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== toast.id);
      }, 3000);
    });
  }
}
