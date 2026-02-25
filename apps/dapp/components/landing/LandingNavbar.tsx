import Link from 'next/link';
import Image from 'next/image';

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <Link href="/" className="flex-shrink-0" aria-label="Token for Good - Accueil">
        <Image
          src="/landing/images/64497bb83dee18517f47a10c_T4G.webp"
          alt="Token for Good"
          width={83}
          height={70}
          priority
          className="h-10 w-auto"
        />
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-t4g-blue-500 hover:bg-t4g-blue-600 text-white font-medium transition-colors"
        aria-label="Se connecter"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Se connecter
      </Link>
    </nav>
  );
}
