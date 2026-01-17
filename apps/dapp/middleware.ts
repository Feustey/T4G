import { NextRequest, NextResponse } from 'next/server';

// Fichiers et chemins à exclure du middleware
const PUBLIC_FILE = /\.(.*)$/; // Fichiers avec extension
const ASSET_PATHS = /^\/(assets|favicon|android-chrome|apple-touch-icon|mstile|safari-pinned-tab|site\.webmanifest|robots\.txt|sitemap.*\.xml|social\.png|token4good\.png|.*\.svg|.*\.png|.*\.jpg|.*\.jpeg|.*\.gif|.*\.ico|.*\.webp)/;

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Exclure les chemins qui ne nécessitent pas de traitement
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/health') ||
    PUBLIC_FILE.test(pathname) ||
    ASSET_PATHS.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Laisser Next.js i18n gérer automatiquement les locales
  return NextResponse.next();
}
