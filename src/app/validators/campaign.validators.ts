// src/app/validators/campaign.validators.ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator sprawdzający, czy wartość 'campaignFund' jest przynajmniej 10-krotnością wartości 'bidAmount'.
 * Jeżeli warunek nie jest spełniony, zwraca błąd { insufficientFund: true }.
 *
 * @param control - FormGroup zawierająca pola 'bidAmount' oraz 'campaignFund'
 * @returns ValidationErrors lub null, gdy walidacja przejdzie pomyślnie
 */
export function fundValidator(control: AbstractControl): ValidationErrors | null {
  const bidAmount = control.get('bidAmount')?.value;
  const campaignFund = control.get('campaignFund')?.value;

  if (bidAmount != null && campaignFund != null && campaignFund < bidAmount * 10) {
    return { insufficientFund: true };
  }

  return null;
}
