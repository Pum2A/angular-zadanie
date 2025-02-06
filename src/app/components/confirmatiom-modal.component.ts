import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports:[CommonModule],
  template: `
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" *ngIf="show">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">{{ title }}</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-6">{{ message }}</p>
        <div class="flex justify-end space-x-4">
          <button (click)="confirm()"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            Tak
          </button>
          <button (click)="cancel()"
                  class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition">
            Nie
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmationModalComponent {
  @Input() title: string = 'Potwierdzenie';
  @Input() message: string = 'Czy jesteś pewien?';
  @Input() show: boolean = false;
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  confirm(): void {
    this.onConfirm.emit();
  }

  cancel(): void {
    this.onCancel.emit();
  }
}
