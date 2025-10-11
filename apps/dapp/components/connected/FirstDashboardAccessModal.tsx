import Image from 'next/image';
import { Modal, ModalDescription, ModalTitle } from '..';
import { useState } from 'react';
import { UserRoleType } from '../../types';
import { useLanguage } from 'apps/dapp/hooks';

export interface IFirstDashboardAccessModal {
  userRole: UserRoleType;
}

export const FirstDashboardAccessModal: React.FC<
  IFirstDashboardAccessModal
> = ({ userRole }) => {
  const lang = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  return (
    <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <ModalTitle>
        <h1 className="c-modal__header__title">
          {lang.components.firstDashboardAccessModal.title}
        </h1>
      </ModalTitle>
      <ModalDescription>
        <p className="u-text--center">
          {lang.components.firstDashboardAccessModal.p}&nbsp;
          <span className="u-text--bold">
            {userRole === 'ALUMNI' ? <span>20</span> : <span>100</span>}{' '}
            tokens&nbsp;!
          </span>{' '}
        </p>
        <Image
          src="/assets/images/png/token.png"
          alt={'logo token for good'}
          width={100}
          height={100}
          priority
          className="u-margin--auto"
        />
      </ModalDescription>

      {/* exemple d'implémentation d'action*/}

      {/* <ModalActions>
                  <Button
                    onClick={() => console.log("go back")}
                    variant="secondary" label={'Go Back'} />
                  <Button
                    onClick={() => console.log("ok")}
                    variant="secondary" label={'Ok'} />
                </ModalActions> */}
    </Modal>
  );
};

FirstDashboardAccessModal.displayName = 'FirstDashboardAccessModal';
