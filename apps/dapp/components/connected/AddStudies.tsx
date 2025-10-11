import React from 'react';
import { LangType } from '@shared/types';
import {
  programTopics as ENProgramTopics,
  programs as ENPrograms,
  years as ENYears,
  schools as ENSchools
} from '../../data/en';
import {
  programTopics as FRProgramTopics,
  programs as FRPrograms,
  years as FRYears,
  schools as FRSchools
} from '../../data/fr';
import { ISelectOption, Select } from '..';
import { LocaleType, UserCVType, UserType } from 'apps/dapp/types';
import { useRouter } from 'next/router';

export interface IAddStudies {
  lang: LangType;
  handleChange: (
    value: ISelectOption['value'] | number | string,
    id: string
  ) => void;
  program: UserCVType['program'];
  topic: UserCVType['topic'];
  graduatedYear: UserCVType['graduatedYear'];
  school: UserCVType['school'];
  user: UserType;
}

export const AddStudies: React.FC<IAddStudies> = ({
  lang,
  program,
  topic,
  user,
  school,
  graduatedYear,
  handleChange,
}) => {
  const router = useRouter();
  const locale = router.locale as LocaleType;

  const data = {
    programs: locale === 'fr' ? FRPrograms : ENPrograms,
    programTopics: locale === 'fr' ? FRProgramTopics : ENProgramTopics,
    schools: locale === 'fr' ? FRSchools : ENSchools,
    years: locale === 'fr' ? FRYears : ENYears,
  };

  return (
    <div className="u-d--flex u-flex-wrap u-gap--6 u-padding--none">
      {/* program */}
      <Select
        id={'program'}
        lang={lang}
        labelText={lang.components.addStudies.program}
        isRequired={true}
        options={data.programs}
        labelClassName={'form-label'}
        containerClassName={'u-flex--1'}
        value={program || null}
        handleOptionChange={(option) => {
          handleChange(option, 'program');
        }}
      />
      {/* topic */}
      <Select
        id={'programTopics'}
        lang={lang}
        labelText={lang.components.addStudies.programTopic}
        isRequired={true}
        options={data.programTopics}
        labelClassName={'form-label'}
        containerClassName={'u-flex--1'}
        value={topic || null}
        handleOptionChange={(option) => {
          handleChange(option, 'topic');
        }}
      />
      {/* school */}
      <Select
        id={'school'}
        lang={lang}
        labelText={lang.components.addStudies.school}
        isRequired={true}
        options={data.schools}
        labelClassName={'form-label'}
        containerClassName={'u-flex--1'}
        value={school || null}
        handleOptionChange={(option) => {
          handleChange(option, 'school');
        }}
      />
      {/* graduatedYear */}
      <Select
        id={'graduatedYear'}
        lang={lang}
        labelText={
          user.role === 'ALUMNI'
            ? lang.components.addStudies.graduatedYear.alumni
            : lang.components.addStudies.graduatedYear.student
        }
        isRequired={true}
        options={data.years}
        labelClassName={'form-label'}
        value={graduatedYear || null}
        containerClassName={'u-flex--1'}
        handleOptionChange={(option: string) => {
          handleChange(option, 'graduatedYear');
        }}
      />
    </div>
  );
};

AddStudies.displayName = 'AddStudies';
