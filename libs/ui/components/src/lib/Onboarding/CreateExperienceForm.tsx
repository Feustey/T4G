import React from "react";
import {
  ButtonElement,
  CheckboxElement,
  countries,
  industries,
  months,
  roles,
  SelectElement,
  TextElement,
  TextInputElement,
  AutocompleteElement,
  years,
} from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import { NewExperience } from "@t4g/service/data";
import { Button } from "apps/dapp/components";
import { apiFetch } from "apps/dapp/services/config";

interface EditExperienceFormProps {
  onNewExperience?: () => void;
}

export const CreateExperienceForm: React.FC<EditExperienceFormProps> =
  function ({ onNewExperience = () => undefined }) {
    const [title, setTitle] = React.useState<string>("");
    const [company, setCompany] = React.useState<string>("");
    const [country, setCountry] = React.useState<string>("");
    const [city, setCity] = React.useState<string>("");
    const [industry, setIndustry] = React.useState<string>("");
    const [role, setRole] = React.useState<string>("");
    const [startMonth, setStartMonth] = React.useState<number | undefined>(
      undefined
    );
    const [startYear, setStartYear] = React.useState<number | undefined>(
      undefined
    );
    const [endMonth, setEndMonth] = React.useState<number | undefined>(
      undefined
    );
    const [endYear, setEndYear] = React.useState<number | undefined>(undefined);
    const [isCurrent, setIsCurrent] = React.useState<boolean>(false);
    const [validEndDate, setValidEndDate] = React.useState<boolean>(true);
    const [isFutureDate, setIsFutureDate] = React.useState<boolean>(false);
    const [countryLabel, setCountryLabel] =
      React.useState<string>("Please select");

    const { setModal } = useAppContext();

    React.useEffect(() => {
      if (startMonth && startYear && endMonth && endYear && !isCurrent) {
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
        const response = await apiFetch(`/experiences`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newExperience),
        });
        if (!response.ok) {
          console.error(
            "Creating experience failed",
            response.status,
            await response.text()
          );
          return;
        }
        onNewExperience();
        setModal(null);
      } catch (error) {
        console.error("Creating experience failed", error);
      }
    }

    return (
      <div className="CreateExperienceForm px-4 lg:px-[116px] pt-20 pb-12">
        <h2 className="text-center">Add a professional experience</h2>
        <div className="flex gap-5 flex-wrap justify-center">
          <div className="mt-5">
            <TextInputElement
              value={title}
              label="Title"
              placeholder="e.g. Sale manager"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTitle(e.target.value);
              }}
            />
          </div>
          <div className="lg:mt-5">
            <TextInputElement
              value={company}
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
              value={city}
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
              label={countryLabel}
              name={"country"}
              options={countries}
              initialValue={{ label: "Please select", value: country }}
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
            value={industry}
            zIndex={23}
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
            value={role}
            zIndex={22}
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
                value={startMonth?.toString()}
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
                value={startYear?.toString()}
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
                  value={endMonth?.toString()}
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
                  value={endYear?.toString()}
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
        {startMonth &&
          endMonth &&
          startYear &&
          endYear &&
          !validEndDate &&
          !isCurrent && (
            <TextElement className="text-red-500">
              {isFutureDate === true
                ? `End date can't be in the future`
                : `End date can't be before start date`}
            </TextElement>
          )}

        <div className="EditProgram__Controls flex justify-center w-full mt-8">
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
    );
  };
