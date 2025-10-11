import { Analytics } from '@vercel/analytics/react';
import Script from 'next/script';

export interface IGlobalLayout {
  children: React.ReactNode;
  classNameCSS?: string;
}

export default function GlobalLayout({
  children,
  classNameCSS = '',
}: IGlobalLayout) {
  return (
    <main className={`app relative ${classNameCSS}`.trim()}>
      <Script id="chat" strategy="afterInteractive">
        {`window.$crisp=[];window.CRISP_WEBSITE_ID="3fe7da9b-6bef-4bb0-9505-67b6674e09ca";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`}
      </Script>
      {children}
      <Analytics />
    </main>
  );
}
