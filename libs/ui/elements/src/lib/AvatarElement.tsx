import { Elements } from "@t4g/types";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { SessionType } from "@shared/types";

export const AvatarElement: React.FC<Elements.AvatarElement.Props> = ({
  size,
  user: userProp,
  isHidden,
  url = "",
  fetchUrl = "",
}: Elements.AvatarElement.Props) => {
  const [_url, setUrl] = useState<string>(url);
  const session = useSession().data as SessionType;

  const _user = userProp ?? session!.user;

  useEffect(() => {
    url?.startsWith("data:") && setUrl(url);
  }, [url]);

  useEffect(() => {
    const fetchAvatarUrl = async () => {
      return fetch(fetchUrl).then((response) => {
        return response.text().then((url) => {
          return setUrl(url);
        });
      });
    };
    if (fetchUrl) {
      fetchAvatarUrl().catch(console.error);
    }
  }, [fetchUrl]);

  const getInitials = (
    firstname: string | undefined,
    lastname: string | undefined
  ) => {
    if (!firstname || !lastname || isHidden) {
      return `XX`;
    }
    return `${firstname.charAt(0).toLocaleUpperCase()}${lastname
      .charAt(0)
      .toLocaleUpperCase()}`;
  };

  return (
    <div
      className="AvatarElement w-full h-full flex justify-center items-center"
      data-testid="AvatarElement"
    >
      {_url?.startsWith("data:") ? (
        <span
          className={`inline-block ${
            size === "small" ? "w-10 h-10" : "w-25 h-25"
          }`}
        >
          <img
            src={_url}
            alt={`${_user.firstname} ${_user.lastname}`}
            className={`rounded-full inline w-full h-full object-cover`}
          />
        </span>
      ) : (
        <span
          className={`inline-flex ${
            size === "fit" ? "w-full h-full" : ""
          } items-center justify-center rounded-full bg-blue-001 mx-auto`}
        >
          <span
            className={`inline=block ${
              size === "small"
                ? "w-10 h-10 text-base lg:text-2xl"
                : size === "medium"
                ? "w-12 h-12 text-base lg:text-2xl"
                : size === "large"
                ? "w-20 h-20 text-4xl"
                : "w-full text-4xl"
            } flex items-center justify-center text-blue-002`}
          >
            {getInitials(
              _user.firstname as string | undefined,
              _user.lastname as string | undefined
            )}
          </span>
        </span>
      )}
    </div>
  );
};
