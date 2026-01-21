import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../hooks';
import OnboardingLayout from '../layouts/OnboardingLayout';
import { Button, Spinner } from '../components';

export default function OnboardingSimple() {
  const router = useRouter();
  const lang = useLanguage();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    program: '',
    school: '',
    topic: '',
    graduatedYear: new Date().getFullYear(),
  });

  if (loading) {
    return <Spinner lang={lang} />;
  }

  if (!user) {
    router.push('/login');
    return <Spinner lang={lang} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('📝 Formulaire onboarding:', formData);
      alert('✅ Onboarding complété ! (version simplifiée)');
      // TODO: Sauvegarder les données via le backend Rust
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Onboarding - Token4Good</title>
      </Head>

      <OnboardingLayout lang={lang}>
        <div className="e-container e-container--onboarding">
          <h1 className="u-text--center">Bienvenue {user.firstname} !</h1>
          
          <div className="bg-blue-50 p-4 rounded mb-6">
            <p className="text-sm">
              <strong>👤 Utilisateur:</strong> {user.email}<br/>
              <strong>🆔 ID:</strong> {user.id}<br/>
              <strong>🎭 Rôle:</strong> {user.role}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="u-d--flex u-flex-column u-gap--6">
            <h2 className="u-text--center heading-3">Vos études</h2>
            
            <div>
              <label htmlFor="program">Programme *</label>
              <input
                type="text"
                id="program"
                value={formData.program}
                onChange={(e) => setFormData({...formData, program: e.target.value})}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="school">École *</label>
              <input
                type="text"
                id="school"
                value={formData.school}
                onChange={(e) => setFormData({...formData, school: e.target.value})}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="topic">Spécialisation *</label>
              <input
                type="text"
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label htmlFor="graduatedYear">Année de diplôme *</label>
              <input
                type="number"
                id="graduatedYear"
                value={formData.graduatedYear}
                onChange={(e) => setFormData({...formData, graduatedYear: parseInt(e.target.value)})}
                required
                min="2000"
                max="2030"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="u-d--flex u-justify-content-center mt-6">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !formData.program || !formData.school || !formData.topic}
                label={isSubmitting ? "En cours..." : "Continuer"}
                lang={lang}
              />
            </div>
          </form>
        </div>
      </OnboardingLayout>
    </>
  );
}

OnboardingSimple.auth = true;
