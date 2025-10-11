import Cookies from "cookies";
import { GetServerSidePropsContext } from "next";

export const getPageProps = async function (
  context: GetServerSidePropsContext,
  options?: Record<string, any>
) {
  // const session = await getServerSession(context.req, context.res, authOptions)
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: '/',
  //       permanent: false,
  //     },
  //   }
  // }
  // console.log("session", session)

  // const cookies = new Cookies(context.req, context.res);
  // const userId = cookies.get('authUserId');
  //
  // if (!userId) {
  //   return {
  //     redirect: {
  //       permanent: false,
  //       destination: '/',
  //     },
  //     props: {},
  //   };
  // }
  //
  // const user = await fetch(`${process.env['NEXTAUTH_URL']}/api/users/${userId}`)
  //   .then((res) => res.json())
  //   .catch((e) => console.error(e));
  //
  // const { locale } = context;
  // const language = locale === 'fr' ? '' : '/en'
  //
  // if (context.req.url?.includes('/onboarding') &&  user.isOnboarded) {
  //   return {
  //     redirect: {
  //       permanent: false,
  //       destination: `${language}/dashboard/`,
  //     },
  //     props: {
  //       user: user ?? null,
  //     },
  //   };
  // } else if (user?.role === 'SERVICE_PROVIDER') {
  //   return {
  //     redirect: {
  //       permanent: false,
  //       destination: `${language}/admin/`,
  //     },
  //     props: {
  //       user: user ?? null,
  //     },
  //   };
  // } else {
  //   return {
  //     props: {
  //       user: user ?? null,
  //     },
  //   };
  // }
  return {
    props: {
      user: null,
    },
  };
};
