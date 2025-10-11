import { LangType } from '@shared/types';
import { Select, TextInput } from '..';
import { LocaleType, UserExperienceType } from 'apps/dapp/types';
import {
  countries as ENCountries,
  months as ENMonths,
  years as ENYears,
  industries as ENIndustries,
} from 'apps/dapp/data/en';
import {
  countries as FRCountries,
  months as FRMonths,
  years as FRYears,
  industries as FRIndustries,
} from 'apps/dapp/data/fr';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export interface IAddExperiences {
  lang: LangType;
  handleChange: (option: string | boolean | number, id: string) => void;
  title: UserExperienceType['title'];
  company: UserExperienceType['company'];
  city: UserExperienceType['city'];
  country: UserExperienceType['country'];
  industry: UserExperienceType['industry'];
  monthFrom: number;
  yearFrom: number;
  monthTo: number;
  yearTo: number;
  isCurrent: UserExperienceType['isCurrent'];
  variant: 'onboarding' | 'add';
}

export const AddExperiences: React.FC<IAddExperiences> = ({
  variant,
  lang,
  title,
  company,
  city,
  country,
  industry,
  isCurrent,
  monthFrom,
  yearFrom,
  monthTo,
  yearTo,
  handleChange,
}) => {
  const router = useRouter();
  const locale = router.locale as LocaleType;

  // Calculer l'erreur de date directement à partir des props (état dérivé)
  const isDateError =
    !isCurrent &&
    yearFrom &&
    yearTo &&
    (yearFrom > yearTo || (yearFrom === yearTo && monthFrom > monthTo));

  // Informer le composant parent de l'état de l'erreur
  useEffect(() => {
    handleChange(isDateError, 'dateError');
  }, [isDateError, handleChange]);

  const data = {
    countries: locale === 'fr' ? FRCountries : ENCountries,
    months: locale === 'fr' ? FRMonths : ENMonths,
    years: locale === 'fr' ? FRYears : ENYears,
    industries: locale === 'fr' ? FRIndustries : ENIndustries,
  };

  return (
    variant === 'onboarding' && (
      <div className="u-d--flex u-flex-column u-gap--6">
        <div className="u-d--flex u-flex-wrap u-gap--6">
          {/* Job Title */}
          <TextInput
            id={'title'}
            langFile={lang}
            labelText={lang.components.addExperience.jobTitle}
            isRequired={true}
            labelClassName={'form-label'}
            containerClassName={'u-flex--1'}
            value={title || null}
            placeholder={'Ex : Lead Product Designer'}
            handleChange={(value: string) => {
              handleChange(value, 'title');
            }}
          />
          {/* Job company */}
          <TextInput
            id={'company'}
            langFile={lang}
            labelText={lang.components.addExperience.jobCompany}
            isRequired={true}
            labelClassName={'form-label'}
            containerClassName={'u-flex--1'}
            value={company || null}
            placeholder={'Ex : theTribe'}
            handleChange={(value: string) => {
              handleChange(value, 'company');
            }}
          />
        </div>
        <div className="u-d--flex u-flex-wrap u-gap--6">
          {/* Job city */}
          <TextInput
            id={'city'}
            langFile={lang}
            labelText={lang.components.addExperience.jobCity}
            isRequired={true}
            labelClassName={'form-label'}
            containerClassName={'u-flex--1'}
            value={city || null}
            placeholder={'Ex : Nantes'}
            handleChange={(value: string) => {
              handleChange(value, 'city');
            }}
          />
          {/* Job Country */}
          <Select
            id={'country'}
            labelText={lang.components.addExperience.jobCountry}
            lang={lang}
            labelClassName={'form-label'}
            isRequired={true}
            containerClassName={'u-flex--1'}
            options={data.countries}
            value={country || null}
            handleOptionChange={(option: string) => {
              handleChange(option, 'country');
            }}
          />
        </div>
        <div className="u-d--flex u-flex-wrap u-gap--6">
          {/* Job Industry */}
          <Select
            id={'industry'}
            labelText={lang.components.addExperience.jobIndustry}
            lang={lang}
            labelClassName={'form-label'}
            isRequired={true}
            containerClassName={'u-flex--1'}
            options={data.industries}
            value={industry || null}
            handleOptionChange={(option: string) => {
              handleChange(option, 'industry');
            }}
          />
        </div>

        <div className="u-d--flex u-flex-column u-gap--6 u-padding--none">
          {/* From */}
          <fieldset className="u-d--flex u-flex-wrap u-gap--6 u-padding--none">
            <legend className="form-label">
              {lang.components.addExperience.jobStartDate}
              <span aria-hidden={true}>*</span>
              <span className="u-sr-only">{lang.utils.required}</span>
            </legend>
            <Select
              id={'MonthFrom'}
              lang={lang}
              labelText={lang.components.addExperience.monthFrom}
              isRequired={true}
              labelClassName="u-sr-only"
              options={data.months}
              isSmallable={true}
              value={monthFrom?.toString() || null}
              containerClassName={'u-flex--1'}
              ariaDescribedby={isDateError ? 'aria-dateError' : undefined}
              isErrored={isDateError}
              handleOptionChange={(option: string) => {
                handleChange(option, 'monthFrom');
              }}
            />

            <Select
              id={'YearFrom'}
              lang={lang}
              labelText={lang.components.addExperience.yearFrom}
              labelClassName="u-sr-only"
              isRequired={true}
              options={data.years}
              isSmallable={true}
              value={yearFrom?.toString() || null}
              containerClassName={'u-flex--1'}
              ariaDescribedby={isDateError ? 'aria-dateError' : undefined}
              isErrored={isDateError}
              handleOptionChange={(option: string) => {
                handleChange(option, 'yearFrom');
              }}
            />
          </fieldset>

          {/* isCurrent */}
          <div className="u-d--flex">
            <input
              type="checkbox"
              checked={isCurrent || false}
              name="isCurrent"
              id="isCurrent"
              className={`form-checkbox`}
              onChange={() => {
                handleChange(!isCurrent, 'isCurrent');
              }}
            />
            <label htmlFor="isCurrent">
              {' '}
              {lang.components.addExperience.jobIsCurrent}
            </label>
          </div>

          {/* To */}
          {!isCurrent && (
            <fieldset className="u-d--flex u-flex-column u-gap--6 u-padding--none">
              <legend className="form-label">
                {lang.components.addExperience.jobEndDate}
                <span aria-hidden={true}>*</span>
                <span className="u-sr-only">{lang.utils.required}</span>
              </legend>
              <div className="u-d--flex u-flex-wrap u-gap--6">
                <Select
                  id={'MonthTo'}
                  lang={lang}
                  labelText={lang.components.addExperience.monthTo}
                  labelClassName="u-sr-only"
                  isSmallable={true}
                  options={data.months}
                  isRequired={true}
                  value={monthTo?.toString() || null}
                  containerClassName={'u-flex--1'}
                  ariaDescribedby={isDateError ? 'aria-dateError' : undefined}
                  isErrored={isDateError}
                  handleOptionChange={(option: string) => {
                    handleChange(option, 'monthTo');
                  }}
                />

                <Select
                  id={'YearTo'}
                  lang={lang}
                  labelText={lang.components.addExperience.yearTo}
                  labelClassName="u-sr-only"
                  options={data.years}
                  isRequired={true}
                  isSmallable={true}
                  value={yearTo?.toString() || null}
                  containerClassName={'u-flex--1'}
                  ariaDescribedby={isDateError ? 'aria-dateError' : undefined}
                  isErrored={isDateError}
                  handleOptionChange={(option: string) => {
                    handleChange(option, 'yearTo');
                  }}
                />
              </div>
              {isDateError && (
                <p id="aria-dateError" className="error-text">
                  {lang.components.addExperience.dateError}
                </p>
              )}
            </fieldset>
          )}
        </div>
      </div>
    )
  );
};

AddExperiences.displayName = 'AddExperiences';
