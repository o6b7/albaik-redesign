/** Saved card in `users/{uid}/paymentMethods`. */
export interface PaymentMethod {
  id: string;
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'other';
  isDefault: boolean;
}

/** Saved delivery address in `users/{uid}/addresses`. */
export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}
