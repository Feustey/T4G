import {
  Avatar,
  Button,
  Modal,
  ModalDescription,
  ModalTitle,
  Rating,
} from '..';
import { useState } from 'react';
import { LangType, PendingTransactionType } from '../../types';
import { useAppDispatch } from 'apps/dapp/hooks';
import { setServiceRating } from 'apps/dapp/services/ratingAPI';
import { v4 as uuidv4 } from 'uuid';
import { addUserNotificationsState } from 'apps/dapp/store/slices';

export interface IConfirmingTransactionModal {
  transaction: PendingTransactionType;
  handleModalClose: (remove: boolean) => void;
  lang: LangType;
}

export const ConfirmingTransactionModal: React.FC<
  IConfirmingTransactionModal
> = ({ transaction, handleModalClose, lang }) => {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const inputs = [
      event.target.rating1,
      event.target.rating2,
      event.target.rating3,
      event.target.rating4,
      event.target.rating5,
    ];

    if (!inputs.find((input) => input.checked === true)) {
      setIsModalOpen(false);
      handleModalClose(true);
    } else {
      const checkedInput = inputs.find((input) => input.checked === true);
      const isRatingUpdated = await setServiceRating(
        transaction.serviceId,
        checkedInput.value,
        transaction.hash
      );
      if (isRatingUpdated === 'SUCCESS') {
        setIsModalOpen(false);
        handleModalClose(true);
      } else {
        dispatch(
          addUserNotificationsState({
            content: `Une erreure est survenue, veuillez réessayer`,
            status: 'error',
            id: uuidv4(),
          })
        );
      }
    }
  };

  return (
    <Modal
      open={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        handleModalClose(true);
      }}
    >
      <ModalTitle>
        <h1 className="c-modal__header__title">Evaluate the session</h1>
      </ModalTitle>
      <ModalDescription>
        <div>
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
          <form className="u-d--flex u-flex-column" onSubmit={handleSubmit}>
            <Rating isEditable={true} lang={lang} />
            <Button type="submit" variant="primary" label={'Save'} />
          </form>
        </div>
      </ModalDescription>
    </Modal>
  );
};

ConfirmingTransactionModal.displayName = 'ConfirmingTransactionModal';
