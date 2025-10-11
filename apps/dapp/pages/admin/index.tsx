import { GetServerSideProps } from 'next';
import React from 'react';

const Page: React.FC = () => {
  return <></>;
};

export default Page;

export const getServerSideProps: GetServerSideProps = async function (context) {
  const { locale } = context;
  const language = locale === 'fr' ? '' : '/en';

  return {
    redirect: {
      permanent: false,
      destination: `${language}/admin/service-delivery`,
    },
  };
};
