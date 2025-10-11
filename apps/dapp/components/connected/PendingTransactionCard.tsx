import { LangType, PendingTransactionType, UserType } from 'apps/dapp/types';
import { Avatar } from './Avatar';
import { BookingButton } from './BookingButton';
import { Button } from '..';

export interface IPendingTransactionCard {
  pendingTransaction: PendingTransactionType;
  lang: LangType;
  onClick: (type: 'CONFIRM' | 'CANCEL') => void;
  userRole: UserType['role'];
}

export const PendingTransactionCard: React.FC<IPendingTransactionCard> = ({
  pendingTransaction,
  lang,
  onClick,
  userRole,
}) => {
  return (
    <div className="o-card u-width--fill u-d--flex u-gap--m">
      <div className="u-d--flex u-width--fill u-align-items-center u-justify-content-start u-gap--s">
        <Avatar
          avatar={pendingTransaction?.provider?.avatar}
          id={pendingTransaction?.provider?.id}
          firstname={pendingTransaction?.provider?.firstname}
          lastname={pendingTransaction?.provider?.lastname}
          isLoading={false}
          size="sm"
          classNameCss="u-margin--none"
        />
        <p className="u-margin--none u-text--bold">
          You have booked a {pendingTransaction?.category?.toLowerCase()}{' '}
          session with {pendingTransaction?.provider?.firstname}{' '}
          {pendingTransaction?.provider?.lastname}.
        </p>
      </div>
      {userRole === 'STUDENT' && (
        <ul className="u-margin--none u-width--fill">
          <li className="u-width--fill u-margin-b--m">
            Once your session is completed, you need to update it for your
            mentor to be credited,
          </li>
          <li className="u-width--fill">
            If the session hasn&apos;t taken place, you can cancel your
            reservation and your tokens will be refunded.
          </li>
        </ul>
      )}

      <div className="c-button-group u-width--fill">
        <Button
          lang={lang}
          variant="secondary"
          label={'Cancel session'}
          onClick={() => onClick('CANCEL')}
          iconStart="close"
          className="u-margin--none"
        />
        {userRole === 'STUDENT' && (
          <BookingButton
            cssClassName={''}
            serviceId={`${pendingTransaction?.dealId}`}
            serviceName={`${pendingTransaction?.provider?.firstname} ${pendingTransaction?.provider?.lastname}`}
            servicePrice={pendingTransaction?.price}
            lang={lang}
            label={'Confirm session'}
            type={'CONFIRM'}
            onClick={() => onClick('CONFIRM')}
          />
        )}
      </div>
    </div>
  );
};

PendingTransactionCard.displayName = 'PendingTransactionCard';
