import { Icons } from '..';
import React from 'react';
import { LangType } from 'apps/dapp/types';

export interface IRating {
  isEditable: boolean;
  lang: LangType;
  // Props pour le mode affichage
  rate?: number[];
  nbOpinion?: number;
  // Props pour le mode édition (contrôlé)
  value?: number;
  onChange?: (value: number) => void;
}

export const Rating: React.FC<IRating> = ({
  isEditable,
  lang,
  rate = [],
  nbOpinion = 0,
  value = 0,
  onChange,
}) => {
  // --- Mode Affichage ---
  if (!isEditable) {
    // Correction du bug: Gérer le cas où `rate` est un tableau vide.
    const averageRating =
      rate.length > 0
        ? Math.round(rate.reduce((acc, val) => acc + val, 0) / rate.length)
        : 0;

    return (
      <div className="c-rating">
        <div aria-hidden={true} className="c-rating__stars-container">
          {/* Simplification: Une seule boucle pour afficher les étoiles */}
          {Array.from({ length: 5 }, (_, index) => (
            <span className="c-rating__star" key={index}>
              {index < averageRating ? Icons.star : Icons.starLine}
            </span>
          ))}
        </div>
        {/* i18n et correction du texte pour l'accessibilité */}
        <span className="u-sr-only">
          Rating: {averageRating} out of 5
        </span>
        <span>
          ({nbOpinion}){' '}
          <span className="u-sr-only">opinions</span>
        </span>
      </div>
    );
  }

  // --- Mode Édition ---
  return (
    <fieldset className="c-rating--rating">
      <legend>Rate this</legend>
      <div className="c-rating">
        <div className="c-rating__stars-container">
          {Array.from({ length: 5 }, (_, index) => {
            const ratingValue = index + 1;
            return (
              <React.Fragment key={index}>
                <input
                  type="radio"
                  name="rating"
                  value={ratingValue}
                  id={`rating${ratingValue}`}
                  className="c-rating__input"
                  checked={value === ratingValue}
                  onChange={() => onChange?.(ratingValue)}
                />
                <label
                  className="c-rating__star"
                  htmlFor={`rating${ratingValue}`}
                >
                  {/* Correction de la logique d'affichage */}
                  {ratingValue <= value ? Icons.star : Icons.starLine}
                  <span className="u-sr-only">{ratingValue}</span>
                </label>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
};

Rating.displayName = 'Rating';
