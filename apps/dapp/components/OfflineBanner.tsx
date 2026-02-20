/**
 * OfflineBanner - Banner d'avertissement pour le mode offline/cache
 */

import React from 'react';
import { Button } from './shared/Button';
import { useNetwork } from '../contexts/NetworkContext';

interface OfflineBannerProps {
  isUsingCache?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isUsingCache = false,
  onRetry,
  onRefresh,
}) => {
  const { isOnline, apiAvailable, checkAPI } = useNetwork();

  const handleRetry = async () => {
    await checkAPI();
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <div 
      className="o-card u-d--flex u-flex-column u-align-items-center u-gap--m" 
      style={{ 
        backgroundColor: isUsingCache 
          ? 'var(--color-warning-light, #fff3cd)' 
          : 'var(--color-error-light, #ffebee)',
        borderLeft: isUsingCache 
          ? '4px solid var(--color-warning, #ff9800)' 
          : '4px solid var(--color-error, #d32f2f)'
      }}
    >
      <p className="u-margin--none u-text--center" style={{ fontWeight: 600 }}>
        {isUsingCache 
          ? '⚠️ Mode hors ligne : affichage des dernières données disponibles'
          : '🔴 Impossible de se connecter au serveur'
        }
      </p>
      
      {!isOnline && (
        <p className="u-margin--none u-text--center" style={{ fontSize: '0.875rem' }}>
          Votre appareil semble hors ligne. Vérifiez votre connexion Internet.
        </p>
      )}
      
      {isOnline && !apiAvailable && (
        <p className="u-margin--none u-text--center" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)' }}>
          Le serveur backend ({process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}) est inaccessible.
        </p>
      )}
      
      <div className="u-d--flex u-gap--s u-width--fill">
        <Button
          className="flex-1"
          variant={isUsingCache ? "secondary" : "primary"}
          onClick={handleRetry}
          label="Réessayer"
        />
        {!isUsingCache && (
          <Button
            className="flex-1"
            variant="ghost"
            onClick={handleRefresh}
            label="Actualiser"
          />
        )}
      </div>
    </div>
  );
};
