
import React, { useState } from "react";
import { useAppContext } from "@t4g/ui/providers";
import { Button, Message } from "apps/dapp/components";
import useSwr from "swr";
import { signOut, useSession } from "next-auth/react";
import { SessionType, UserType } from "@shared/types";
import { useRouter } from "next/router";

interface DeleteUserProps {
}

export const DeleteUser = ({}: DeleteUserProps) => {
  const { setModal } = useAppContext();

  const session = useSession().data as SessionType;
  const user: UserType = session!.user;
  const fetcher = (url: string) =>
    fetch(url)
      .then((res) => res.json())
      .catch((e) => console.error(e));
  const { data: cv, mutate: mutateCv } = useSwr(
    `/api/users/${user.id}/cv`,
    fetcher
  ); //TODO error

  const router = useRouter();

  return (
    <>
      
      <div className="CreateExperienceForm px-4 lg:px-[116px] pt-20 pb-12">
        <h2 className="text-center">Delete account</h2>
        <div className="o-card max-w-xs">
          <p className="mb-0">Are you sure you want to delete your account?</p>
        </div>
          <div className="EditProgram__Controls flex justify-center w-full mt-8 gap-5">
            <div className="">
              <Button
                className=""
                onClick={async () => {
                  setModal(null);
                }}
                variant="secondary"
                label={"No"}
              ></Button>
            </div>
            <div className="">
              <Button
                className=""
                onClick={async () => {
                  await fetch("/api/users/me/delete");
                  await signOut({
                    callbackUrl: "/",
                  });
                }}
                variant="primary"
                label={"Yes, I delete"}
              ></Button>
            </div>
        </div>
      </div>
      
    </>
  );
};
