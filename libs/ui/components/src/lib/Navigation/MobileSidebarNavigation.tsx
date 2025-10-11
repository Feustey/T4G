import { useAppContext } from "@t4g/ui/providers";
import { useRouter } from "next/router";
import React from "react";
import { NavigationItem } from "./NavigationItem";
import { useSession } from "next-auth/react";
import { Auth } from "@t4g/types";
import { SessionType, UserType } from "@shared/types";

export const MobileSidebarNavigation = function () {
  const { navigationItems } = useAppContext();
  const router = useRouter();
  const session = useSession().data as SessionType;
  if (!session || !session.user) window.location.href = "/";
  const user: UserType = session!.user;

  return (
    <nav className="SidebarNavigationItems h-full p-8 bg-white">
      {router.route.startsWith("/admin/")
        ? navigationItems
            .filter((item) => item.menu === "admin")
            .map((item) => (
              <NavigationItem
                key={item.link}
                href={item.link}
                variant={item.link === router.route ? "highlight" : "default"}
              >
                {item.title}
              </NavigationItem>
            ))
        : navigationItems
            .filter((item) => item.menu === "app")
            .filter((item: any) =>
              user?.role === "STUDENT" && item.link === "/services"
                ? false
                : true
            )
            .map((item) => (
              <NavigationItem
                key={item.link}
                href={item.link}
                variant={item.link === router.route ? "highlight" : "default"}
              >
                {item.title}
              </NavigationItem>
            ))}
    </nav>
  );
};
