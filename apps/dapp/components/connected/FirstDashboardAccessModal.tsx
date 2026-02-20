import Image from 'next/image';
import { useRouter } from 'next/router';
import { Modal, ModalActions, ModalDescription, ModalTitle, Button } from '..';
import { useState } from 'react';
import { UserRoleType } from '../../types';
import { useLanguage } from 'apps/dapp/hooks';

export interface IFirstDashboardAccessModal {
  userRole: UserRoleType;
}

export const FirstDashboardAccessModal: React.FC<IFirstDashboardAccessModal> = ({ userRole }) => {
  const lang = useLanguage();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

  const tokensGifted = userRole === 'ALUMNI' ? 20 : 100;

  return (
    <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <ModalTitle>
        <h1 className="c-modal__header__title">
          {lang.components.firstDashboardAccessModal.title}
        </h1>
      </ModalTitle>
      <ModalDescription>
        <div className="u-d--flex u-flex-column u-align-items-center u-gap--m">
          <Image
            src="/assets/images/png/token.png"
            alt="logo token for good"
            width={80}
            height={80}
            priority
            className="u-margin--auto"
          />
          <p className="u-text--center u-margin--none">
            {lang.components.firstDashboardAccessModal.p}&nbsp;
            <span className="u-text--bold">{tokensGifted} tokens&nbsp;!</span>
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              width: '100%',
              marginTop: '0.5rem',
            }}
          >
            {[
              {
                icon: '👤',
                label: 'Compléter mon profil',
                href: '/profile',
              },
              {
                icon: userRole === 'ALUMNI' ? '✨' : '🎓',
                label: userRole === 'ALUMNI' ? 'Voir mes services' : 'Trouver un mentor',
                href: userRole === 'ALUMNI' ? '/services' : '/benefits',
              },
            ].map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  setIsModalOpen(false);
                  router.push(item.href);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0.5rem',
                  borderRadius: 8,
                  border: '1px solid var(--color-border, #e2e8f0)',
                  background: 'var(--color-surface, #f8fafc)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-text, #1e293b)',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </ModalDescription>

      <ModalActions>
        <Button
          onClick={() => setIsModalOpen(false)}
          variant="ghost"
          label="Explorer par moi-même"
        />
      </ModalActions>
    </Modal>
  );
};

FirstDashboardAccessModal.displayName = 'FirstDashboardAccessModal';
