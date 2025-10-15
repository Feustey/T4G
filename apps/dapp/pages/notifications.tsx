import moment from 'moment/moment';
import React from 'react';
import Head from 'next/head';
import { useAppSelector, useIndexing } from '../hooks';
import ConnectedLayout from '../layouts/ConnectedLayout';
import { AuthPageType, LangType, NotificationType, SessionType } from '../types';
import { selectNotifications } from '../store/slices/notificationsSlices';
import { Icons } from '../components';
import { useAuth } from '../contexts/AuthContext';

export interface IDashboard {
  lang: LangType;
}

const Page: React.FC<IDashboard> & AuthPageType = ({
  lang,
}: IDashboard) => {
  const notifications = useAppSelector(selectNotifications);
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>{lang.page.dashboard.head.title}</title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user ?? undefined} lang={lang} classNameCSS="">
        <h2 className="u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto">
          <span className="c-icon--title u-margin--none">{Icons.bell}</span>
          Mes notifications
        </h2>

        <ul role="list" className="c-notifications">
          {notifications &&
            [...notifications]
              ?.sort(function (a, b) {
                return new Date(b.ts).getTime() - new Date(a.ts).getTime();
              })
              ?.map((notification: NotificationType, index: number) => {
                return (
                  <li key={index}>
                    <span>{moment(notification.ts).fromNow()}</span>
                    <p>{notification.message}</p>
                  </li>
                );
              })}
        </ul>
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['ALUMNI', 'STUDENT'];
