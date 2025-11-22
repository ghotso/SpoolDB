import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { i18nApi } from '../api/client';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  availableLanguages: string[];
  isLoading: boolean;
  missingTranslations: string[];
  currentLanguage: string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('spooldb-language') || 'en';
  });
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [englishTranslations, setEnglishTranslations] = useState<Record<string, any>>({});
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);
  const [isLoading, setIsLoading] = useState(true);
  const [missingTranslations, setMissingTranslations] = useState<string[]>([]);

  useEffect(() => {
    // Load available languages
    i18nApi.list()
      .then(langs => {
        setAvailableLanguages(langs.length > 0 ? langs : ['en']);
      })
      .catch((error) => {
        console.error('Failed to load available languages:', error);
        setAvailableLanguages(['en']);
      });

    // Always load English translations for comparison
    i18nApi.get('en')
      .then(loadedTranslations => {
        setEnglishTranslations(loadedTranslations);
      })
      .catch((error) => {
        console.error('Failed to load English translations for comparison:', error);
      });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    
    // Load translations for current language
    i18nApi.get(language)
      .then(loadedTranslations => {
        console.log(`✅ Loaded translations for ${language}:`, Object.keys(loadedTranslations).length, 'keys');
        if (Object.keys(loadedTranslations).length === 0) {
          console.warn('⚠️ Translations object is empty!');
        }
        setTranslations(loadedTranslations);
        
        // Compare with English to find missing translations (only in dev mode)
        if (import.meta.env.MODE === 'development' && language !== 'en' && Object.keys(englishTranslations).length > 0) {
          const missing = findMissingTranslations(englishTranslations, loadedTranslations);
          setMissingTranslations(missing);
          if (missing.length > 0) {
            console.warn(`⚠️ Found ${missing.length} missing translations for ${language}:`, missing);
          }
        } else {
          setMissingTranslations([]);
        }
        
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(`❌ Failed to load translations for ${language}:`, error);
        // Fallback to English if language not found
        if (language !== 'en') {
          console.log('🔄 Trying English fallback...');
          i18nApi.get('en')
            .then(loadedTranslations => {
              console.log('✅ Loaded English fallback translations:', Object.keys(loadedTranslations).length, 'keys');
              setTranslations(loadedTranslations);
              setMissingTranslations([]);
              setIsLoading(false);
            })
            .catch((fallbackError) => {
              console.error('❌ Failed to load English fallback:', fallbackError);
              setMissingTranslations([]);
              setIsLoading(false);
            });
        } else {
          console.error('❌ Failed to load English translations and no fallback available');
          setMissingTranslations([]);
          setIsLoading(false);
        }
      });
  }, [language, englishTranslations]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('spooldb-language', lang);
  };

  const t = (key: string): string => {
    // If translations haven't loaded yet, return key (will update when loaded)
    if (!translations || Object.keys(translations).length === 0) {
      return key;
    }

    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to key if not found (but don't spam console in production)
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation key not found: ${key} (at: ${k})`);
        }
        return key;
      }
    }
    
    const result = typeof value === 'string' ? value : key;
    if (result === key && process.env.NODE_ENV === 'development') {
      console.warn(`Translation value is not a string for key: ${key}`, value);
    }
    return result;
  };

  /**
   * Recursively find all missing translation keys by comparing against English
   */
  const findMissingTranslations = (english: Record<string, any>, current: Record<string, any>, prefix = ''): string[] => {
    const missing: string[] = [];
    
    for (const key in english) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const englishValue = english[key];
      const currentValue = current[key];
      
      if (typeof englishValue === 'object' && englishValue !== null && !Array.isArray(englishValue)) {
        // Recursively check nested objects
        if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
          missing.push(...findMissingTranslations(englishValue, currentValue, fullKey));
        } else {
          // Entire nested object is missing
          missing.push(fullKey);
        }
      } else if (currentValue === undefined || currentValue === null) {
        // Key is missing
        missing.push(fullKey);
      }
    }
    
    return missing;
  };

  return (
    <I18nContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      availableLanguages, 
      isLoading,
      missingTranslations,
      currentLanguage: language,
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}


