import Link from 'next/link';
import Image from 'next/image';

export function LandingHero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Visuel — taille contrainte pour éviter overflow full-screen sur mobile */}
          <div className="relative order-2 md:order-1 flex justify-center">
            <Image
              src="/landing/images/64493f2065a2a70b35c533b1_svgviewer-png-output(1).webp"
              alt="Token for Good - Plateforme collaborative Web3"
              width={400}
              height={400}
              priority
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-md mx-auto object-contain"
            />
            <Image
              src="/landing/images/64498a85b962348a8ffd1367_spinner-animation.webp"
              alt=""
              width={100}
              height={100}
              className="absolute bottom-4 right-4 md:right-8 w-20 h-20 md:w-24 md:h-24"
            />
          </div>

          {/* Contenu */}
          <div className="order-1 md:order-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Célébrer l&apos;engagement !
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-xl">
              Token for Good valorise les actions à impact positif : dynamiser les échanges au sein d&apos;une communauté et donner du sens au partage.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              En contrepartie de sa contribution, le membre reçoit des jetons numériques 
              et devient bénéficiaire de services et de nombreux avantages.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-to-r from-t4g-blue-400 via-t4g-green-500 to-t4g-orange-500 text-white font-semibold hover:opacity-90 transition-all duration-300"
              >
                GO !
              </Link>
              <Link
                href="#pourquoi"
                className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-t4g-blue-500 text-t4g-blue-500 dark:border-t4g-blue-400 dark:text-t4g-blue-400 font-semibold hover:bg-t4g-blue-500/10 transition-all duration-300"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
