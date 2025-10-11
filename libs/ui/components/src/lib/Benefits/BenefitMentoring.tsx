import React from "react";
import { CoachingIconElement, TFGTokenIconElement } from "@t4g/ui/icons";
import { AvatarElement, LinkCardElement } from "@t4g/ui/elements";
import { MentorsDetail } from "./MentorsDetail";
import { useAppContext } from "@t4g/ui/providers";
import { Components } from "@t4g/types";
import useSwr from "swr";

export const BenefitMentoring: React.FC<Components.Benefits.Benefit.Props> =
  function ({
    service,
    variant,
    bookedServices,
    isLoading,
    onServiceBooked = () => {
      console.log("onServiceBooked ignored");
    },
  }: Components.Benefits.Benefit.Props) {
    const fetcher = (url: string) => fetch(url).then((res) => res.json());
    // const { data: preferredCategories } = useSwr(
    //   `/api/users/me/preferred-categories`,
    //   fetcher
    // ); //TODO error
    const { data: cv } = useSwr(
      `/api/users/${service.provider.id}/cv`,
      fetcher
    ); //TODO error

    const { setRightPanel } = useAppContext();
    if (!service) {
      return <p>loading</p>;
    }
    return (
      <li
        // key={i}
        onClick={() =>
          setRightPanel({
            component: (
              <MentorsDetail
                service={service}
                booked={bookedServices?.includes(
                  service?.blockchainId?.toString() || ""
                )}
                onServiceBooked={onServiceBooked}
              />
            ),
          })
        }
      >
        <LinkCardElement
          link={{ text: "View details", href: "#" }}
          components={{
            topLeft: (
              <div className="Label flex items-center bg-blue-001 text-blue-002 px-4 py-1.75 rounded-full text-10">
                <CoachingIconElement size="small" />
                <span className="ml-2 tracking-wider uppercase">
                  {service.category.name}
                </span>
              </div>
            ),
            bottomLeft: (
              <div className="text-orange-002 flex items-center text-base">
                <TFGTokenIconElement size={"small"} />
                <span className="ml-2">{`${service.price} ${service.unit}`}</span>
              </div>
            ),
            body: (
              <div className="flex pt-1 pb-6">
                <div className="min-w-[100px] h-[100px]">
                  <AvatarElement
                    size="fit"
                    user={{
                      firstname: service.name.split(" ")[0],
                      lastname: service.name.split(" ")[1],
                      email: "",
                    }}
                    fetchUrl={`/api/users/${service.provider.id}/avatar`}
                  />
                </div>

                <div className="ml-6">
                  <h3 className="text-h3 text-blue-005 mb-4 font-medium">
                    {service.name}
                  </h3>
                  {cv && (
                    <>
                      <p className="text-blue-007 my-1 text-base">
                        {cv.experiences.length > 0
                          ? cv.experiences[0].title
                          : ""}{" "}
                        {cv.experiences.length > 0 ? " at " : ""}{" "}
                        {cv.experiences.length > 0
                          ? cv.experiences[0].company
                          : ""}
                      </p>
                      <p className="text-blue-007 my-1 text-base">
                        {cv.experiences.length > 0
                          ? cv.experiences[0].country
                          : ""}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ),
          }}
        />
      </li>
    );
  };
