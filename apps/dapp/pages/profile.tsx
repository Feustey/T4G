import React from 'react';
import { EditProfileInfo } from '@t4g/ui/components';
import { Components } from '@t4g/types';
import Head from 'next/head';
import ConnectedLayout from '../layouts/ConnectedLayout';
import { useIndexing } from '../hooks';
import { AuthPageType, SessionType } from '../types';
import { useSession } from 'next-auth/react';
import { Breadcrumb } from '../components';
import { AppModal } from 'libs/ui/layouts/src/lib/AppLayout/AppModal';
import { RightPanel } from 'libs/ui/layouts/src/lib/AppLayout/RightPanel';
import { useAppContext } from '@t4g/ui/providers';
import { DeleteUser } from 'libs/ui/components/src/lib/ProfileInfo/DeleteUser';

const Page: React.FC<Components.Profile.Page.Props> & AuthPageType = ({
  lang,
}: Components.Profile.Page.Props) => {
  const session = useSession().data as SessionType;
  const user = session.user;
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
        <h2 className='u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto heading-2'>
          {user.firstname} {user.lastname.toUpperCase()}{' '}
        </h2>
        <div className="Profile">
          <main className="Profile__main lg:col-span-12 col-span-12">
            <EditProfileInfo lang={lang} />
          </main>
        </div>
            <p
              className="cursor-pointer absolute bottom-0"
              onClick={async (e) => {
                e.preventDefault();
                setModal({
                  component: <DeleteUser/>,
                });
              }}
            >
              <span className="u-text--bold">Delete</span> your account 🙁
              
            </p>
        <RightPanel />
        <AppModal />
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['ALUMNI', 'STUDENT', 'SERVICE_PROVIDER'];

