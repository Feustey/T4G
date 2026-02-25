import Image from 'next/image';

const testimonials = [
  {
    quote: "Je trouve l'initiative Token for Good intéressante d'utiliser des technologies digitales pour permettre au plus grand nombre des acteurs du réseau lightning de participer à la décentralisation et faciliter les paiements sans contrainte",
    name: 'Edouard Minaget',
    title: 'Node owner',
    image: '/landing/images/64512a64fd42ab2ba9adecbb_about-hero.svg',
  },
  {
    quote: "Le mentoring est un accélérateur de compétences. Cela permet de se connecter par rapport à des besoins spécifiques et d'aller chercher de manière plus directe les expériences des autres.",
    name: 'Laeticia de Centralise',
    title: 'Network & Development Expert',
    image: '/landing/images/646e02a7f657a4100bf90e58_femmelivre.webp',
  },
];

export function LandingTestimonials() {
  return (
    <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Ils ont rejoint Token for Good
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <blockquote className="border-l-4 border-t4g-blue-500 pl-4 py-2 text-gray-600 dark:text-gray-300 italic">
                &quot;{t.quote}&quot;
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover w-16 h-16 shrink-0"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-sm text-t4g-blue-500 dark:text-t4g-blue-400">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
