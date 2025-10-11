import { LangType, UserType } from '../types';
import GlobalLayout from './GlobalLayout';
import { useAppDispatch, useAppSelector, useMediaQuery } from '../hooks';
import {
  selectProposedServices,
  fetchProposedServicesState,
  selectUserBalance,
  fetchUserBalanceState,
  selectPendingTransactions,
  fetchPendingTransactionsState,
  setUserBalanceState,
} from '../store/slices';
import { FooterConnected, HeaderConnected, SideNav } from '../components';
import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import getConfig from 'next/config';
import {
  fetchNotificationsState,
  selectNotifications,
} from '../store/slices/notificationsSlices';

export interface IConnectedLayout {
  lang: LangType;
  children: React.ReactNode;
  user: UserType;
  classNameCSS?: string;
}

export default function ConnectedLayout({
  children,
  lang,
  user,
  classNameCSS,
}: IConnectedLayout) {
  const proposedServices = useAppSelector(selectProposedServices);
  const userBalance = useAppSelector(selectUserBalance);
  const notifications = useAppSelector(selectNotifications);
  const pendingTransactions = useAppSelector(selectPendingTransactions);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!proposedServices && user.role === 'ALUMNI') {
      dispatch(fetchProposedServicesState());
    }
    if (!userBalance) {
      dispatch(fetchUserBalanceState());
    }
    if (!notifications) {
      dispatch(fetchNotificationsState());
    }
    if (!pendingTransactions) {
      dispatch(fetchPendingTransactionsState());
    }
  }, [dispatch, proposedServices, user.role, userBalance, notifications, pendingTransactions]);

  const isMobile = useMediaQuery(992);

  const WS_URL = getConfig().publicRuntimeConfig.updatesUrl;
  useWebSocket(user.wallet ? `${WS_URL}/wallet/${user.wallet}` : null, {
    onOpen: () => {
      console.log('connected to updates');
    },
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log('updates message', data);
      if (data.balance) {
        dispatch(setUserBalanceState(data.balance));
        dispatch(fetchNotificationsState());
        dispatch(fetchPendingTransactionsState());
      }
    },
    shouldReconnect: (closeEvent) => true,
  });

  return (
    <div className="e-connected-layout">
      <HeaderConnected user={user} userBalance={userBalance} lang={lang} />
      {!isMobile && <SideNav user={user} lang={lang} />}
      <GlobalLayout classNameCSS={classNameCSS}>{children}</GlobalLayout>
      <FooterConnected lang={lang} />
    </div>
  );
}
