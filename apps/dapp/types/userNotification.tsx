import { NotificationStatusType } from './status';

export interface UserNotificationType {
  content: string;
  status: NotificationStatusType;
  id: string;
}
