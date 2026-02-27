import Document, { Head, Html, Main, NextScript, DocumentContext } from 'next/document';

class RootDocument extends Document<{ locale?: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const locale = (ctx as DocumentContext & { locale?: string }).locale ?? 'fr';
    return { ...initialProps, locale };
  }

  render() {
    const locale = (this.props as { locale?: string }).locale ?? 'fr';
    return (
      <Html lang={locale}>
        <Head>
          <meta httpEquiv="cache-control" content="max-age=31536000" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link rel="icon" href="/favicon.ico" />

          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="apple-mobile-web-app-title" content="Daznode" />
          <meta name="application-name" content="Daznode Token For Good" />
          <meta name="msapplication-TileColor" content="#ffffff" />
        </Head>

        <body>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-NCQWLBN"
              height="0"
              width="0"
            ></iframe>
          </noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default RootDocument;
