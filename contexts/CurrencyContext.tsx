import React, { createContext, useContext, useState, useCallback } from 'react';

// Currency definitions
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  // African Currencies
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭' },
  { code: 'XOF', name: 'CFA Franc (BCEAO)', symbol: 'CFA', flag: '🇸🇳' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', flag: '🇲🇦' },
  // International Currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
];

// Approximate exchange rates to USD (for display conversion)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  NGN: 1550,
  KES: 153,
  ZAR: 18.75,
  EGP: 30.9,
  GHS: 12.45,
  XOF: 605.5,
  MAD: 10.05,
  CNY: 7.25,
  INR: 83.1,
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  currencySymbol: string;
  currencyData: Currency | undefined;
  formatCurrency: (amount: number, showCode?: boolean) => string;
  convertFromUSD: (usdAmount: number) => number;
  convertToUSD: (amount: number) => number;
  CURRENCIES: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    // Try to get from localStorage
    const saved = localStorage.getItem('selectedCurrency');
    return saved || 'USD';
  });

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    localStorage.setItem('selectedCurrency', code);
  }, []);

  const currencyData = CURRENCIES.find(c => c.code === currency);
  const currencySymbol = currencyData?.symbol || '$';

  const convertFromUSD = useCallback((usdAmount: number): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return usdAmount * rate;
  }, [currency]);

  const convertToUSD = useCallback((amount: number): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return amount / rate;
  }, [currency]);

  const formatCurrency = useCallback((amount: number, showCode = false): string => {
    const symbol = currencyData?.symbol || '$';
    const rate = EXCHANGE_RATES[currency] || 1;
    const convertedAmount = amount * rate;
    
    // Format based on currency
    let formatted: string;
    if (convertedAmount >= 1000000000) {
      formatted = `${symbol}${(convertedAmount / 1000000000).toFixed(1)}B`;
    } else if (convertedAmount >= 1000000) {
      formatted = `${symbol}${(convertedAmount / 1000000).toFixed(1)}M`;
    } else if (convertedAmount >= 1000) {
      formatted = `${symbol}${(convertedAmount / 1000).toFixed(1)}K`;
    } else {
      formatted = `${symbol}${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    
    if (showCode) {
      formatted += ` ${currency}`;
    }
    
    return formatted;
  }, [currency, currencyData]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      currencySymbol,
      currencyData,
      formatCurrency,
      convertFromUSD,
      convertToUSD,
      CURRENCIES,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Helper hook for simple symbol access
export const useCurrencySymbol = (): string => {
  const { currencySymbol } = useCurrency();
  return currencySymbol;
};

export default CurrencyContext;
