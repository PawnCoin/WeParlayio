
// Internationalization System for WeParlay
// Final 2% completion - Multiple language support

interface TranslationData {
  [key: string]: string | TranslationData;
}

interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: string;
  currencySymbol: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    currencySymbol: '$'
  },
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'es-ES',
    currencySymbol: '€'
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'fr-FR',
    currencySymbol: '€'
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: 'de-DE',
    currencySymbol: '€'
  },
  {
    code: 'pt',
    name: 'Português',
    flag: '🇵🇹',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'pt-BR',
    currencySymbol: 'R$'
  },
  {
    code: 'zh',
    name: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: 'zh-CN',
    currencySymbol: '¥'
  },
  {
    code: 'ja',
    name: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: 'ja-JP',
    currencySymbol: '¥'
  },
  {
    code: 'ar',
    name: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'ar-SA',
    currencySymbol: 'ر.س'
  }
];

// Translation data
const TRANSLATIONS: Record<string, TranslationData> = {
  en: {
    nav: {
      home: 'Home',
      sports: 'Sports Betting',
      esports: 'Esports Hub',
      fantasy: 'Fantasy',
      tournaments: 'Tournaments',
      gaming: 'Gaming',
      trivia: 'Trivia',
      results: 'Results'
    },
    betting: {
      placeBet: 'Place Bet',
      betSlip: 'Bet Slip',
      stake: 'Stake',
      payout: 'Potential Payout',
      odds: 'Odds',
      confirm: 'Confirm Bet',
      cancel: 'Cancel',
      live: 'Live',
      upcoming: 'Upcoming'
    },
    wallet: {
      balance: 'Balance',
      deposit: 'Deposit',
      withdraw: 'Withdraw',
      transaction: 'Transaction',
      history: 'History'
    },
    notifications: {
      betWon: 'Bet Won!',
      betLost: 'Bet Lost',
      newPromo: 'New Promotion',
      welcome: 'Welcome to WeParlay!'
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      sports: 'Apuestas Deportivas',
      esports: 'Hub de Esports',
      fantasy: 'Fantasy',
      tournaments: 'Torneos',
      gaming: 'Gaming',
      trivia: 'Trivia',
      results: 'Resultados'
    },
    betting: {
      placeBet: 'Apostar',
      betSlip: 'Boleto de Apuesta',
      stake: 'Cantidad',
      payout: 'Pago Potencial',
      odds: 'Cuotas',
      confirm: 'Confirmar Apuesta',
      cancel: 'Cancelar',
      live: 'En Vivo',
      upcoming: 'Próximos'
    },
    wallet: {
      balance: 'Saldo',
      deposit: 'Depositar',
      withdraw: 'Retirar',
      transaction: 'Transacción',
      history: 'Historial'
    },
    notifications: {
      betWon: '¡Apuesta Ganada!',
      betLost: 'Apuesta Perdida',
      newPromo: 'Nueva Promoción',
      welcome: '¡Bienvenido a WeParlay!'
    }
  },
  fr: {
    nav: {
      home: 'Accueil',
      sports: 'Paris Sportifs',
      esports: 'Hub Esports',
      fantasy: 'Fantasy',
      tournaments: 'Tournois',
      gaming: 'Gaming',
      trivia: 'Trivia',
      results: 'Résultats'
    },
    betting: {
      placeBet: 'Parier',
      betSlip: 'Ticket de Pari',
      stake: 'Mise',
      payout: 'Gain Potentiel',
      odds: 'Cotes',
      confirm: 'Confirmer le Pari',
      cancel: 'Annuler',
      live: 'En Direct',
      upcoming: 'À Venir'
    },
    wallet: {
      balance: 'Solde',
      deposit: 'Dépôt',
      withdraw: 'Retrait',
      transaction: 'Transaction',
      history: 'Historique'
    },
    notifications: {
      betWon: 'Pari Gagné!',
      betLost: 'Pari Perdu',
      newPromo: 'Nouvelle Promotion',
      welcome: 'Bienvenue sur WeParlay!'
    }
  }
  // Additional languages would follow the same pattern
};

export class InternationalizationManager {
  private currentLanguage: string = 'en';
  private fallbackLanguage: string = 'en';
  private translations: Record<string, TranslationData> = TRANSLATIONS;
  private listeners: ((language: string) => void)[] = [];

  constructor() {
    this.initializeLanguage();
  }

