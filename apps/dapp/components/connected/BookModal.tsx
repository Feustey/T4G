import React, { useState } from 'react';
import { Avatar, BookingButton, Message } from 'apps/dapp/components';
import { useAuth } from '../../contexts/AuthContext';
import { LangType, ReceiveServiceType } from 'apps/dapp/types';
import { SelectElement } from '@t4g/ui/elements';
import Image from 'next/image';

interface BookModalProps {
  lang: LangType;
  benefit: ReceiveServiceType;
}

export const BookModal: React.FC<BookModalProps> = function ({
  lang,
  benefit,
}: BookModalProps) {

  const { user } = useAuth();

  const [topic, setTopic] = useState<string>();

  return (
    <>
      <div className="CreateExperienceForm px-4 lg:px-[116px] pt-20 pb-12">
        <h2 className="text-center">Schedule an appointment</h2>
        <Message variant={'info'}>
          <div className="flex gap-4 justify-center items-center">
            <Avatar
              id={'avatar'}
              isEditable={false}
              avatar={benefit?.provider?.avatar as string}
              firstname={benefit?.provider?.firstName}
              lastname={benefit?.provider?.lastName}
              isDisplayingName={false}
              size="sm"
              isLoading={false}
            />
            <p className="min-h-min">
              You want to schedule an appointment with{' '}
              {benefit?.provider?.firstName} {benefit?.provider?.lastName}
            </p>
          </div>
        </Message>
        <div className="flex flex-col mt-4">
          <label htmlFor="topic" className="mt-0 mb-2 ">
            Benefits :
          </label>
          <Message variant={'info'}>
            <div className='u-d--flex u-gap--xs u-flex-wrap'>
              <span> {benefit?.category?.name} :</span>
              <span className="u-text--bold u-d--flex u-gap--xs">
                <Image
                  alt=""
                  src="/assets/images/png/token.png"
                  width={24}
                  height={24}
                  className="c-header--connected__token__image"
                  priority
                />
                {benefit?.price?.toString()?.split(' ')[0]} tokens /{' '}
                {benefit?.unit}
              </span>
            </div>
          </Message>
        </div>
        <div className="flex flex-col mt-4">
          <label htmlFor="topic" className="mt-0 mb-2 ">
            Topic :
          </label>
          <SelectElement
              id="topic"
              label="Please select"
              variant="theme"
              options={
                benefit.provider?.proposedServices.map(s => ({
                  value: s,
                  label: s,
                }))
              }
              value={topic}
              handleChange={(value) => {
                setTopic(value);
              }}
            />
        </div>
        <div className="EditProgram__Controls flex justify-center w-full mt-8 gap-5">
          <BookingButton
            type="BOOK"
            serviceId={benefit.id}
            lang={lang}
            label={'Book'}
            cssClassName=""
            serviceName={`${
              benefit?.provider?.firstName
            } ${benefit?.provider?.firstName.toUpperCase()}`}
            servicePrice={benefit.price}
          />
        </div>
      </div>
    </>
  );
};
