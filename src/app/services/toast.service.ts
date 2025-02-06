import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000): void {
    const toast: Toast = { id: ++this.counter, message, type };
    this.toastSubject.next(toast);
    // Możesz dodać logikę usuwania toastu po określonym czasie w ToastComponent
  }
}
