import { DividerElement } from "@t4g/ui/elements";
import { HelpIconElement } from "@t4g/ui/icons";
import { useAppContext } from "@t4g/ui/providers";
import Link from "next/link";
import React from "react";
import { SignOutDialog } from "../Authentication/SignOutDialog";
import UserProfile from "./UserProfile";
import { UserType } from "apps/dapp/types";

interface ProfileDropdownMenuProps {
  user: UserType;
}

export const ProfileDropdownMenu = ({ user }: ProfileDropdownMenuProps) => {
  const { setModal, editUserProfile, deleteUserProfile } = useAppContext();

  const ProfileDropdownMenuItems = [
    {
      href: "/notifications",
      label: "Notifications",
      divider: false,
    },
    {
      href: "/profile",
      label: "Profile info",
      divider: true,
      openInNewTab: false,
    },
    {
      href: "mailto:support@token-for-good.com",
      label: "Need help? Questions?",
      link: "support@token-for-good.com",
      icon: "help",
      divider: false,
    },
  ];
  const AdminProfileDropdownMenuItems = [
    {
      href: "mailto:support@token-for-good.com",
      label: "Need help? Questions?",
      link: "support@token-for-good.com",
      icon: "help",
      divider: false,
    },
  ];

  return (
    <div className="ProfileDropdownMenu" data-testid="ProfileDropdownMenu">
      <div
        className="w-80 px-3 pb-2"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabIndex={-1}
      >
        <div
          className="ProfileDropdownMenu__UserProfile hover:bg-lm-lightBlue hover:bg-opacity-12 mb-5 rounded-t"
          role="none"
        >
          <a
            href="#"
            className="hover:cursor-default text-base text-blue-005"
            role="menuitem"
            tabIndex={-1}
            id="menu-item-0"
          >
            {
              <UserProfile
                onEditProfile={editUserProfile}
                onDeleteProfile={deleteUserProfile}
              />
            }
          </a>
        </div>

        <DividerElement bleeding spacing="py-2" />

        <div className="ProfileDropdownMenu__MenuItems" role="none">
          {user.role === "SERVICE_PROVIDER"
            ? AdminProfileDropdownMenuItems.map((item, index) => {
                return (
                  <div key={index} className="py-0">
                    <Link legacyBehavior href={item.href} key={`link-${index}`}>
                      <a
                        className={`flex justify-between w-full text-base px-2 py-3.5 text-blue-005 ${
                          item.link ? "" : "hover:bg-blue-001 hover:"
                        }`}
                        role="menuitem"
                        tabIndex={-1}
                        id={`menu-item-${index}`}
                      >
                        <span
                          className={`${
                            item.link
                              ? "hover:cursor-default text-blue-005"
                              : ""
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.icon === "help" && (
                          <HelpIconElement size="small" />
                        )}
                      </a>
                    </Link>
                    {item.link && (
                      <a
                        href={item.href}
                        className="-top-2 text-blue-002 relative inline-block px-2 mb-1 text-base text-blue-005"
                        role="menuitem"
                        tabIndex={-1}
                        id={`menu-item-${index}`}
                      >
                        {item.link}
                      </a>
                    )}
                    {item.divider && <DividerElement bleeding spacing="py-2" />}
                  </div>
                );
              })
            : ProfileDropdownMenuItems.map((item, index) => {
                return (
                  <div key={index} className="py-0">
                    <Link legacyBehavior href={item.href} key={`link-${index}`}>
                      <a
                        className={`flex justify-between w-full text-base px-2 py-3.5 text-blue-005 ${
                          item.link ? "" : "hover:bg-blue-001 hover:"
                        }`}
                        role="menuitem"
                        tabIndex={-1}
                        id={`menu-item-${index}`}
                        target={`${item.openInNewTab ? `_blank` : ""}`}
                      >
                        <span
                          className={`${
                            item.link
                              ? "hover:cursor-default text-blue-005"
                              : ""
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.icon === "help" && (
                          <HelpIconElement size="small" />
                        )}
                      </a>
                    </Link>
                    {item.link && (
                      <a
                        href={item.href}
                        className="-top-2 text-blue-002 relative inline-block px-2 mb-1 text-base text-blue-005"
                        role="menuitem"
                        tabIndex={-1}
                        id={`menu-item-${index}`}
                        target={`${item.openInNewTab ? `_blank` : ""}`}
                      >
                        {item.link}
                      </a>
                    )}
                    {item.divider && <DividerElement bleeding spacing="py-2" />}
                  </div>
                );
              })}
        </div>

        <DividerElement bleeding spacing="py-2" />

        <div
          className="ProfileDropdownMenu__SignoutDialog px-2 py-3.5 hover:bg-blue-001 hover: hover:cursor-pointer text-blue-005"
          role="none"
          onClick={() => {
            setModal({
              component: (
                <div>
                  <SignOutDialog />
                </div>
              ),
            });
          }}
        >
          <a
            className="text-base text-blue-005"
            role="menuitem"
            tabIndex={-1}
            id="menu-item-6"
          >
            Log out
          </a>
        </div>
      </div>
    </div>
  );
};
