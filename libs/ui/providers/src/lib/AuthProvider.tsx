import { useSession } from "next-auth/react";
import React, { createContext, ReactNode, useContext } from "react";
import { Providers } from "@t4g/types";

export const AuthContext = createContext<
  | {
      user: Providers.AuthProvider.UserFieldsFragment;
      setUser: React.Dispatch<
        React.SetStateAction<
          Providers.AuthProvider.UserFieldsFragment | undefined
        >
      >;
    }
  | undefined
>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status: loading } = useSession();
  const [user, setUser] = React.useState<any>({
    firstname: (session as any)?.user?.firstname || "Firstname",
    lastname: (session as any)?.user?.lastname || "Lastname",
    email: session!.user?.email || "user@t4g.com",
  });

  React.useEffect(() => {
    if (!user) {
      return;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser } as any}>
      {children}
    </AuthContext.Provider>
  );
};

// export function useAuth() {
//   const context = useContext(AuthContext);
//   // if (!context) {
//   //   throw new Error(
//   //     'You must use AuthProvider in order to consume this context'
//   //   );
//   // }
//
//   return context;
// }
