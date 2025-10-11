import React, { useState } from "react";
import { EditIconElement } from "@t4g/ui/icons";
import { CreateExperienceForm } from "../Onboarding/CreateExperienceForm";
import { EditExperienceForm } from "../Onboarding/EditExperienceForm";
import { useAppContext } from "@t4g/ui/providers";
import { Api } from "@t4g/types";
import { EditProgram } from "./EditProgram";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import useSwr from "swr";
import Resizer from "react-image-file-resizer";
import { SessionType, UserType } from "@shared/types";
import { Avatar, Button, Icons, Spinner } from "apps/dapp/components";
import { EditUserAbout } from "./EditUserAbout";
import { resizeFile } from "apps/dapp/services";
import { LangType } from "apps/dapp/types";
import { DeleteUser } from "./DeleteUser";
import { apiFetch, apiFetcher } from "apps/dapp/services/config";

export interface IEditProfileInfo {
  lang: LangType;
}

export const EditProfileInfo = ({ lang }: IEditProfileInfo) => {
  const session = useSession().data as SessionType;
  if (!session || !session.user) window.location.href = "/";
  const user: UserType = session!.user;
  const fileRef = React.useRef<HTMLInputElement>(null);

  const { data: cv, mutate: mutateCv } = useSwr(
    `/users/${user.id}/cv`,
    apiFetcher
  ); //TODO error

  const { data: about } = useSwr(`/users/me/about`, apiFetcher); //TODO error

  const { setModal } = useAppContext();

  const [isAvatarLoading, setIsAvatarLoading] = useState<boolean>(false);

  const { data: avatarImage, mutate: refreshAvatar } = useSwr(
    `/users/${user.id}/avatar`,
    async (url: string) => {
      const response = await apiFetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch avatar: ${response.status} ${await response.text()}`
        );
      }
      return await response.text();
    }
  );

  async function updateAvatar(image: string | undefined) {
    try {
      const response = await apiFetch(`/users/${user.id}/avatar`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: image,
      });
      if (!response.ok) {
        console.error(
          "Updating avatar failed",
          response.status,
          await response.text()
        );
        return;
      }
      await refreshAvatar();
    } catch (error) {
      console.error("Updating avatar failed", error);
    }
  }
  if (!cv || !user) {
    return (
      <>
        <Spinner lang={lang} spinnerText={"Loading..."} size="lg" />
      </>
    );
  } else
    return (
      <>
        <div className="flex flex-wrap">
          <div className="w-full lg:w-36 lg:h-36 lg:mr-12 mb-4">
            <div
              style={{ cursor: "pointer" }}
              className=" hover:opacity-80 relative flex flex-col items-center justify-center w-full h-full text-base "
            >
              <Avatar
                id={"avatar"}
                isEditable={true}
                avatar={avatarImage as string}
                firstname={user.firstname}
                lastname={user.lastname}
                isDisplayingName={false}
                isLoading={isAvatarLoading}
                size="lg"
                handleFileUpload={async (file: File) => {
                  setIsAvatarLoading(true);
                  setIsAvatarLoading(false);
                  updateAvatar((await resizeFile(file)) as string);
                }}
              />
            </div>
          </div>
          <section className="c-student-benefit-page__infos">
            {about ? (
              <div>
                <div className="flex justify-between mb-4 items-center w-full lg:w-1/2 lg:pr-28">
                  <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin--none">
                    {" "}
                    {Icons.chat} About you
                  </h2>
                  <div
                    className="cursor-pointer"
                    onClick={async (e) => {
                      e.preventDefault();
                      setModal({
                        component: <EditUserAbout userAbout={about} />,
                      });
                    }}
                  >
                    <span className="text-blue-008 hover:text-blue-005">
                      {Icons.edit}
                    </span>
                  </div>
                </div>
                {about.split("/splitAbout/")[1] ? (
                  <p className="text-25">{about.split("/splitAbout/")[1]}</p>
                ) : (
                  <p
                    className="cursor-pointer"
                    onClick={async (e) => {
                      e.preventDefault();
                      setModal({
                        component: <EditUserAbout userAbout={about} />,
                      });
                    }}
                  >
                    🌟 <span className="u-text--bold">Edit</span> to define your
                    Emoji 🔥
                  </p>
                )}
                <p>{about.split("/splitAbout/")[0]}</p>
              </div>
            ) : (
              <div className="o-card">
                <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin--none">
                  {" "}
                  {Icons.chat} About you
                </h2>
                <p className="u-text--bold u-margin--none">
                  Introduce yourself in a few lines and choose the emoji that
                  best defines you !
                </p>
                <Button
                  className="w-full"
                  onClick={async (e) => {
                    e.preventDefault();
                    setModal({
                      component: <EditUserAbout userAbout={about} />,
                    });
                  }}
                  variant="primary"
                  label={"Introduce yourself"}
                ></Button>
              </div>
            )}

            <div className="u-d--flex flex-wrap">
              {user.role === "ALUMNI" ? (
                <div className="w-full lg:w-1/2 lg:pr-28">
                  <div className="EditProfile__Experience w-full">
                    <div className="flex justify-between mb-4 items-center">
                      <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin--none">
                        {" "}
                        {Icons.briefcase} Professional Experience
                      </h2>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          setModal({
                            component: (
                              <CreateExperienceForm
                                onNewExperience={() => {
                                  mutateCv();
                                }}
                              />
                            ),
                          });
                        }}
                      >
                        <span className="text-blue-008 hover:text-blue-005">
                          {Icons["add"]}
                        </span>
                      </div>
                    </div>

                    <ul role="list">
                      {(cv.experiences as Api.Experience[]).map(
                        (experience) => (
                          <li key={experience.id}>
                            <div className="flex">
                              <div className="w-full">
                                <div className="u-text--bold flex justify-between text-base font-medium">
                                  <div>
                                    <span></span>
                                    <span className="u-text--bold font-normal">
                                      {experience?.title
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        experience?.title?.slice(1)}
                                      <br />
                                      {experience?.company
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        experience?.company?.slice(1)}
                                    </span>
                                  </div>

                                  <span
                                    className="text-blue-008 hover:text-blue-005"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setModal({
                                        component: (
                                          <EditExperienceForm
                                            data={experience}
                                          />
                                        ),
                                      });
                                    }}
                                  >
                                    {Icons.edit}
                                  </span>
                                </div>
                                <p className="text-base">
                                  <span>
                                    {
                                      new Date(experience?.from)
                                        .toDateString()
                                        .split(" ")[1]
                                    }{" "}
                                    {
                                      new Date(experience?.from)
                                        .toDateString()
                                        .split(" ")[3]
                                    }
                                  </span>{" "}
                                  {" - "}{" "}
                                  <span>
                                    {experience?.isCurrent ? (
                                      "Now"
                                    ) : experience?.to ? (
                                      <>
                                        {
                                          new Date(experience?.to)
                                            .toDateString()
                                            .split(" ")[1]
                                        }{" "}
                                        {
                                          new Date(experience?.to)
                                            .toDateString()
                                            .split(" ")[3]
                                        }
                                      </>
                                    ) : (
                                      "Now"
                                    )}
                                  </span>
                                  <br />
                                  <span>
                                    {experience?.city?.charAt(0).toUpperCase() +
                                      experience?.city?.slice(1)}{" "}
                                    - {experience?.country}
                                  </span>
                                  <br />
                                  {experience?.industry ? (
                                    <span className="text-blue-007 text-base">
                                      {experience?.industry
                                        ?.charAt(0)
                                        .toUpperCase() +
                                        experience?.industry?.slice(1)}
                                    </span>
                                  ) : (
                                    <span
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setModal({
                                          component: (
                                            <EditExperienceForm
                                              data={experience}
                                            />
                                          ),
                                        });
                                      }}
                                    >
                                      🌟{" "}
                                      <span className="u-text--bold">Edit</span>{" "}
                                      to define Activity !
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                ""
              )}

              <div className="w-full lg:w-1/2 lg:pr-28">
                <h2 className="subtitle heading-4 u-d--flex u-align-items-center u-gap--s u-margin-b--m">
                  {" "}
                  {Icons.academicCap} Formations
                </h2>
                <div className="flex justify-between">
                  <div>
                    <p className="u-margin--none u-text--bold">
                      {cv.program} <br /> {cv.topic}
                    </p>
                    {cv.school ? (
                      <p className="u-margin--none">{cv.school}</p>
                    ) : (
                      <span
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          setModal({
                            component: (
                              <EditProgram role={user.role} data={cv} />
                            ),
                          });
                        }}
                      >
                        🌟 <span className="u-text--bold">Edit</span> to define
                        School ! 
                      </span>
                    )}
                    <p className="u-margin--none">{cv.graduatedYear}</p>
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      setModal({
                        component: <EditProgram role={user.role} data={cv} />,
                      })
                    }
                  >
                    <span className="text-blue-008 hover:text-blue-005">
                      {Icons.edit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </>
    );
};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
EditProfileInfo.auth = true;
