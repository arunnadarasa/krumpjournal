declare module '@halliday-sdk/payments' {
  interface HallidayPaymentsOptions {
    apiKey: string;
    outputs: string[];
    windowType?: 'MODAL' | 'POPUP' | 'EMBED';
    sandbox?: boolean;
    destAddress?: string;
    targetElementId?: string;
    customStyles?: {
      primaryColor?: string;
      backgroundColor?: string;
      borderColor?: string;
      textColor?: string;
      textSecondaryColor?: string;
    };
    onPaymentComplete?: (payment: any) => void;
    onPaymentError?: (error: any) => void;
  }

  export function openHallidayPayments(options: HallidayPaymentsOptions): void;
}
