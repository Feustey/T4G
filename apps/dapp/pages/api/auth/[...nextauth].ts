import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { type NextAuthOptions, type Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import LinkedInProvider from 'next-auth/providers/linkedin';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ethers } from 'ethers';
import * as Sentry from '@sentry/nextjs';

import { dbConnect, identitiesDAO, toUser } from '@t4g/service/data';
import { Common } from '@t4g/types';

const t4g_CLIENT_ID = process.env.CLIENT_ID;
const t4g_CLIENT_SECRET = process.env.CLIENT_SECRET;
const t4g_AUTH_URL = process.env.AUTH_URL;

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID ?? '7895aov4u7mhty';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET ?? 'plXSWT8bfchl8WaA';

const DAZNO_VERIFY_SESSION_URL =
  process.env.DAZNO_VERIFY_SESSION_URL ?? 'https://dazno.de/api/auth/verify-session';

if (!t4g_AUTH_URL || !t4g_CLIENT_ID || !t4g_CLIENT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    '[auth] Missing t4g OAuth configuration (AUTH_URL/CLIENT_ID/CLIENT_SECRET). t4g provider will be disabled.'
  );
}

type ExtendedUser = {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role?: Common.ROLE_TYPE;
  wallet?: string;
  name?: string;
};

type ExtendedToken = JWT & { user?: ExtendedUser };
type ExtendedSession = Session & { user: ExtendedUser };

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
    signOut: '/user/logout',
    error: '/user/error',
    verifyRequest: '/user/verify-request',
    newUser: '/user/new-user',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    ...(t4g_AUTH_URL && t4g_CLIENT_ID && t4g_CLIENT_SECRET
      ? [
          {
            id: 't4g',
            name: 't4g',
            type: 'oauth',
            scope: 'login',
            version: '2.0',
            clientId: t4g_CLIENT_ID,
            clientSecret: t4g_CLIENT_SECRET,
            authorization: {
              url: `${t4g_AUTH_URL}/authorize`,
              params: { scope: 'login' },
            },
            token: {
              url: `${t4g_AUTH_URL}/access_token`,
              params: { grant_type: 'authorization_code' },
            },
            userinfo: `${t4g_AUTH_URL}/owner_details`,
            async profile(profile: any) {
              Sentry.setUser({ email: profile.email });
              await dbConnect();
              let dbUser = await identitiesDAO.getUserByEmail(profile.email);

              let role: Common.ROLE_TYPE;

              if (dbUser) {
                role = dbUser.role;
              } else {
                if (profile.email === 'stephane.courant@token-for-good.com') {
                  role = 'SERVICE_PROVIDER';
                } else if (profile.is_student && profile.is_graduated) {
                  role = 'ALUMNI';
                } else if (profile.is_student && !profile.is_graduated) {
                  role = 'STUDENT';
                } else if (!profile.is_student && profile.is_graduated) {
                  role = 'ALUMNI';
                } else if (profile.is_staff) {
                  role = 'ALUMNI';
                } else {
                  role = 'ALUMNI';
                }

                dbUser = await identitiesDAO.create({
                  email: profile.email,
                  avatar: '',
                  firstname: profile.first_name,
                  lastname: profile.last_name,
                  role,
                });
              }

              const userId = dbUser?.id ?? '0';

              return {
                id: userId,
                email: profile.email,
                firstname: profile.first_name,
                lastname: profile.last_name,
                is_student: profile.is_student,
                is_staff: profile.is_staff,
                is_speaker: profile.is_speaker,
                is_graduated: profile.is_graduated,
                role,
                wallet: dbUser?.wallet,
              };
            },
          } as any,
        ]
      : []),
    LinkedInProvider({
      clientId: LINKEDIN_CLIENT_ID,
      clientSecret: LINKEDIN_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: 'custom',
      name: 'custom',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
      },
      async authorize(credentials) {
        if (process.env.FAKE_AUTH !== 'true') {
          // eslint-disable-next-line no-console
          console.warn('[auth] Fake auth disabled. Refusing custom credentials sign-in.');
          return null;
        }

        if (!credentials?.username) {
          return null;
        }

        await dbConnect();

        const map: Record<string, string> = {
          admin: '600000000000000000000000',
          alumni: '600000000000000000000001',
          student: '600000000000000000000002',
        };

        const seeds: Record<string, Common.ROLE_TYPE> = {
          admin: 'SERVICE_PROVIDER',
          alumni: 'ALUMNI',
          student: 'STUDENT',
        };

        const userKey = credentials.username.toLowerCase();
        const userId = map[userKey];

        if (!userId) {
          return null;
        }

        let identityRecord = await identitiesDAO.getById(userId);

        if (!identityRecord) {
          const walletInstance = await ethers.Wallet.createRandom();
          const encryptedWallet = await walletInstance.encrypt(
            process.env.WALLET_ENCRYPTION_PASS ?? 'password'
          );

          await identitiesDAO.create({
            _id: userId,
            email: `${userKey}@token-for-good.com`,
            avatar: '',
            firstname: userKey,
            lastname: 'User',
            role: seeds[userKey],
            wallet: {
              address: walletInstance.address,
              balance: 0,
            },
            encryptedWallet,
          });

          identityRecord = await identitiesDAO.getById(userId);
        }

        if (!identityRecord) {
          return null;
        }

        const userView = toUser(identityRecord);

        return {
          id: userView.id,
          email: identityRecord.email,
          firstname: userView.firstname,
          lastname: userView.lastname,
          role: userView.role,
          wallet: userView.wallet,
          is_student: userView.role === 'STUDENT',
          is_staff: userView.role === 'SERVICE_PROVIDER',
          is_speaker: false,
          is_graduated: userView.role !== 'STUDENT',
        };
      },
    }),
    CredentialsProvider({
      id: 'dazeno',
      name: 'Dazno',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          return null;
        }

        try {
          const response = await fetch(DAZNO_VERIFY_SESSION_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${credentials.token}`,
            },
            credentials: 'include',
          });

          if (!response.ok) {
            return null;
          }

          const daznoUser = await response.json();

          if (!daznoUser?.authenticated || !daznoUser?.user?.email) {
            return null;
          }

          await dbConnect();

          let dbUser = await identitiesDAO.getUserByEmail(daznoUser.user.email);

          if (!dbUser) {
            const [firstname = 'Dazno', lastname = 'User'] =
              (daznoUser.user.name as string | undefined)?.split(' ') ?? [];

            dbUser = await identitiesDAO.create({
              email: daznoUser.user.email,
              avatar: '',
              firstname,
              lastname,
              role: 'ALUMNI',
            });
          }

          return {
            id: dbUser.id,
            email: daznoUser.user.email,
            firstname: dbUser.firstname,
            lastname: dbUser.lastname,
            is_student: false,
            is_staff: false,
            is_speaker: false,
            is_graduated: true,
            role: dbUser.role,
            wallet: dbUser.wallet,
          };
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Erreur authentification Dazno:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }

      if (url.startsWith('/')) {
        return new URL(url, baseUrl).toString();
      }

      return baseUrl;
    },
    async jwt({ token, user }) {
      const extendedToken = token as ExtendedToken;
      const incomingUser = user as ExtendedUser | undefined;

      if (incomingUser) {
        extendedToken.user = incomingUser;
      }

      if (!extendedToken.user?.email) {
        return extendedToken;
      }

      await dbConnect();
      let dbUser = await identitiesDAO.getUserByEmail(extendedToken.user.email);

      if (!dbUser && incomingUser) {
        const [first = 'User', last = 'Token'] = incomingUser.name?.split(' ') ?? [];
        dbUser = await identitiesDAO.create({
          email: incomingUser.email,
          avatar: '',
          firstname: incomingUser.firstname ?? first,
          lastname: incomingUser.lastname ?? last,
          role: incomingUser.role ?? 'ALUMNI',
        });
      }

      if (dbUser) {
        extendedToken.user = {
          ...extendedToken.user,
          id: dbUser.id,
          firstname: dbUser.firstname,
          lastname: dbUser.lastname,
          role: dbUser.role,
          wallet: dbUser.wallet,
        };
      }

      return extendedToken;
    },
    async session({ session, token }) {
      const extendedSession = session as ExtendedSession;
      const extendedToken = token as ExtendedToken;

      if (extendedToken.user) {
        extendedSession.user = extendedToken.user;
      }

      return extendedSession;
    },
  },
};

export default function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, authOptions);
}
