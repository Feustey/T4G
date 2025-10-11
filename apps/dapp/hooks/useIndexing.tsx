export function useIndexing(isIndexable: boolean) {
  if (typeof window !== 'undefined') {
    let isProduction: boolean;
    if (window.location.host !== 'token-for-good.com') {
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
