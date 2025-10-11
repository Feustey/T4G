import { HeaderOnboarding } from '../components';
import { LangType } from '../types';
import GlobalLayout from './GlobalLayout';

export interface IOnboardingLayout {
  lang: LangType;
  children: React.ReactNode;
  classNameCSS?: string;
}

export default function OnboardingLayout({
  lang,
  children,
  classNameCSS,
}: IOnboardingLayout) {
  return (
    <>
      <HeaderOnboarding lang={lang} />
      <GlobalLayout classNameCSS={classNameCSS}>{children}</GlobalLayout>
    </>
  );
}
