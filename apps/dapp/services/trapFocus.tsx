import { RefObject } from 'react';

export function trapFocus(
  e: React.KeyboardEvent<HTMLDivElement> | KeyboardEvent,
  elementRef: RefObject<HTMLDivElement>
) {
  // only execute if tab is pressed
  if (e.key !== 'Tab') return;

  // here we query all focusable elements, customize as your own need
  const focusableModalElements = elementRef.current.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select'
  );

  const firstElement: HTMLElement = focusableModalElements[0] as HTMLElement;
  const lastElement: HTMLElement = focusableModalElements[
    focusableModalElements.length - 1
  ] as HTMLElement;

  // if going forward by pressing tab and lastElement is active shift focus to first focusable element
  if (!e.shiftKey && document.activeElement === lastElement) {
    firstElement.focus();
    return e.preventDefault();
  }

  // if going backward by pressing tab and firstElement is active shift focus to last focusable element
  if (e.shiftKey && document.activeElement === firstElement) {
    lastElement.focus();
    e.preventDefault();
  }
}
