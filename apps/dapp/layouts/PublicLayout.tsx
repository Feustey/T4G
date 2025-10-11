import { FooterPublic, HeaderPublic } from '../components';
import { LangType } from '../types';
import GlobalLayout from './GlobalLayout';

export interface IPublicLayout {
  lang: LangType;
  children: React.ReactNode;
  classNameCSS?: string;
}

export default function PublicLayout({ children, lang, classNameCSS }: IPublicLayout) {
  return (
    <>
      <HeaderPublic lang={lang} />
      <GlobalLayout classNameCSS={classNameCSS}>{children}</GlobalLayout>
      <FooterPublic lang={lang} />
    </>
  );
}
