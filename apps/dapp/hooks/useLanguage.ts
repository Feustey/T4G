import { useRouter } from 'next/router';
import en from '../lang/en.json';
import fr from '../lang/fr.json';
import { LangType, LocaleType } from '../types';

export function useLanguage(): LangType {
  const locale = useRouter().locale as LocaleType;
  let language: LangType;
  switch (locale) {
    case 'fr':
      language = fr;
      break;
    case 'en':
      language = en;
      break;

    default:
      language = en;
      break;
  }
  return language;
}
