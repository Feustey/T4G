import React from "react";
import { AvatarElement, TextIconElement } from "@t4g/ui/elements";
import { ChevronDownIconElement } from "@t4g/ui/icons";
import { Layouts } from "@t4g/types";
import { useAuth } from '@/contexts/AuthContext';
import { SessionType, UserType } from "@shared/types";
import useSwr from "swr";

export const ProfileToggleRegion: React.FC<Layouts.AppLayout.ProfileToggleRegion.Props> =
  function ({
    variant = "default",
  }: Layouts.AppLayout.ProfileToggleRegion.Props) {
    const session = useSession().data as SessionType;
    const user: UserType = session!.user;
    const rawFetcher = (url: string) =>
      fetch(url)
        .then((res) => res.text())
        .catch((e) => console.error(e));
    const { data: avatarImage, mutate: refreshAvatar } = useSwr(
      `/api/users/${user.id}/avatar`,
      rawFetcher
    );
    return (
      <div className="ProfileToggleRegion lg:mt-0 flex items-center justify-end h-48 -mt-10">
        <AvatarElement
          url={avatarImage as string}
          size="small"
          user={{
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            email: user.email || "",
          }}
        />
        <div className={`${variant === "mobile" ? "hidden" : ""}`}>
          <TextIconElement
            icon={
              <ChevronDownIconElement size="medium" color="text-blue-005" />
            }
            iconPosition="right"
          >
            <span className="text-blue-005 inline-block mx-4 text-center">
              {(user && `${user.firstname}`) || "User"}
            </span>
          </TextIconElement>
        </div>
      </div>
    );
  };
