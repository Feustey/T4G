import { UserNotificationType } from 'apps/dapp/types';
import Toast from './Toast';
import {
  selectUserNotifications,
  setUserNotificationsState,
} from '../../store/slices';
import { useAppDispatch, useAppSelector } from 'apps/dapp/hooks';
import React from 'react';

export interface IUserNotifications {
  userNotifications: UserNotificationType[];
}

export const UserNotifications: React.FC = React.memo(() => {
  const userNotifications: UserNotificationType[] = useAppSelector(
    selectUserNotifications
  );
  const dispatch = useAppDispatch();

  return (
    <div className="c-userNotifications">
      {userNotifications &&
        userNotifications?.map((userNotification: UserNotificationType) => (
          <Toast
            key={userNotification.id}
            variant={userNotification.status}
            withCloseButton={true}
            onClose={() =>
              dispatch(
                setUserNotificationsState(
                  userNotifications.filter(
                    (el: UserNotificationType) => el.id !== userNotification.id
                  )
                )
              )
            }
          >
            <p>{userNotification.content}</p>
          </Toast>
        ))}
    </div>
  );
});

UserNotifications.displayName = 'UserNotifications';
