import moment from 'moment';
import React, { useState } from 'react';
import Head from 'next/head';
import { useIndexing } from '../hooks';
import ConnectedLayout from '../layouts/ConnectedLayout';
import { AuthPageType, LangType, NotificationType } from '../types';
import { Icons, Spinner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import useSwr, { mutate } from 'swr';
import { apiFetch, apiFetcher } from 'apps/dapp/services/config';
import { FALLBACK_NOTIFICATIONS } from '../services/fallbackData';

const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  // Mentoring
  MENTORING_BOOKED:    { icon: '📅', color: 'var(--color-info, #2563eb)',    label: 'Réservation' },
  MENTORING_CONFIRMED: { icon: '🔔', color: 'var(--color-warning, #d97706)',  label: 'En attente' },
  MENTORING_COMPLETED: { icon: '🎉', color: 'var(--color-success, #16a34a)',  label: 'Complété' },
  MENTORING_DISPUTED:  { icon: '⚠️', color: 'var(--color-error, #d32f2f)',   label: 'Litige' },
  // Legacy services
  SERVICE_BOOKED_BY_STUDENT:                      { icon: '📅', color: 'var(--color-info, #2563eb)',    label: 'Réservation' },
  SERVICE_DELIVERY_CONFIRMED_BY_STUDENT:          { icon: '✅', color: 'var(--color-success, #16a34a)', label: 'Confirmé' },
  SERVICE_DELIVERY_CANCELED_BY_STUDENT:           { icon: '❌', color: 'var(--color-error, #d32f2f)',   label: 'Annulé' },
  WELCOME_BONUS:                                  { icon: '🎉', color: 'var(--color-primary, #7c3aed)', label: 'Bienvenue' },
};

const getNotificationConfig = (type: string) =>
  NOTIFICATION_TYPE_CONFIG[type] ?? { icon: '🔔', color: 'var(--app-color-text-disabled)', label: '' };

export interface INotifications {
  lang: LangType;
}

const SWR_KEY = `/api/users/me/notifications`;

const Page: React.FC<INotifications> & AuthPageType = ({ lang }: INotifications) => {
  const { user } = useAuth();
  const shouldFetch = typeof window !== 'undefined' && user && user.id;
  const [markingRead, setMarkingRead] = useState(false);

  const { data: notifications = FALLBACK_NOTIFICATIONS, isLoading } = useSwr<NotificationType[]>(
    shouldFetch ? SWR_KEY : null,
    apiFetcher,
    {
      fallbackData: FALLBACK_NOTIFICATIONS,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
    }
  );

  const sortedNotifications = notifications
    ? [...notifications].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    : [];

  const unreadCount = sortedNotifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    setMarkingRead(true);
    try {
      await apiFetch('/api/users/me/notifications/read-all', { method: 'POST' });
      // Optimistic update
      mutate(SWR_KEY, sortedNotifications.map((n) => ({ ...n, is_read: true })), false);
    } catch {
      // ignore
    } finally {
      setMarkingRead(false);
    }
  };

  return (
    <>
      <Head>
        <title>{lang.page.dashboard.head.title}</title>
        {useIndexing(false)}
      </Head>
      <ConnectedLayout user={user ?? undefined} lang={lang} classNameCSS="">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 className="u-d--flex u-align-items-center u-gap--s u-margin-lg--none u-margin--auto">
            <span className="c-icon--title u-margin--none">{Icons.bell}</span>
            Mes notifications
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: 'var(--color-error, #d32f2f)',
                color: '#fff',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                padding: '2px 9px',
                lineHeight: '1.4',
              }}>
                {unreadCount}
              </span>
            )}
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingRead}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-secondary, #64748b)',
                background: 'none',
                border: '1px solid var(--color-border, #e2e8f0)',
                borderRadius: '0.375rem',
                padding: '4px 12px',
                cursor: 'pointer',
                opacity: markingRead ? 0.6 : 1,
              }}
            >
              {markingRead ? 'Mise à jour…' : 'Tout marquer comme lu'}
            </button>
          )}
        </div>

        {isLoading ? (
          <Spinner lang={lang} spinnerText={lang.utils.loading} size="lg" />
        ) : sortedNotifications.length === 0 ? (
          <div className="c-metrics__section-link" style={{ alignItems: 'center', color: 'var(--app-color-text-disabled)' }}>
            <p style={{ margin: 0 }}>Aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="c-metrics__section-link">
            <ul role="list" className="c-notifications" style={{ width: '100%' }}>
              {sortedNotifications.map((notification: NotificationType) => {
                const config = getNotificationConfig(notification.type);
                const inner = (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                    {notification.amount > 0 && (
                      <div className="c-metrics__metric--token" style={{ minWidth: '64px' }}>
                        <p className="c-metrics__metric__number" style={{ fontSize: '28px', lineHeight: '32px' }}>
                          +{notification.amount}
                        </p>
                        <p style={{ fontSize: '11px', margin: 0 }}>T4G</p>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div className="u-d--flex u-align-items-center u-gap--s" style={{ marginBottom: '4px' }}>
                        <span style={{ fontSize: '16px', lineHeight: 1 }} aria-hidden="true">{config.icon}</span>
                        <span style={{ color: 'var(--app-color-text-disabled)', fontSize: '12px' }}>
                          {moment(notification.ts).fromNow()}
                        </span>
                        {config.label && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: config.color,
                            backgroundColor: `${config.color}1a`,
                            borderRadius: '4px',
                            padding: '1px 6px',
                          }}>
                            {config.label}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '14px' }}>{notification.message}</p>
                    </div>
                  </div>
                );
                return (
                  <li
                    key={notification.id}
                    style={{
                      cursor: notification.link ? 'pointer' : 'default',
                      background: notification.is_read === false ? 'var(--color-primary-light, #eff6ff)' : 'transparent',
                      borderRadius: '0.5rem',
                      padding: notification.is_read === false ? '0.5rem 0.75rem' : undefined,
                      marginBottom: '2px',
                    }}
                  >
                    {notification.link ? (
                      <a href={notification.link} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                        {inner}
                      </a>
                    ) : inner}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </ConnectedLayout>
    </>
  );
};

export default Page;

Page.auth = true;
Page.role = ['alumni', 'mentee', 'mentor', 'service_provider'];

export const getServerSideProps = () => ({ props: {} });
