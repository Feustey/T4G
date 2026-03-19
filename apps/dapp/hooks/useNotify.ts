import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch } from './useAppDispatch';
import { addUserNotificationsState } from '../store/slices';
import { NotificationStatusType } from '../types';

export function useNotify() {
  const dispatch = useAppDispatch();

  const notify = useCallback(
    (status: NotificationStatusType, content: string) => {
      dispatch(addUserNotificationsState({ id: uuidv4(), status, content }));
    },
    [dispatch]
  );

  return {
    success: (content: string) => notify('success', content),
    error: (content: string) => notify('error', content),
    warning: (content: string) => notify('warning', content),
    info: (content: string) => notify('info', content),
  };
}
