import {
  Avatar,
  BookingButton,
  Button,
  Modal,
  ModalActions,
  ModalDescription,
  ModalTitle,
} from '..';
import { useState } from 'react';
import { PendingTransactionType } from '../../types';
import { useLanguage } from 'apps/dapp/hooks';

export interface ICancellingTransactionModal {
  transaction: PendingTransactionType;
  handleModalClose: (remove: boolean) => void;
}

export const CancellingTransactionModal: React.FC<
  ICancellingTransactionModal
> = ({ transaction, handleModalClose }) => {
  const lang = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  return (
    <Modal
      open={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        handleModalClose(false);
      }}
    >
      <ModalTitle>
        <h1 className="c-modal__header__title">Cancel the session</h1>
      </ModalTitle>
      <ModalDescription>
        <div className="u-width--fill o-card">
          <div className="u-d--flex u-width--fill u-align-items-center u-justify-content-start u-gap--s ">
            <Avatar
              avatar={transaction?.provider?.avatar}
              id={transaction?.provider?.id}
              firstname={transaction?.provider?.firstname}
              lastname={transaction?.provider?.lastname}
              isLoading={false}
            />
            <p className="u-margin--none u-text--bold">
              You have booked a {transaction?.category?.toLowerCase()} session
              with {transaction?.provider?.firstname}{' '}
              {transaction?.provider?.lastname}.
            </p>
          </div>
        </div>
      </ModalDescription>

      <ModalActions>
        <BookingButton
          lang={lang}
          label={'Yes, I cancel the session'}
          type={'CANCEL'}
          cssClassName={''}
          serviceId={`${transaction?.dealId}`}
          serviceName={`${transaction?.provider?.firstname} ${transaction?.provider?.lastname}`}
          servicePrice={transaction?.price}
          onClick={() => {
            setIsModalOpen(false);
            handleModalClose(true);
          }}
        />

        <Button
          onClick={() => {
            setIsModalOpen(false);
            handleModalClose(false);
          }}
          variant="secondary"
          label={'No'}
        />
      </ModalActions>
    </Modal>
  );
};

CancellingTransactionModal.displayName = 'CancellingTransactionModal';
