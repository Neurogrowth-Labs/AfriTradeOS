import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  locale: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'EN', label: 'English', nativeLabel: 'English', locale: 'en-US' },
  { code: 'FR', label: 'French', nativeLabel: 'Français', locale: 'fr-FR' },
  { code: 'AR', label: 'Arabic', nativeLabel: 'العربية', locale: 'ar' },
  { code: 'SW', label: 'Swahili', nativeLabel: 'Kiswahili', locale: 'sw' },
  { code: 'PT', label: 'Portuguese', nativeLabel: 'Português', locale: 'pt-PT' },
];

type TranslationKey =
  | 'commandCenter'
  | 'notifications'
  | 'noNotifications'
  | 'markAllRead'
  | 'clearAll'
  | 'selectLanguage'
  | 'selectCurrency'
  | 'settings'
  | 'realTimeReady';

const TRANSLATIONS: Record<string, Record<TranslationKey, string>> = {
  EN: {
    commandCenter: 'Command Center',
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    markAllRead: 'Mark all as read',
    clearAll: 'Clear all',
    selectLanguage: 'Select Language',
    selectCurrency: 'Select Currency',
    settings: 'Settings',
    realTimeReady: 'Real-time updates enabled',
  },
  FR: {
    commandCenter: 'Centre de Commande',
    notifications: 'Notifications',
    noNotifications: 'Aucune notification',
    markAllRead: 'Tout marquer comme lu',
    clearAll: 'Tout effacer',
    selectLanguage: 'Choisir la langue',
    selectCurrency: 'Choisir la devise',
    settings: 'Paramètres',
    realTimeReady: 'Mises à jour en temps réel activées',
  },
  AR: {
    commandCenter: 'مركز القيادة',
    notifications: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات',
    markAllRead: 'تحديد الكل كمقروء',
    clearAll: 'مسح الكل',
    selectLanguage: 'اختر اللغة',
    selectCurrency: 'اختر العملة',
    settings: 'الإعدادات',
    realTimeReady: 'تم تفعيل التحديثات الفورية',
  },
  SW: {
    commandCenter: 'Kituo cha Amri',
    notifications: 'Arifa',
    noNotifications: 'Hakuna arifa',
    markAllRead: 'Weka zote zimesomwa',
    clearAll: 'Futa zote',
    selectLanguage: 'Chagua Lugha',
    selectCurrency: 'Chagua Sarafu',
    settings: 'Mipangilio',
    realTimeReady: 'Masasisho ya moja kwa moja yamewashwa',
  },
  PT: {
    commandCenter: 'Centro de Comando',
    notifications: 'Notificações',
    noNotifications: 'Sem notificações',
    markAllRead: 'Marcar todas como lidas',
    clearAll: 'Limpar tudo',
    selectLanguage: 'Selecionar idioma',
    selectCurrency: 'Selecionar moeda',
    settings: 'Definições',
    realTimeReady: 'Atualizações em tempo real ativadas',
  },
};

interface LanguageContextValue {
  language: string;
  languageData: LanguageOption;
  setLanguage: (code: string) => void;
  t: (key: TranslationKey) => string;
  LANGUAGES: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('selectedLanguage') || 'EN'
  );

  const setLanguage = useCallback((code: string) => {
    const nextLanguage = LANGUAGES.some(item => item.code === code) ? code : 'EN';
    setLanguageState(nextLanguage);
    localStorage.setItem('selectedLanguage', nextLanguage);
    document.documentElement.lang =
      LANGUAGES.find(item => item.code === nextLanguage)?.locale || 'en-US';
    document.documentElement.dir = nextLanguage === 'AR' ? 'rtl' : 'ltr';
  }, []);

  const languageData = useMemo(
    () => LANGUAGES.find(item => item.code === language) || LANGUAGES[0],
    [language]
  );

  const t = useCallback(
    (key: TranslationKey) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.EN[key],
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, languageData, setLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
