
import React, { useState } from "react";
import { useAppContext } from "@t4g/ui/providers";
import { Api, Entities } from "@t4g/types";
import { Button, Message } from "apps/dapp/components";
import useSwr from "swr";
import { useAuth } from '@/contexts/AuthContext';
import { SessionType, UserType } from "@shared/types";
import { capitalise } from "apps/dapp/services";
import { setUserAbout } from "apps/dapp/services";
import { useRouter } from "next/router";
import { SelectElement } from "@t4g/ui/elements";

interface EditUserAboutProps {
    userAbout: string;
}

export const EditUserAbout = ({
    userAbout,
}: EditUserAboutProps) => {
  const { setModal } = useAppContext();
  const [about, setAbout] = useState<string>(userAbout.split("/splitAbout/")[0]);
  const [emoji, setEmoji] = useState<string>(userAbout.split("/splitAbout/")[1]);

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
        <h2 className="text-center">About you</h2>
        <Message variant={'info'}>
          <p className="mb-0 u-text--bold">If one emoji were to define you, what would it be ?</p>
        </Message>
          <div className="mt-6 mb-8 z-40 flex-grow inline-block w-full">
            <SelectElement
              id="emoji"
              label="Please select"
              variant="theme"
              options={[
                {
                  value: "🍰",
                  label: "🍰",
                },
                {
                  value: "🍻",
                  label: "🍻",
                },
                {
                  value: "🎭",
                  label: "🎭",
                },
                {
                  value: "🎨",
                  label: "🎨",
                },
                {
                  value: "🎓",
                  label: "🎓",
                },
                {
                  value: "🏈",
                  label: "🏈",
                },
                {
                  value: "🎯",
                  label: "🎯",
                },
                {
                  value: "🎸",
                  label: "🎸",
                },
                {
                  value: "🎷",
                  label: "🎷",
                },
                {
                  value: "🎹",
                  label: "🎹",
                },
                {
                  value: "🔨",
                  label: "🔨",
                },
                {
                  value: "📱",
                  label: "📱",
                },
                {
                  value: "💻",
                  label: "💻",
                },
                {
                  value: "🐝",
                  label: "🐝",
                },
                {
                  value: "🐬",
                  label: "🐬",
                },
                {
                  value: "🦊",
                  label: "🦊",
                },
                {
                  value: "🐱",
                  label: "🐱",
                },
                {
                  value: "🐶",
                  label: "🐶",
                },
                {
                  value: "🦘",
                  label: "🦘",
                },
                {
                  value: "🐇",
                  label: "🐇",
                },
                {
                  value: "🐢",
                  label: "🐢",
                },
                {
                  value: "🦩",
                  label: "🦩",
                },
                {
                  value: "🎉",
                  label: "🎉",
                },
                      {
                  value: "🚀",
                  label: "🚀",
                },
              ]}
              value={emoji}
              handleChange={(value) => {
                setEmoji(value);
              }}
            />
          </div>
        <Message variant={'info'}>
          <p className="mb-0"> <span className="u-text--bold">Introduce yourself in a few lines...</span>  <br />(your background, your skills,
            your methodologies, or even your hobbies ! )</p>
        </Message>
        <div className="u-width--fill mt-6">
            <textarea
                maxLength={1000}
                id="about"
                className="form-control--textarea"
                placeholder="Tell us about yourself"
                defaultValue={about}
                onChange={(e) => {
                    setAbout(capitalise(e.target.value));
                }}
            ></textarea>
        </div>
        <div className="EditProgram__Controls flex justify-center w-full mt-8 gap-5">
        <Button
            className=""
            disabled={!emoji||!about}
            onClick={async () => {
              await setUserAbout(about.trim()+"/splitAbout/"+emoji);
              setModal(null);
              router.push("/dashboard");
            }}
            variant="primary"
            label={"Save"}
        ></Button>
        </div>
      </div>
      
    </>
  );
};
