import React from "react";
import {
  ButtonElement,
  CheckboxElement,
  industries,
  countries,
  months,
  SelectElement,
  TextInputElement,
  TextElement,
  years,
  AutocompleteElement,
} from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import { Api, Entities } from "@t4g/types";
import { NewExperience } from "@t4g/service/data";
import { Button } from "apps/dapp/components";
import useSwr from "swr";
import { useAuth } from '@/contexts/AuthContext';
import { SessionType, UserType } from "@shared/types";
import { apiFetch, apiFetcher } from "apps/dapp/services/config";

interface EditExperienceFormProps {
  data: Api.Experience;
}

export const EditExperienceForm = ({
  data,
}: EditExperienceFormProps) => {
  const from = new Date(data.from);
  const to = new Date(data.to || "");
  const [title, setTitle] = React.useState<string>(data?.title || "");
  const [company, setCompany] = React.useState<string>(data?.company || "");
  const [country, setCountry] = React.useState<string>(data?.country || "");
  const [city, setCity] = React.useState<string>(data?.city || "");
   const [industry, setIndustry] = React.useState<string>(data?.industry || "");
  // const [role, setRole] = React.useState<string>(data?.role || "");
  const [startMonth, setStartMonth] = React.useState<number>(
    from.getMonth() + 1
  );
  const [startYear, setStartYear] = React.useState<number>(from.getFullYear());

  const [endMonth, setEndMonth] = React.useState<number>(to.getMonth() + 1);
  const [endYear, setEndYear] = React.useState<number>(to.getFullYear());
  const [isCurrent, setIsCurrent] = React.useState<boolean>(
    data?.isCurrent || false
  );
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  const [validEndDate, setValidEndDate] = React.useState<boolean>(true);
  const [isFutureDate, setIsFutureDate] = React.useState<boolean>(false);
  const [countryLabel, setCountryLabel] =
    React.useState<string>("Please select");

  const { setModal } = useAppContext();

  React.useEffect(() => {
    if (!isCurrent) {
      const startDate = new Date(startYear + "-" + startMonth + "-15");
      const endDate = new Date(endYear + "-" + endMonth + "-15");

      const startDateTimestamp = startDate.getTime();
      const endDateTimestamp = endDate.getTime();

      if (endDateTimestamp < startDateTimestamp) {
        setValidEndDate(false);
        setIsFutureDate(false);
      } else if (endDateTimestamp > new Date().getTime()) {
        setIsFutureDate(true);
        setValidEndDate(false);
      } else {
        setValidEndDate(true);
        setIsFutureDate(false);
      }
    }
  }, [startMonth, endMonth, startYear, endYear]);

  const session = useSession().data as SessionType;
  const user: UserType = session!.user;
  const { data: cv, mutate: mutateCv } = useSwr(
    `/users/${user.id}/cv`,
    apiFetcher
  ); //TODO error

  async function deleteExperience(id: string) {
    try {
      const response = await apiFetch(`/experiences/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        console.error(
          "Deleting experience failed",
          response.status,
          await response.text()
        );
        return;
      }
      await mutateCv();
      setModal(null);
    } catch (error) {
      console.error("Deleting experience failed", error);
    }
  }

  async function submit() {
    const from = new Date(startYear + "-" + startMonth + "-15");
    let to: Date;
    let newExperience: NewExperience;
    if (endYear) {
      to = new Date(endYear + "-" + endMonth + "-15");

      newExperience = {
        title,
        company,
        country,
        city,
        industry,
        from,
        to,
        isCurrent,
      } as NewExperience;
    } else {
      newExperience = {
        title,
        company,
        country,
        city,
        industry,
        from,
        isCurrent,
      } as NewExperience;
    }
    try {
      const response = await apiFetch(`/experiences/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExperience),
      });
      if (!response.ok) {
        console.error(
          "Updating experience failed",
          response.status,
          await response.text()
        );
        return;
      }
      data.title = title;
      data.company = company;
      data.country = country;
      data.city = city;
      data.from = from;
      data.to = to;
      data.isCurrent = isCurrent;
      setModal(null);
    } catch (error) {
      console.error("Updating experience failed", error);
    }
  }
  return (
    <>
    {isDeleting ?(
      <div className="CreateExperienceForm px-4 lg:px-[116px] pt-20 pb-12">
        <h2 className="text-center">Delete a professional experience</h2>
        <div className="o-card max-w-xs">
          <p className="mb-0">Are you sure you want to delete this professional experience ?</p>
        </div>
          <div className="EditProgram__Controls flex justify-center w-full mt-8 gap-5">
            <div className="">
              <Button
                className=""
                onClick={async () => {
                  setIsDeleting(false);
                }}
                variant="secondary"
                label={"No"}
              ></Button>
            </div>
            {!(data.id == cv.experiences[0].id) && (
              <div className="">
                <Button
                  className=""
                  onClick={async () => {
                    deleteExperience(data.id);
                  }}
                  variant="primary"
                  label={"Yes, I delete"}
                ></Button>
              </div>
            )}
        </div>
      </div>
      ):(
      <div className="CreateExperienceForm px-4 lg:px-[116px] pt-20 pb-12">
        <h2 className="text-center">Edit professional experience</h2>
        <div className="flex gap-5 flex-wrap justify-center">
          <div className="mt-5">
            <TextInputElement
              initialValue={data?.title}
              label="Title"
              placeholder="e.g. Sale manager"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
              }}
            />
          </div>
          <div className="lg:mt-5">
            <TextInputElement
              initialValue={data?.company}
              label="Company name"
              placeholder="e.g. Apple"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCompany(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="flex gap-5 flex-wrap justify-center">
          <div className="mt-5">
            <TextInputElement
              initialValue={data?.city}
              label="City"
              placeholder="e.g. Nantes"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCity(e.target.value);
              }}
            />
          </div>
          <div className="lg:mt-5">
            <div className="text-blue-005 mb-2">Country</div>
            <AutocompleteElement
              label={country}
              name={"country"}
              options={countries}
              initialValue={{ label: "", value: country }}
              onChange={(e: any) => {
                setCountry(e.value);
                setCountryLabel(e.value);
              }}
            />
          </div>
        </div>
         <div className="mt-5">
    <div className="text-blue-005 mb-2">Activity</div>
    <SelectElement
      value={data?.industry}
      zIndex={22}
      inline={false}
      label="Please select"
      variant="theme"
      options={industries}
      handleChange={(value) => {
        setIndustry(value);
      }}
    />
  </div> 
        {/* <div className="mt-5">
    <div className="text-blue-005 mb-2">Role</div>
    <SelectElement
      value={data?.role}
      zIndex={21}
      inline={false}
      label="Please select"
      variant="theme"
      options={roles}
      handleChange={(value) => {
        setRole(value);
      }}
    />
  </div> */}
        <div className="mt-5">
          <CheckboxElement
            checked={isCurrent}
            name="isCurrent"
            className="flex items-center"
            label="This is my current position"
            onChange={(e) => {
              setIsCurrent(!isCurrent);
            }}
          />
        </div>

        <div className="mt-5">
          <div className="text-blue-005">Start date</div>
          <div className="flex gap-5 flex-wrap justify-center">
            <div className="w-full mt-2">
              <SelectElement
                zIndex={21}
                value={startMonth.toString()}
                listHeight={150}
                inline={false}
                label="Month"
                variant="theme"
                options={months}
                handleChange={(value) => {
                  setStartMonth(parseInt(value));
                }}
              />
            </div>
            <div className="w-full">
              <SelectElement
                id="year"
                inline={false}
                label="Year"
                variant="theme"
                options={years}
                value={startYear.toString()}
                handleChange={(value) => {
                  setStartYear(parseInt(value));
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-blue-005">{!isCurrent && "End date"}</div>
          {!isCurrent ? (
            <div className="flex gap-5 flex-wrap justify-center">
              <div className="w-full mt-2">
                <SelectElement
                  zIndex={19}
                  value={endMonth.toString()}
                  listHeight={150}
                  inline={false}
                  label="Month"
                  variant="theme"
                  options={months}
                  handleChange={(value) => {
                    setEndMonth(parseInt(value));
                  }}
                />
              </div>
              <div className="z-10 w-full">
                <SelectElement
                  id="year"
                  inline={false}
                  label="Year"
                  variant="theme"
                  options={years}
                  value={endYear.toString()}
                  handleChange={(value) => {
                    setEndYear(parseInt(value));
                  }}
                />
              </div>
            </div>
          ) : (
            ""
          )}
        </div>

        {!validEndDate && !isCurrent && (
          <TextElement className="text-red-500">
            {isFutureDate === true
              ? `End date can't be in the future`
              : `End date can't be before start date`}
          </TextElement>
        )}

        <div className="EditProgram__Controls flex justify-center w-full mt-8 gap-5">
          {!(data.id == cv.experiences[0].id) && (
            <div className="">
              <Button
                className=""
                onClick={async () => {
                  setIsDeleting(true);
                }}
                variant="secondary"
                label={"Delete"}
              ></Button>
            </div>
          )}

          <div className="">
            <Button
              disabled={
                ![
                  title,
                  company,
                  country,
                  city,
                  industry,
                  startMonth,
                  startYear,
                  (endMonth && endYear && validEndDate && !isFutureDate) ||
                    isCurrent,
                ].every((field) => field)
              }
              className=""
              onClick={async () => {
                submit();
              }}
              variant="primary"
              label={"Save"}
            ></Button>
          </div>
        </div>
      </div>
      )}
    </>
  );
};
