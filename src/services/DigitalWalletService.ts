import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  runTransaction, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Account, 
  Currency, 
  Transaction, 
  PaymentMethod, 
  OperationType 
} from '../types';
import { handleFirestoreError } from '../lib/error-handler';

export class DigitalWalletService {
  private static instance: DigitalWalletService;

  private constructor() {}

  public static getInstance(): DigitalWalletService {
    if (!DigitalWalletService.instance) {
      DigitalWalletService.instance = new DigitalWalletService();
    }
    return DigitalWalletService.instance;
  }

  private generateAccountNumber(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  public async createAccount(uid: string, currency: Currency): Promise<void> {
    try {
      const accountRef = doc(collection(db, 'accounts'));
      const account: Account = {
        id: accountRef.id,
        uid,
        accountNumber: this.generateAccountNumber(),
        currency,
        balance: 0,
        createdAt: serverTimestamp() as any,
      };
      await setDoc(accountRef, account);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'accounts');
    }
  }

  public async getAccounts(uid: string): Promise<Account[]> {
    try {
      const q = query(collection(db, 'accounts'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Account);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'accounts');
      return [];
    }
  }

  public async addPaymentMethod(uid: string, type: 'CreditCard' | 'BankAccount', details: any): Promise<void> {
    try {
      const methodRef = doc(collection(db, 'paymentMethods'));
      const method: PaymentMethod = {
        id: methodRef.id,
        uid,
        type,
        details,
      };
      await setDoc(methodRef, method);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'paymentMethods');
    }
  }

  public async transferFunds(
    sourceAccountId: string, 
    destinationEmail: string, 
    amount: number,
    description: string = ''
  ): Promise<void> {
    try {
      const normalizedEmail = destinationEmail.toLowerCase().trim();
      // 1. Find destination user (outside transaction because queries aren't supported in transactions)
      const usersQ = query(collection(db, 'users'), where('email', '==', normalizedEmail));
      const userSnap = await getDocs(usersQ);
      if (userSnap.empty) throw new Error(`Recipient user with email ${normalizedEmail} not found`);
      const destUid = userSnap.docs[0].id;
      const destEmail = userSnap.docs[0].data().email;

      // 2. Get source account data to know the currency
      const sourceRef = doc(db, 'accounts', sourceAccountId);
      const sourceSnap = await getDoc(sourceRef);
      if (!sourceSnap.exists()) throw new Error('Source account not found');
      const sourceData = sourceSnap.data() as Account;

      // 3. Find destination account (outside transaction)
      const destAccountsQ = query(
        collection(db, 'accounts'), 
        where('uid', '==', destUid),
        where('currency', '==', sourceData.currency)
      );
      const destAccSnap = await getDocs(destAccountsQ);
      if (destAccSnap.empty) throw new Error(`Recipient has no account in ${sourceData.currency}`);
      const destAccDoc = destAccSnap.docs[0];
      const destAccRef = doc(db, 'accounts', destAccDoc.id);

      await runTransaction(db, async (transaction) => {
        // Re-read both accounts inside transaction for atomicity
        const tSourceSnap = await transaction.get(sourceRef);
        const tDestSnap = await transaction.get(destAccRef);

        if (!tSourceSnap.exists()) throw new Error('Source account not found');
        if (!tDestSnap.exists()) throw new Error('Destination account not found');

        const tSourceData = tSourceSnap.data() as Account;
        const tDestData = tDestSnap.data() as Account;

        if (tSourceData.balance < amount) {
          throw new Error('Insufficient funds');
        }

        // Update balances
        transaction.update(sourceRef, { balance: tSourceData.balance - amount });
        transaction.update(destAccRef, { balance: tDestData.balance + amount });

        // Record transaction
        const txRef = doc(collection(db, 'transactions'));
        const txRecord: Transaction = {
          id: txRef.id,
          sourceAccountId,
          destinationAccountId: destAccRef.id,
          sourceUid: auth.currentUser?.uid || '',
          destinationUid: destUid,
          sourceEmail: auth.currentUser?.email || 'unknown',
          destinationEmail: destEmail,
          amount,
          currency: sourceData.currency,
          timestamp: serverTimestamp() as any,
          description
        };
        transaction.set(txRef, txRecord);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transfer');
    }
  }

  public async deposit(accountId: string, paymentMethodId: string, amount: number): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const accRef = doc(db, 'accounts', accountId);
        const accSnap = await transaction.get(accRef);
        if (!accSnap.exists()) throw new Error('Account not found');
        const accData = accSnap.data() as Account;

        transaction.update(accRef, { balance: accData.balance + amount });

        const txRef = doc(collection(db, 'transactions'));
        const txRecord: Transaction = {
          id: txRef.id,
          sourceAccountId: 'SYSTEM_DEPOSIT',
          destinationAccountId: accountId,
          sourceUid: 'SYSTEM',
          destinationUid: auth.currentUser?.uid || '',
          sourceEmail: 'System',
          destinationEmail: auth.currentUser?.email || 'unknown',
          amount,
          currency: accData.currency,
          timestamp: serverTimestamp() as any,
          description: `Deposit from payment method ${paymentMethodId}`
        };
        transaction.set(txRef, txRecord);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'deposit');
    }
  }
}
