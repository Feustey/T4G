import { NotificationStatusType } from 'apps/dapp/types';

export interface IMessage extends React.ComponentPropsWithoutRef<'div'> {
  variant: NotificationStatusType;
}

export const Message: React.FC<IMessage> = ({ children, variant }) => {
  return (
    <div
      className={`c-message--${variant}`}
      role={variant === 'error' ? 'alert' : null}
    >
      {children}
    </div>
  );
};

Message.displayName = 'Message';
