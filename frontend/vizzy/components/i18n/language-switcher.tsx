'use client';

import { useEffect, useState, useTransition } from 'react';
import { Check, Globe, Loader2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/overlay/dropdown-menu';
import { Button } from '@/components/ui/common/button';
import { Language, languages, Locale } from '@/i18n/config';
import { getUserLocale, setUserLocale } from '@/lib/services/locale';

/**
 * LanguageSwitcher component that allows users to switch between different languages.
 *
 * @param {Object} props - The component's props.
 * @param {boolean} [props.compact=true] - Determines if the language switcher is displayed in a compact form.
 */
export function LanguageSwitcher({ compact = true }: { compact?: boolean }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetches the user's locale and sets the current language.
   * This function is called once when the component mounts.
   *
   * @returns {Promise<void>} - No return value.
   */
  useEffect(() => {
    async function fetchLocale() {
      const userLocale = await getUserLocale();
      const language =
        languages.find((lang) => lang.code === userLocale) || languages[0];
      setCurrentLanguage(language);
      setIsLoading(false);
    }

    fetchLocale();
  }, []);

  /**
   * Handles the change of language by updating the current language and user's locale.
   *
   * @param {Language} language - The new language to set as current.
   *
   * @returns {void} - No return value.
   */
  const handleLanguageChange = (language: Language) => {
    const locale = language.code as Locale;

    startTransition(() => {
      setUserLocale(locale);
      setCurrentLanguage(language);
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-foreground cursor-pointer"
          disabled={isPending || isLoading}
        >
          <Globe className="h-5 w-5" />
          {!compact && isLoading && (
            <Loader2 className="h-4 w-4 animate-spin absolute" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className="flex items-center gap-2 px-3 py-2"
            disabled={isPending}
          >
            <span className="text-base">{language.flag}</span>
            <span>{language.name}</span>
            {currentLanguage?.code === language.code &&
              (isPending ? (
                <Loader2 className="h-4 w-4 ml-auto animate-spin" />
              ) : (
                <Check className="h-4 w-4 ml-auto" />
              ))}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
