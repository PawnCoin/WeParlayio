import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 min-w-[120px] justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-sm">{currentLanguage?.flag}</span>
          <span className="text-sm font-medium">{currentLanguage?.nativeName}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
            >
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wide">
                  Select Language
                </div>
                
                {/* Group languages by region */}
                <div className="space-y-1">
                  {/* English Markets */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 px-3 py-1">
                      English Markets
                    </div>
                    {languages
                      .filter(lang => lang.code.startsWith('en'))
                      .map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                            language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <div className="font-medium">{lang.nativeName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                            </div>
                          </div>
                          {language === lang.code && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                  </div>

                  {/* European Markets */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 px-3 py-1 mt-3">
                      European Markets
                    </div>
                    {languages
                      .filter(lang => ['es', 'fr', 'de', 'it', 'pt', 'pt-BR', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'hu', 'ro', 'bg', 'hr', 'sr', 'sl', 'sk', 'lv', 'lt', 'et', 'el', 'tr', 'ru', 'uk'].includes(lang.code))
                      .map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                            language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <div className="font-medium">{lang.nativeName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                            </div>
                          </div>
                          {language === lang.code && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                  </div>

                  {/* Asian Markets */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 px-3 py-1 mt-3">
                      Asian Markets
                    </div>
                    {languages
                      .filter(lang => ['zh-CN', 'zh-TW', 'ja', 'ko', 'th', 'vi', 'id', 'ms', 'tl', 'hi'].includes(lang.code))
                      .map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                            language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <div className="font-medium">{lang.nativeName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                            </div>
                          </div>
                          {language === lang.code && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                  </div>

                  {/* Latin America */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 px-3 py-1 mt-3">
                      Latin America
                    </div>
                    {languages
                      .filter(lang => ['es-MX', 'es-AR', 'es-CL', 'es-CO', 'es-PE'].includes(lang.code))
                      .map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                            language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <div className="font-medium">{lang.nativeName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                            </div>
                          </div>
                          {language === lang.code && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                  </div>

                  {/* Middle East & Africa */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 px-3 py-1 mt-3">
                      Middle East & Africa
                    </div>
                    {languages
                      .filter(lang => ['ar', 'he', 'fa', 'ur', 'sw', 'af'].includes(lang.code))
                      .map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                            language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                          }`}
                          dir={lang.rtl ? 'rtl' : 'ltr'}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <div className="font-medium">{lang.nativeName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                            </div>
                          </div>
                          {language === lang.code && <Check className="h-4 w-4" />}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}