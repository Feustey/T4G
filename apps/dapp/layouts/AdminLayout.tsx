import {LangType} from '../types';
import GlobalLayout from './GlobalLayout';
import getConfig from "next/config";
import useWebSocket from "react-use-websocket";
import {fetchNotificationsState, fetchPendingTransactionsState, setUserBalanceState} from "apps/dapp/store/slices";
import { useAuth } from '../contexts/AuthContext';
import {useAppDispatch} from "apps/dapp/hooks";

export interface IAdminLayout {
  lang: LangType;
  children: React.ReactNode;
}

export default function AdminLayout({ children }: IAdminLayout) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const WS_URL = getConfig().publicRuntimeConfig.updatesUrl;
  useWebSocket(user?.id ? `${WS_URL}/wallet/${user.id}` : null, {
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

  return <GlobalLayout>{children}</GlobalLayout>;
}
