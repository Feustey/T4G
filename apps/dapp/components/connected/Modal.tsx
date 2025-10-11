import React, { useRef, useEffect, useId } from 'react';
import ReactDOM from 'react-dom';
import { ButtonIcon } from '..';
import { trapFocus } from 'apps/dapp/services';

export interface IModal extends React.ComponentPropsWithoutRef<'div'> {
  open?: boolean;
  onClose?: () => void;
}

export const Modal = ({
  open = false,
  onClose = undefined,
  children,
  ...props
}: IModal) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  // Génère des IDs uniques et stables pour l'accessibilité
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    setIsMounted(true); // S'assure que le code ne s'exécute que côté client
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      // Léger délai pour s'assurer que le focus est bien appliqué après le rendu
      setTimeout(() => closeButtonRef.current?.focus(), 0);
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open || !isMounted) {
    return null;
  }

  // Utilisation de ReactDOM.createPortal pour rendre la modale à la racine du body
  return ReactDOM.createPortal(
    <div
      className={`c-modal`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      ref={modalRef}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
        trapFocus(e, modalRef)
      }
      {...props}
    >
      <div className="c-modal__background-overlay" onClick={onClose} />

      <div className="c-modal__content">
        {React.Children.map(children, (child: React.ReactNode) => {
          if (!React.isValidElement(child)) return child;

          // Injection des props et IDs nécessaires aux sous-composants
          if (child.type === ModalTitle) {
            return React.cloneElement(child, {
              ...child.props,
              id: titleId,
              onClose,
              closeButtonRef,
            });
          }
          if (child.type === ModalDescription) {
            return React.cloneElement(child, {
              ...child.props,
              id: descriptionId,
            });
          }
          return child;
        })}
      </div>
    </div>,
    document.body
  );
};

export interface IModalTitle extends React.ComponentPropsWithoutRef<'div'> {
  onClose?: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement>;
}

export const ModalTitle = ({
  onClose = undefined,
  closeButtonRef,
  children,
  ...props
}: IModalTitle) => {
  return (
    <div className={'c-modal__header'} {...props}>
      {children}
      <ButtonIcon
        variant="tertiary"
        size="sm"
        className={'c-modal__header__close'}
        innerRef={closeButtonRef}
        onClick={onClose}
        iconName={'close'}
        // Ajout d'un label pour l'accessibilité
        aria-label="Fermer la modale"
      />
    </div>
  );
};

export const ModalDescription = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) => (
  <div className={`c-modal__description`} {...props}>
    {children}
  </div>
);

export const ModalActions = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) => (
  <div className={'c-modal__actions'} {...props}>
    {children}
  </div>
);

const MemoModal = React.memo(Modal);

MemoModal.displayName = 'Modal';

export default MemoModal;
