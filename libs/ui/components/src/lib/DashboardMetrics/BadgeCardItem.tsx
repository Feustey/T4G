import { CommunityBadgeIconElement } from "@t4g/ui/icons";
import React from "react";

export type BadgeCardItemProps = Record<string, unknown>;

export const BadgeCardItem = () => {
  return (
    <div className="BadgeCardItem py-3 mb-6 text-base text-blue-005 bg-white border-2 border-transparent  ">
      <div className="flex">
        <div className="ml-3">
          <CommunityBadgeIconElement size="medium" />
        </div>

        <div className="flex flex-col justify-around items-start ml-4">
          <p className="text-base text-blue-007">YOU'VE JUST RECEIVED</p>
          <h4 className="font-medium text-h4 text-blue-005">
            The Community All Star badge!
          </h4>
          <p className="text-base text-blue-007">
            Awarded to the top 10 active members.
          </p>
        </div>
      </div>
    </div>
  );
};
