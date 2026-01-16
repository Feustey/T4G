import { useAppDispatch, useAppSelector } from 'apps/dapp/hooks';
import { useAppContext } from '../../contexts/AppContext';
import { LangType } from 'apps/dapp/types';
import { useState } from 'react';
import { Button } from '..';
import {
  bookServiceById,
  cancelServiceById,
  confirmServiceById,
} from 'apps/dapp/services';
import {
  addUserNotificationsState,
  fetchNotificationsState,
  fetchPendingTransactionsState,
  fetchUserBalanceState,
  selectUserBalance,
  setUserBalanceState,
} from 'apps/dapp/store/slices';
import { v4 as uuidv4 } from 'uuid';

export interface IBookingButton {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  lang: LangType;
  label: string;
  cssClassName: string;
  type: 'BOOK' | 'CONFIRM' | 'CANCEL';
  onClick?: (type: 'CONFIRM' | 'CANCEL') => void;
  theme?: 'BENEFITS' | 'SERVICES';
}

export const BookingButton: React.FC<IBookingButton> = ({
  serviceId,
  serviceName,
  servicePrice,
  lang,
  label,
  cssClassName,
  type,
  theme,
  onClick,
}) => {
  const { setModal } = useAppContext();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userBalance = useAppSelector(selectUserBalance);

  return (
    <Button
      label={label}
      className={cssClassName}
      variant={'primary'}
      theme={theme}
      lang={lang}
      isLoading={isLoading}
      onClick={async (e) => {
        e.preventDefault;
        setIsLoading(true);
        setModal(null)
        let response;
        switch (type) {
          case 'BOOK':
            response = await bookServiceById(serviceId);
            break;
          case 'CONFIRM':
            response = await confirmServiceById(serviceId);
            break;
          case 'CANCEL':
            response = await cancelServiceById(serviceId);
            break;

          default:
            break;
        }

        if (response?.status === 'SUCCESS') {
          setTimeout(() => {
            dispatch(fetchNotificationsState());
            dispatch(fetchPendingTransactionsState());
          }, 4000);
          dispatch(
            addUserNotificationsState({
              content: `${serviceName} successfully ${type.toLowerCase()}ed`,
              status: 'success',
              id: uuidv4(),
            })
          );

          switch (type) {
            case 'BOOK':
              dispatch(setUserBalanceState(userBalance - servicePrice));
              break;
            case 'CANCEL':
              onClick('CANCEL');
              dispatch(setUserBalanceState(userBalance + servicePrice));
              break;
            case 'CONFIRM':
              onClick('CONFIRM');
              break;

            default:
              dispatch(fetchUserBalanceState());
              break;
          }

          setIsLoading(false);
        } else if (response?.status === 'ERROR') {
          setIsLoading(false);
          dispatch(
            addUserNotificationsState({
              content: response?.message
                ? `${response?.message}`
                : `Impossible to ${type.toLowerCase()} ${serviceName}, please try again`,
              status: 'error',
              id: uuidv4(),
            })
          );
          dispatch(fetchUserBalanceState());
        }
      }}
    />
  );
};

BookingButton.displayName = 'BookingButton';
