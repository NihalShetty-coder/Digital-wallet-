import { Timestamp } from 'firebase/firestore';

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  INR = 'INR',
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
}

export interface Account {
  id: string;
  uid: string;
  accountNumber: string;
  currency: Currency;
  balance: number;
  createdAt: Timestamp;
}

export interface Transaction {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  sourceUid: string;
  destinationUid: string;
  sourceEmail: string;
  destinationEmail: string;
  amount: number;
  currency: Currency;
  timestamp: Timestamp;
  description?: string;
}

export interface PaymentMethod {
  id: string;
  uid: string;
  type: 'CreditCard' | 'BankAccount';
  details: {
    cardNumber?: string;
    expirationDate?: string;
    cvv?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}
