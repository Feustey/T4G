import React, { HTMLAttributes } from 'react';

export interface IText extends HTMLAttributes<HTMLElement> {
  textContent: string;
  textElement: string;
  cssClass?: string;
}

export const Text: React.FC<IText> = ({
  textContent,
  textElement,
  cssClass,
}) => {
  return React.createElement(textElement, { className: cssClass }, textContent);
};

Text.displayName = 'Text';
