import React from 'react';
import { EditProfileInfo } from '../components/ui';
import { Components } from '../lib/types';
import Head from 'next/head';
import ConnectedLayout from '../layouts/ConnectedLayout';
import { useIndexing } from '../hooks';
import { AuthPageType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Breadcrumb } from '../components';
import { useAppContext } from '../contexts/AppContext';
import { DeleteUser } from '../components/ui/DeleteUser';
import { RightPanel, AppModal } from '../lib/ui-layouts';

const Page: React.FC<Components.Profile.Page.Props> & AuthPageType = ({
  lang,
}: Components.Profile.Page.Props) => {
  const { user } = useAuth();
  const { setModal } = useAppContext();

  return (
    <>
      <Head>
        <title>{lang.page.profile.head.title}</title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user} lang={lang}>
        <Breadcrumb
          links={[
            {
              text: lang.components.breadcrumb.dashboard.label,
              link: '/dashboard',
              parent: true,
            },
            { text: lang.components.breadcrumb.profile.label },
          ]}
        />
        <div className="Profile">
          <main className="Profile__main">
            <EditProfileInfo lang={lang} />
          </main>
          <aside className="Profile__aside">
            <p
              className="Profile__delete-account"
              onClick={async (e) => {
                e.preventDefault();
                setModal({ component: <DeleteUser /> });
              }}
            >
              <span className="u-text--bold">Delete</span> your account
            </p>
          </aside>
        </div>
        <RightPanel />
        <AppModal />
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export const getServerSideProps = () => ({ props: {} });

