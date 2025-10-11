import React, { HTMLAttributes, useCallback, useEffect, useRef } from 'react';
import { Button, IconsT4G } from '../index';
import { usePrevious } from '../../hooks';
import { SizeType } from '../../types';

export interface Tab {
  label: string;
  component?: JSX.Element;
  value: string;
  iconStart?: keyof IconsT4G;
  'data-cy'?: string;
}
export interface TabProps extends HTMLAttributes<HTMLUListElement> {
  buttonSize: Omit<SizeType, 'lg'>;
  tabs: Tab[];
  selectedTab?: Tab;
  handleTabChange: (tab: Tab) => void;
  'data-cy'?: string;
}

export const Tabs: React.FC<TabProps> = ({
  buttonSize,
  tabs,
  selectedTab,
  handleTabChange,
  ...props
}) => {
  const tabMenuRef = useRef<HTMLUListElement>(null);
  const refTab = useRef<HTMLButtonElement>(null);

  const oldPreviouslySelectedTab = usePrevious(refTab);
  useEffect(() => {
    // Focus tab only when tab has changed already once.
    if (oldPreviouslySelectedTab != null) {
      refTab.current?.focus();
    }
  }, [selectedTab, oldPreviouslySelectedTab]);

  const handleUserKeyPress = useCallback(
    (event: { key: string }) => {
      const { key } = event;

      const selectedTabIndex = tabs.findIndex(
        (tab) => tab.value === selectedTab?.value
      );
      if (key === 'ArrowLeft') {
        const previousTab = tabs.find(
          (_, index) => selectedTabIndex - 1 === index
        );
        handleTabChange(previousTab || tabs[tabs.length - 1]);
      } else if (key === 'ArrowRight') {
        const nextTab = tabs.find((_, index) => selectedTabIndex + 1 === index);
        handleTabChange(nextTab || tabs[0]);
      }
    },
    [selectedTab, handleTabChange, tabs]
  );

  useEffect(() => {
    const ref = tabMenuRef.current;
    if (ref) {
      ref.addEventListener('keydown', handleUserKeyPress);
      return () => {
        ref.removeEventListener('keydown', handleUserKeyPress);
      };
    }

    // eslint-disable-next-line react/display-name
    return () => null;
  }, [handleUserKeyPress]);

  const getTabIndex = (tab: Tab) => {
    return selectedTab?.label === tab.label ? 0 : -1;
  };

  const handleScroll = (liste: HTMLUListElement) => {
    const totalElem = liste.children.length;
    const { left: listPositionLeft, right: listPositionRight } =
      liste.getBoundingClientRect();
    const firstElement = liste.children[0];
    const { left: firstElementPositionLeft } =
      firstElement.getBoundingClientRect();
    const lastElement = liste.children[totalElem - 1];
    const { right: lastElementPositionRight } =
      lastElement.getBoundingClientRect();

    const hasShadowX =
      firstElementPositionLeft < listPositionLeft &&
      lastElementPositionRight > listPositionRight;
    const hasShadowLeft = firstElementPositionLeft < listPositionLeft;
    const hasShadowRight = lastElementPositionRight > listPositionRight;

    if (hasShadowX) {
      liste.setAttribute(
        'class',
        `c-tabs__list c-tabs__shadow c-tabs__shadow--left c-tabs__shadow--right`
      );
    }

    if (!hasShadowX && hasShadowLeft) {
      liste.setAttribute(
        'class',
        `c-tabs__list c-tabs__shadow c-tabs__shadow--left`
      );
    }

    if (!hasShadowX && hasShadowRight) {
      liste.setAttribute(
        'class',
        `c-tabs__list c-tabs__shadow c-tabs__shadow--right`
      );
    }
  };

  useEffect(() => {
    handleScroll(tabMenuRef.current as HTMLUListElement);
  }, []);

  return (
    <div className="c-tabs">
      <ul
        ref={tabMenuRef}
        className="c-tabs__list"
        role="tablist"
        onScroll={(e) => handleScroll(e.target as HTMLUListElement)}
        {...props}
      >
        {tabs.map((tab, i) => {
          const selected = selectedTab?.value === tab.value;
          return (
            <li key={i} role="presentation">
              <Button
                label={tab.label}
                id={`tab__${tab.value}`}
                size={buttonSize as SizeType}
                className={`
                  c-tabs__tab
                `}
                variant="default"
                tabIndex={getTabIndex(tab)}
                iconStart={tab.iconStart}
                role="tab"
                aria-selected={selected}
                aria-controls={`${tab.value}__content`}
                onClick={() => handleTabChange(tab)}
                innerRef={selected ? refTab : undefined}
                data-cy={tab['data-cy']}
              />
            </li>
          );
        })}
      </ul>
      {selectedTab?.component && (
        <div
          id={`${selectedTab.value}__content`}
          className="c-tabs__panel c-tabs__panel--selected"
          role="tabpanel"
          aria-labelledby={`tab__${selectedTab.value}`}
          tabIndex={0}
        >
          {selectedTab.component}
        </div>
      )}
    </div>
  );
};
