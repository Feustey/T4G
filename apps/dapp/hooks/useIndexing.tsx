export function useIndexing(isIndexable: boolean) {
  if (typeof window !== 'undefined') {
    let isProduction: boolean;
    const prodHosts = ['token-for-good.com', 'www.token-for-good.com', 'app.token-for-good.com'];
    if (!prodHosts.includes(window.location.host)) {
      isProduction = false;
    } else {
      isProduction = true;
    }

    if (isProduction && isIndexable) {
      return <meta name="robots" content="index" />;
    } else {
      return <meta name="robots" content="noindex nofollow" />;
    }
  }
}
