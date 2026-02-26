export function LandingHowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Contribue',
      desc: 'Mentoring, partage de connaissances, support technique.',
    },
    {
      num: '2',
      title: 'Reçois des tokens',
      desc: 'Tokens T4G pour chaque contribution valorisée.',
    },
    {
      num: '3',
      title: 'Accède aux services',
      desc: 'Marketplace, certifications RGB, avantages exclusifs.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Une plateforme collaborative qui célèbre l&apos;engagement.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 hover:shadow-md text-center"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-t4g-blue-400 to-t4g-green-500 flex items-center justify-center text-white font-bold">
                {step.num}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
