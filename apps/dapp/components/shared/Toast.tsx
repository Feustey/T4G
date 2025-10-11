import * as React from 'react';
import { ButtonIcon } from '..';
import { NotificationStatusType } from 'apps/dapp/types';

export interface ToastProps
  extends Omit<React.ComponentPropsWithoutRef<'dialog'>, 'onClose'> {
  withIcon?: boolean;
  variant: NotificationStatusType;
  isOpen?: boolean;
  withCloseButton?: boolean;
  onClose?: (event: React.MouseEvent | undefined) => void;
}

export const Toast = ({
  children,
  withIcon = false,
  withCloseButton = false,
  variant,
  onClose,
  isOpen = true,
}: ToastProps) => {
  const [show, setShow] = React.useState<boolean>(false);

  React.useEffect(() => {
    const timerId = setTimeout(() => {
      setShow(false);
    }, 5000);

    return () => {
      clearTimeout(timerId);
    };
  }, []);

  React.useEffect(() => {
    if (!show && onClose) {
      const timerId = setTimeout(() => {
        onClose(undefined);
      }, 1000);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [show, onClose]);

  React.useEffect(() => {
    setShow(true);
  }, []);

  return (
    isOpen && (
      <div
        role="status"
        className={`c-toast--${variant} ${withIcon ? 'c-toast--icon' : ''} ${
          show ? 'show' : ''
        }`}
        onClick={() => {
          setShow(false);
        }}
      >
        {children}
        {onClose && withCloseButton && (
          <ButtonIcon
            size="sm"
            variant="tertiary"
            iconName="close"
            aria-label="Close"
            onClick={() => {
              setShow(false);
            }}
          />
        )}
      </div>
    )
  );
};

const MemoToast = React.memo(Toast);

MemoToast.displayName = 'Toast';

export default MemoToast;