  // Initialize language from user preference or browser
  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('weparlay-language');
    const browserLanguage = navigator.language.split('-')[0];
    
    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else if (this.isLanguageSupported(browserLanguage)) {
      this.currentLanguage = browserLanguage;
    }
    
    this.applyLanguage(this.currentLanguage);
  }

  // Get translation for a key
  t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];
    
    // Navigate through nested keys
    for (const k of keys) {
      value = value?.[k];
    }
    
    // Fallback to English if translation not found
    if (typeof value !== 'string') {
      value = this.getFallbackTranslation(key);
    }
    
    // Replace parameters
    if (typeof value === 'string' && params) {
      return this.replaceParameters(value, params);
    }
    
    return typeof value === 'string' ? value : key;
  }

  // Get fallback translation
  private getFallbackTranslation(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.fallbackLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return typeof value === 'string' ? value : key;
  }

  // Replace parameters in translation strings
  private replaceParameters(text: string, params: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => params[key] || match);
  }

  // Set current language
  setLanguage(languageCode: string): void {
    if (!this.isLanguageSupported(languageCode)) {
      console.warn(`Language ${languageCode} is not supported`);
      return;
    }
    
    this.currentLanguage = languageCode;
    localStorage.setItem('weparlay-language', languageCode);
    this.applyLanguage(languageCode);
    this.notifyListeners(languageCode);
  }

  // Apply language settings to document
  private applyLanguage(languageCode: string): void {
    const config = this.getLanguageConfig(languageCode);
    
    document.documentElement.lang = languageCode;
    document.documentElement.dir = config.direction;
    
    // Update page title if needed
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleElement.textContent = this.t('app.title') || 'WeParlay - Sports Betting Platform';
    }
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Get language configuration
  getLanguageConfig(languageCode?: string): LanguageConfig {
    const code = languageCode || this.currentLanguage;
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
  }

  // Check if language is supported
  isLanguageSupported(languageCode: string): boolean {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);
  }

  // Format number according to language
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const config = this.getLanguageConfig();
    return new Intl.NumberFormat(config.numberFormat, options).format(number);
  }

  // Format currency according to language
  formatCurrency(amount: number, currency?: string): string {
    const config = this.getLanguageConfig();
    return new Intl.NumberFormat(config.numberFormat, {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  }

  // Format date according to language
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const config = this.getLanguageConfig();
    return new Intl.DateTimeFormat(config.numberFormat, options).format(date);
  }

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime(date: Date): string {
    const config = this.getLanguageConfig();
    const rtf = new Intl.RelativeTimeFormat(config.numberFormat, { numeric: 'auto' });
    
    const diffMs = date.getTime() - Date.now();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (Math.abs(diffMins) < 60) {
      return rtf.format(diffMins, 'minute');
    } else if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour');
    } else {
      return rtf.format(diffDays, 'day');
    }
  }

  // Add language change listener
  onLanguageChange(callback: (language: string) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify listeners of language change
  private notifyListeners(language: string): void {
    this.listeners.forEach(listener => listener(language));
  }

  // Load additional translation data
  async loadTranslations(languageCode: string): Promise<void> {
    try {
      const response = await fetch(`/api/translations/${languageCode}`);
      if (response.ok) {
        const translations = await response.json();
        this.translations[languageCode] = { ...this.translations[languageCode], ...translations };
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${languageCode}:`, error);
    }
  }

  // Get available languages
  getAvailableLanguages(): LanguageConfig[] {
    return SUPPORTED_LANGUAGES;
  }

  // Detect user's preferred language from browser
  detectPreferredLanguage(): string {
    const browserLanguages = navigator.languages || [navigator.language];
    
    for (const lang of browserLanguages) {
      const languageCode = lang.split('-')[0];
      if (this.isLanguageSupported(languageCode)) {
        return languageCode;
      }
    }
    
    return this.fallbackLanguage;
  }
}

export const i18n = new InternationalizationManager();

// React hook for translations
export function useTranslation() {
  const [language, setLanguage] = React.useState(i18n.getCurrentLanguage());
  
  React.useEffect(() => {
    const unsubscribe = i18n.onLanguageChange(setLanguage);
    return unsubscribe;
  }, []);
  
  return {
    t: i18n.t.bind(i18n),
    currentLanguage: language,
    setLanguage: i18n.setLanguage.bind(i18n),
    availableLanguages: i18n.getAvailableLanguages(),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatRelativeTime: i18n.formatRelativeTime.bind(i18n)
  };
}
