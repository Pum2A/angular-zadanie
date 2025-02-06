import { InjectionToken } from '@angular/core';

export const LOCAL_STORAGE = new InjectionToken<Storage>('LocalStorage', {
  providedIn: 'root',
  factory: () => {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : {} as Storage;
  }
});
