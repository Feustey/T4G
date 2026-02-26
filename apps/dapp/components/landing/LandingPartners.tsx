import Image from 'next/image';

const partners = [
  { name: 'Daznode', href: 'https://dazno.de', src: '/landing/images/68dd52b64caafaf589da8e54_logo_daznode.png', height: 100 },
  { name: 'Inoval', href: 'https://inoval.io', src: '/landing/images/6829aacc00d93f05c170ee5d_64819951ddb9563d1fad1713_INOVAL_logo_RVB-500px.png', height: 100 },
  { name: 'Bitcoin Meetup Nantes', href: 'https://bit.ly/NantesBitcoin', src: '/landing/images/6829aa7694b5a7d4e0195211_Bitcoin%20Meetup.jpg', height: 100 },
  { name: 'Blockchain for Good', href: 'https://blockchainforgood.fr/', src: '/landing/images/6829aaff379497ff57cdd41f_Blockchain_for_Good.svg', height: 70 },
];

export function LandingPartners() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="landing-icon-sm shrink-0 w-10 h-10 rounded-full bg-t4g-blue-500/20 flex items-center justify-center text-t4g-blue-500 mb-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Nos partenaires
          </h2>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {partners.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-80 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0"
            >
              <Image
                src={p.src}
                alt={p.name}
                width={p.height === 70 ? 140 : 180}
                height={p.height}
                className="landing-partner-img object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
