// src/types/transak.d.ts

// ✅ FIX: Use a type-only import
import type { TransakConfig as OriginalTransakConfig } from '@transak/transak-sdk';

// This "patches" the TransakConfig type to include missing properties
declare module '@transak/transak-sdk' {
  export interface TransakConfig extends OriginalTransakConfig {
    apiKey: string;
    widgetUrl: string;
    referrer: string;
    fiatAmount?: number;
    disableWalletAddressForm?: boolean;
    onSuccess?: (data: any) => void;
    onCancel?: () => void;
    [key: string]: any; 
  }
}