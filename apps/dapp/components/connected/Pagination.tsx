import React, { HTMLAttributes } from 'react';
import { DOTS, usePagination } from '../../hooks';
import { ButtonIcon, Button, Icons } from '../index';

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  onPageChange: (selectedPage: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
  'data-cy'?: string;
}

export const Pagination = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className,
  ...props
}: PaginationProps) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  // If there are less than 2 times in pagination range we shall not render the component
  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const lastPage = paginationRange[paginationRange.length - 1] as number;
  const goFirst = () => {
    onPageChange(1);
  };

  const goNext = () => {
    onPageChange(currentPage + 1);
  };

  const goPrevious = () => {
    onPageChange(currentPage - 1);
  };

  const goLast = () => {
    onPageChange(lastPage);
  };

  return (
    <nav
      role="navigation"
      className={`fr-pagination ${className ?? ''}`}
      aria-label="pagination"
      {...props}
    >
      <ul role="list" className="fr-pagination__list">
        <li>
          <ButtonIcon
            accessibilityLabel="Première page"
            className="fr-pagination__link fr-pagination__link--first"
            iconName="arrowRight"
            disabled={currentPage === 1}
            onClick={goFirst}
            role="link"
            data-cy={`${props['data-cy']}__first-page-button`}
          />
        </li>
        <li>
          <ButtonIcon
            accessibilityLabel="Page précédente"
            className="fr-pagination__link fr-pagination__link--prev"
            iconName="arrowLeft"
            disabled={currentPage === 1}
            onClick={goPrevious}
            role="link"
            data-cy={`${props['data-cy']}__previous-page-button`}
          />
        </li>
        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === DOTS) {
            return (
              <li key={index as number}>
                <span
                  className="fr-pagination__link fr-three-dots"
                  aria-disabled="true"
                  data-cy={`${props['data-cy']}__dots`}
                >
                  {Icons.threeDots}
                </span>
              </li>
            );
          }

          return (
            <li key={index as number}>
              <Button
                className={`fr-pagination__link fr-pagination__link
                ${pageNumber === currentPage ? 'selected' : ''}`}
                aria-current={pageNumber === currentPage || undefined}
                label={pageNumber.toString()}
                onClick={() => onPageChange(parseInt(pageNumber as string, 10))}
                data-cy={`${props['data-cy']}__page-${pageNumber}`}
                aria-label={`Page ${pageNumber} sur ${Math.ceil(
                  totalCount / pageSize
                )}`}
              />
            </li>
          );
        })}
        <li>
          <ButtonIcon
            accessibilityLabel="Page suivante"
            className="fr-pagination__link fr-pagination__link--next"
            iconName="arrowRight"
            disabled={currentPage === lastPage}
            onClick={goNext}
            role="link"
            data-cy={`${props['data-cy']}__next-page-button`}
          />
        </li>
        <li>
          <ButtonIcon
            accessibilityLabel="Dernière page"
            className="fr-pagination__link fr-pagination__link--last"
            iconName="arrowRight"
            disabled={currentPage === lastPage}
            onClick={goLast}
            role="link"
            data-cy={`${props['data-cy']}__last-page-button`}
          />
        </li>
      </ul>
    </nav>
  );
};
