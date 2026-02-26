import Link from 'next/link';
import Image from 'next/image';

export function LandingCommunity() {
  return (
    <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Texte — centré sur mobile, aligné à droite sur desktop pour équilibrer avec l'image */}
          <div className="order-2 md:order-1 text-center md:text-right">
            <div className="flex flex-col items-center md:items-end gap-3 mb-6">
              <div className="landing-icon-sm shrink-0 w-10 h-10 rounded-full bg-t4g-blue-500/20 flex items-center justify-center text-t4g-blue-500">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Une communauté engagée
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto md:mr-0 md:ml-auto">
              En faisant partie et en contribuant à la plateforme Token For Good, vous aiderez d&apos;autres 
              utilisateurs et acteurs de la décentralisation du réseau lightning : Créez un profil, 
              collectez des tokens, gagnez en visibilité, obtenez des certifications et bien d&apos;autres 
              avantages encore.
            </p>
            <div className="flex justify-center md:justify-end">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-t4g-blue-400 to-t4g-green-500 text-white font-semibold shadow-lg shadow-t4g-green-500/25 hover:shadow-xl hover:shadow-t4g-green-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              S&apos;inscrire
            </Link>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center md:justify-start">
            <Image
              src="/landing/images/64498a90b962341386fd1430_new-home-hero2.webp"
              alt="Communauté Token for Good"
              width={600}
              height={400}
              className="landing-community-img rounded-xl shadow-lg w-full max-w-lg max-h-[300px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
