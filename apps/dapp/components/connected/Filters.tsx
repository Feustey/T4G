import { useRouter } from 'next/router';
import {
  Button,
  ButtonIcon,
  Icons,
  Modal,
  ModalActions,
  ModalDescription,
  ModalTitle,
  Select,
  Tag,
} from '..';
import { LangType, LocaleType, UserExperienceType } from 'apps/dapp/types';
import {
  countries as ENCountries,
  proposedServices as ENProposedServices,
  sorting as ENSorting,
  industries as ENIndustries
} from 'apps/dapp/data/en';
import {
  countries as FRCountries,
  sorting as FRSorting,
  proposedServices as FRProposedServices,
  industries as FRIndustries
} from 'apps/dapp/data/fr';
import { useMediaQuery } from 'apps/dapp/hooks';
import { useState } from 'react';

// TODO : Change all "activity" types and data by the corrects ones
export interface IFilters {
  lang: LangType;
  country: UserExperienceType['country'];
  activity: UserExperienceType['country'];
  sort: string;
  handleChange: (option: string, id: string) => void;
  handleRemove: (id: string) => void;
  proposedServices: string;
  resultLength: number;
}

export const Filters: React.FC<IFilters> = ({
  lang,
  country,
  activity,
  handleChange,
  sort,
  handleRemove,
  proposedServices,
  resultLength,
}) => {
  const router = useRouter();
  const locale = router.locale as LocaleType;
  const tags: string[] = [];
  country ? tags.push(country) : null;
  proposedServices ? tags.push(proposedServices) : null;
  activity ? tags.push(activity) : null;
  sort ? tags.push(sort) : null;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [subjectIsOpen, setSubjectIsOpen] = useState<boolean>(false);
  const [countryIsOpen, setCountryIsOpen] = useState<boolean>(false);
  const [activityIsOpen, setActivityIsOpen] = useState<boolean>(false);
  const [sortIsOpen, setSortIsOpen] = useState<boolean>(false);

  const subjectOptions =
    locale === 'fr' ? FRProposedServices : ENProposedServices;

  const countryOptions = locale === 'fr' ? FRCountries : ENCountries;
  const indusOptions = locale === 'fr' ? FRIndustries : ENIndustries;
  const sortOptions = locale === 'fr' ? FRSorting : ENSorting;

  const isMobile = useMediaQuery(992);

  if (isMobile) {
    return (
      <section>
        <Button
          variant="primary"
          theme="BENEFITS"
          label={`Filtrer et trier`}
          tag={tags.length > 0 ? tags.length : undefined}
          iconStart="adjustement"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(true);
          }}
        />

        <Modal
          open={isOpen}
          onClose={() => {
            setIsOpen(false);
          }}
        >
          <ModalTitle>
            <h1 className="c-modal__header__title">Filter and sort</h1>
          </ModalTitle>
          <ModalDescription>
            <ul role="list" className="c-mobile-menu__menubar__menu-container">
              <li>
                {tags.length > 0 && (
                  <div className="u-d--flex u-gap--s u-flex-wrap">
                    {country && (
                      <Tag
                        lang={lang}
                        handleRemove={() => handleRemove('country')}
                        label={
                          locale === 'fr'
                            ? FRCountries.filter(
                                (el) => el.value === country
                              )[0].label
                            : ENCountries.filter(
                                (el) => el.value === country
                              )[0].label
                        }
                        canRemove={true}
                      />
                    )}
                    {activity && (
                      <Tag
                        lang={lang}
                        handleRemove={() => handleRemove('activity')}
                        label={
                          locale === 'fr'
                            ? FRIndustries.filter(
                                (el) => el.value === activity
                              )[0].label
                            : ENIndustries.filter(
                                (el) => el.value === activity
                              )[0].label
                        }
                        canRemove={true}
                      />
                    )}
                    {sort && (
                      <Tag
                        lang={lang}
                        handleRemove={() => handleRemove('sort')}
                        label={
                          locale === 'fr'
                            ? FRSorting.filter(
                                (el) => el.value === sort
                              )[0].label
                            : ENSorting.filter(
                                (el) => el.value === sort
                              )[0].label
                        }
                        canRemove={true}
                      />
                    )}
                    {proposedServices && (
                      <Tag
                        lang={lang}
                        handleRemove={() => handleRemove('proposedServices')}
                        label={
                          locale === 'fr'
                            ? FRProposedServices.filter(
                                (el) => el.value === proposedServices
                              )[0].label
                            : ENProposedServices.filter(
                                (el) => el.value === proposedServices
                              )[0].label
                        }
                        canRemove={true}
                      />
                    )}
                  </div>
                )}
              </li>
              {/* Subjects */}
              <li>
                <button
                  type="button"
                  className={'c-menu-item--with-childs'}
                  aria-haspopup="true"
                  aria-expanded={subjectIsOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    setSubjectIsOpen(true);
                  }}
                >
                  Subjects {Icons.toggleRight}
                </button>
                {subjectIsOpen && (
                  <ul className="c-menu-item__submenu">
                    <li className="u-d--flex u-justify-content-between">
                      <button
                        type="button"
                        className="c-menu-item__submenu__back-button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSubjectIsOpen(false);
                        }}
                      >
                        <span className="u-sr-only">{lang.utils.back}</span>
                        {Icons.toggleLeft}
                      </button>

                      <ButtonIcon
                        variant="tertiary"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpen(false);
                          setSubjectIsOpen(false);
                        }}
                        iconName={'close'}
                      />
                    </li>
                    <li>
                      <h2 className="u-width--fill u-text--center">Subject</h2>
                    </li>
                    {subjectOptions.map((option, index) => {
                      if (index === 0) {
                        return;
                      }
                      return (
                        <li
                          key={index}
                          className={`c-menu-item__submenu__item ${
                            option.value === proposedServices ? 'active' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleChange(option.value, 'proposedServices');
                              setSubjectIsOpen(false);
                            }}
                            className="u-d--flex u-justify-content-between u-width--fill u-align-items-center u-gap--s"
                          >
                            {option.label}
                            {option.value === proposedServices
                              ? Icons.iconCheck
                              : ''}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>

              
              {/* Activity */}
              <li>
                <button
                  type="button"
                  className={'c-menu-item--with-childs'}
                  aria-haspopup="true"
                  aria-expanded={activityIsOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    setActivityIsOpen(true);
                  }}
                >
                  Activity {Icons.toggleRight}
                </button>
                {activityIsOpen && (
                  <ul className="c-menu-item__submenu">
                    <li className="u-d--flex u-justify-content-between">
                      <button
                        type="button"
                        className="c-menu-item__submenu__back-button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActivityIsOpen(false);
                        }}
                      >
                        <span className="u-sr-only">{lang.utils.back}</span>
                        {Icons.toggleLeft}
                      </button>

                      <ButtonIcon
                        variant="tertiary"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpen(false);
                          setActivityIsOpen(false);
                        }}
                        iconName={'close'}
                      />
                    </li>
                    <li>
                      <h2 className="u-width--fill u-text--center">Activity</h2>
                    </li>
                    {indusOptions.map((option, index) => {
                      if (index === 0) {
                        return;
                      }
                      return (
                        <li
                          key={index}
                          className={`c-menu-item__submenu__item ${
                            option.value === activity ? 'active' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleChange(option.value, 'activity');
                              setActivityIsOpen(false);
                            }}
                            className="u-d--flex u-justify-content-between u-width--fill u-align-items-center u-gap--s"
                          >
                            {option.label}
                            {option.value === activity ? Icons.iconCheck : ''}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
              {/* Country */}
              <li>
                <button
                  type="button"
                  className={'c-menu-item--with-childs'}
                  aria-haspopup="true"
                  aria-expanded={countryIsOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    setCountryIsOpen(true);
                  }}
                >
                  Country {Icons.toggleRight}
                </button>
                {countryIsOpen && (
                  <ul className="c-menu-item__submenu">
                    <li className="u-d--flex u-justify-content-between">
                      <button
                        type="button"
                        className="c-menu-item__submenu__back-button"
                        onClick={(e) => {
                          e.preventDefault();
                          setCountryIsOpen(false);
                        }}
                      >
                        <span className="u-sr-only">{lang.utils.back}</span>
                        {Icons.toggleLeft}
                      </button>

                      <ButtonIcon
                        variant="tertiary"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpen(false);
                          setCountryIsOpen(false);
                        }}
                        iconName={'close'}
                      />
                    </li>
                    <li>
                      <h2 className="u-width--fill u-text--center">Country</h2>
                    </li>
                    {countryOptions.map((option, index) => {
                      if (index === 0) {
                        return;
                      }
                      return (
                        <li
                          key={index}
                          className={`c-menu-item__submenu__item ${
                            option.value === country ? 'active' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleChange(option.value, 'country');
                              setCountryIsOpen(false);
                            }}
                            className="u-d--flex u-justify-content-between u-width--fill u-align-items-center u-gap--s"
                          >
                            {option.label}
                            {option.value === country ? Icons.iconCheck : ''}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>

              {/* Sorting */}
              <li>
                <button
                  type="button"
                  className={'c-menu-item--with-childs'}
                  aria-haspopup="true"
                  aria-expanded={sortIsOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    setSortIsOpen(true);
                  }}
                >
                  Sort {Icons.toggleRight}
                </button>
                {sortIsOpen && (
                  <ul className="c-menu-item__submenu">
                    <li className="u-d--flex u-justify-content-between">
                      <button
                        type="button"
                        className="c-menu-item__submenu__back-button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSortIsOpen(false);
                        }}
                      >
                        <span className="u-sr-only">{lang.utils.back}</span>
                        {Icons.toggleLeft}
                      </button>

                      <ButtonIcon
                        variant="tertiary"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsOpen(false);
                          setSortIsOpen(false);
                        }}
                        iconName={'close'}
                      />
                    </li>
                    <li>
                      <h2 className="u-width--fill u-text--center">Sort</h2>
                    </li>
                    {sortOptions.map((option, index) => {
                      if (index === 0) {
                        return;
                      }
                      return (
                        <li
                          key={index}
                          className={`c-menu-item__submenu__item ${
                            option.value === sort ? 'active' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleChange(option.value, 'sort');
                              setSortIsOpen(false);
                            }}
                            className="u-d--flex u-justify-content-between u-width--fill u-align-items-center u-gap--s"
                          >
                            {option.label}
                            {option.value === sort ? Icons.iconCheck : ''}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            </ul>
          </ModalDescription>
          <ModalActions>
            <div className="c-button-group u-width--fill">
              <Button
                variant="primary"
                label={`See (${resultLength})`}
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                }}
              />
              {tags.length > 0 && (
                <Button
                  variant="secondary"
                  label={lang.components.filters.deleteAllButton}
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove('country');
                    handleRemove('sort');
                    handleRemove('proposedServices');
                    handleRemove('activity');
                  }}
                />
              )}
            </div>
          </ModalActions>
        </Modal>
      </section>
    );
  } else {
    return (
      <section className="u-d--flex u-flex-column u-gap--s">
        {tags.length > 0 && (
          <div className="u-d--flex u-gap--s u-flex-wrap">
            {country && (
              <Tag
                lang={lang}
                handleRemove={() => {
                  handleRemove('country');
                }}
                label={
                  locale === 'fr'
                    ? FRCountries.filter((el) => el.value === country)[0].label
                    : ENCountries.filter((el) => el.value === country)[0].label
                }
                canRemove={true}
              />
            )}
            {activity && (
              <Tag
                lang={lang}
                handleRemove={() => handleRemove('activity')}
                label={
                  locale === 'fr'
                    ? FRIndustries.filter((el) => el.value === activity)[0].label
                    : ENIndustries.filter((el) => el.value === activity)[0].label
                }
                canRemove={true}
              />
            )}
            {proposedServices && (
              <Tag
                lang={lang}
                handleRemove={() => handleRemove('proposedServices')}
                label={
                  locale === 'fr'
                    ? FRProposedServices.filter(
                        (el) => el.value === proposedServices
                      )[0].label
                    : ENProposedServices.filter(
                        (el) => el.value === proposedServices
                      )[0].label
                }
                canRemove={true}
              />
            )}
            {sort && (
              <Tag
                lang={lang}
                handleRemove={() => handleRemove('sort')}
                label={
                  locale === 'fr'
                    ? FRSorting.filter(
                        (el) => el.value === sort
                      )[0].label
                    : ENSorting.filter(
                        (el) => el.value === sort
                      )[0].label
                }
                canRemove={true}
              />
            )}
            {tags.length > 0 && (
              <button
                className="u-text--bold hover:underline"
                type="button"
                onClick={() => {
                  handleRemove('country');
                  handleRemove('sort');
                  handleRemove('activity');
                  handleRemove('proposedServices');
                }}
              >
                {lang.components.filters.deleteAllButton}
              </button>
            )}
          </div>
        )}
        <form className="u-d--flex u-gap--s">
          <Select
            id={'country'}
            labelText={lang.components.filters.proposedServices}
            lang={lang}
            isSmallable={true}
            labelClassName={'u-sr-only'}
            containerClassName={'u-flex--1'}
            options={locale === 'fr' ? FRProposedServices : ENProposedServices}
            value={proposedServices || null}
            handleOptionChange={(option: string) => {
              handleChange(option, 'proposedServices');
            }}
          />
          <Select
           id={'activity'}
           labelText={lang.components.filters.activity}
           isSmallable={true}
           lang={lang}
           labelClassName={'u-sr-only'}
           containerClassName={'u-flex--1'}
           options={indusOptions}
           value={activity || null}
           handleOptionChange={(option: string) => {
             handleChange(option, 'activity');
           }}
         /> 
          <Select
            id={'country'}
            labelText={lang.components.filters.country}
            isSmallable={true}
            lang={lang}
            labelClassName={'u-sr-only'}
            containerClassName={'u-flex--1'}
            options={countryOptions}
            value={country || null}
            handleOptionChange={(option: string) => {
              handleChange(option, 'country');
            }}
          />
          <Select
            id={'sorting'}
            labelText={lang.components.filters.sorting}
            isSmallable={true}
            lang={lang}
            labelClassName={'u-sr-only'}
            containerClassName={'u-flex--1'}
            options={sortOptions}
            value={sort || null}
            handleOptionChange={(option: string) => {
              handleChange(option, 'sort');
            }}
          />
        </form>
      </section>
    );
  }
};

Filters.displayName = 'Filters';
