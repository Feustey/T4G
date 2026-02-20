import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Cette page est conservée pour compatibilité descendante.
 * Elle redirige immédiatement vers /onboarding.
 */
export default function OnboardingSimpleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding');
  }, [router]);

  return null;
}
