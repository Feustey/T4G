import { AvatarElement, TextElement } from "@t4g/ui/elements";
import { DeleteIconElement, EditIconElement } from "@t4g/ui/icons";
import React from "react";
import { Auth, Layouts } from "@t4g/types";
import { useSession } from "next-auth/react";
import { SessionType, UserType } from "@shared/types";

type UserProfileProps = Layouts.AppLayout.UserProfile.Props;

const UserProfile = ({
  onEditProfile,
  onDeleteProfile,
}: UserProfileProps): JSX.Element => {
  const session = useSession().data as SessionType;
  if (!session || !session.user) window.location.href = "/";
  const user: UserType = session!.user;

  return (
    <div className="UserProfile text-center" data-testid="UserProfile">
      <div className="UserProfile__avatar  relative mx-auto mt-12">
        <div className="absolute top-0 right-0 flex justify-between hidden w-10">
          <button onClick={() => onEditProfile(user)}>
            <span className="text-blue-007 hover:text-blue-005">
              <EditIconElement size="small" />
            </span>
          </button>
          <button onClick={() => onDeleteProfile(user)}>
            <span className="text-blue-007 hover:text-blue-005">
              <DeleteIconElement size="small" />
            </span>
          </button>
        </div>
      </div>

      <div
        className="UserProfile__info flex flex-col"
        data-testid="UserProfile__info"
      >
        <TextElement className="text-25 text-blue-005 mt-6 font-medium">{`${user?.firstname} ${user?.lastname}`}</TextElement>
        <TextElement className="mt-3 text-base">{user?.email}</TextElement>
      </div>
    </div>
  );
};

export default UserProfile;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
UserProfile.auth = true;
