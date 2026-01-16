import { NextRequest, NextResponse } from 'next/server';

// Fichiers et chemins à exclure du middleware
const PUBLIC_FILE = /\.(.*)$/; // Fichiers avec extension
const ASSET_PATHS = /^\/(assets|favicon|android-chrome|apple-touch-icon|mstile|safari-pinned-tab|site\.webmanifest|robots\.txt|sitemap.*\.xml|social\.png|token4good\.png|.*\.svg|.*\.png|.*\.jpg|.*\.jpeg|.*\.gif|.*\.ico|.*\.webp)/;

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Exclure les chemins qui ne nécessitent pas de redirection de locale
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/health') ||
    pathname === '/landing' ||
    PUBLIC_FILE.test(pathname) ||
    ASSET_PATHS.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Gestion de la locale pour les autres routes
  if (req.nextUrl.locale === 'default') {
    const locale = req.cookies.get('NEXT_LOCALE')?.value || 'fr';

    return NextResponse.redirect(
      new URL(`/${locale}${pathname}${req.nextUrl.search}`, req.url)
    );
  }
  
  return NextResponse.next();
}
