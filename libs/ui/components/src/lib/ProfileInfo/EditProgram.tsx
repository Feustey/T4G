import React from "react";
import {
  ButtonElement,
  TextInputElement,
  SelectElement,
  years,
  yearsStudent,
  programTopics,
} from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import { Api } from "@t4g/types";
import { UserRoleType } from "@shared/types";
import { LocaleType, UserCVType } from "apps/dapp/types";
import { Button } from "apps/dapp/components";
import { apiFetch } from "apps/dapp/services/config";

interface EditProgramProps {
  role: UserRoleType;
  data: Api.CV;
}

export const EditProgram = ({
  data,
  role,
}: EditProgramProps) => {
  const { setModal } = useAppContext();

  const [topic, setTopic] = React.useState<UserCVType["topic"]>(data.topic);
  const [school, setSchool] = React.useState<UserCVType["school"]>(data.school);
  const [program, setProgram] = React.useState<UserCVType["program"]>(
    data.program
  );
  const [year, setYear] = React.useState<UserCVType["graduatedYear"]>(
    data.graduatedYear.toString()
  );

  async function submit() {
    try {
      const response = await apiFetch(`/users/me/cv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, program, graduatedYear: year, school }),
      });
      if (!response.ok) {
        console.error(
          "Updating CV failed",
          response.status,
          await response.text()
        );
        return;
      }
      data.topic = topic;
      data.program = program;
      data.graduatedYear = Number(year);
      data.school = school;
      setModal(null);
    } catch (error) {
      console.error("Updating CV failed", error);
    }
  }
  return (
    <div className="EditProgram px-4 lg:px-[116px] pt-20 pb-12">
      <h2 className="text-center">Edit an t4g program</h2>
      <div className="mt-4 flex gap-4 w-full flex-wrap justify-center">
        <div className="flex flex-col">
          <label htmlFor="program" className="inline-block mb-2">
            Program
          </label>
          <div className="mt-0 z-40 flex-grow inline-block ">
            <SelectElement
              id="program"
              label="Please select"
              variant="theme"
              options={[
                {
                  value: "Grande Ecole",
                  label: "Grande Ecole",
                },
                {
                  value: "MBA",
                  label: "MBA",
                },
                {
                  value: "Master spécialisé",
                  label: "Master spécialisé",
                },
                {
                  value: "MSC",
                  label: "MSC",
                },
                {
                  value: "Bachelor & BBA",
                  label: "Bachelor & BBA",
                },
                {
                  value: "SciencesCom",
                  label: "SciencesCom",
                },
                {
                  value: "Executive Education / Formation Continue",
                  label: "Executive Education / Formation Continue",
                },
                {
                  value: "DBA",
                  label: "DBA",
                },
                   {
                  value: "Ingenior",
                  label: "Ingenior",
                },
                   {
                  value: "Architect",
                  label: "Architect",
                },
                   {
                  value: "Other",
                  label: "Other",
                },
              ]}
              value={program}
              handleChange={(value) => {
                setProgram(value);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <label htmlFor="topic" className="mt-0 mb-2 ">
            Topic
          </label>
          <div className="flex-grow inline-block">
            <SelectElement
              id="topic"
              inline
              label="Please select"
              variant="theme"
              options={programTopics}
              value={topic}
              handleChange={(value) => {
                setTopic(value);
              }}
            />
          </div>
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="topic" className="mt-0 mb-2 ">
            School
          </label>
          <div className="flex-grow inline-block">
            <SelectElement
              id="school"
              inline
              label="Please select"
              variant="theme"
              options={[
                {
                  value: "t4g",
                  label: "t4g",
                },
                {
                  value: "Centrale Nantes",
                  label: "Centrale Nantes",
                },
                {
                  value: "Ensa",
                  label: "Ensa",
                },
                {
                  value: "Other",
                  label: "Other",
                },
              ]}
              value={school}
              handleChange={(value) => {
                setSchool(value);
              }}
            />
          </div>
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="year" className="mb-0  mr-2">
            {role === "ALUMNI" ? "Obtainded in" : "Started in"}
          </label>

          {role === "STUDENT" && (
            <div className="z-30 mt-2">
              <SelectElement
                id="year"
                inline
                label="Please select"
                variant="theme"
                options={yearsStudent}
                value={year.toString()}
                handleChange={(value) => {
                  setYear(value);
                }}
              />
            </div>
          )}
          {role === "ALUMNI" && (
            <div className="z-30 mt-2">
              <SelectElement
                id="year"
                inline
                label="Please select"
                variant="theme"
                options={years}
                value={year.toString()}
                handleChange={(value) => {
                  setYear(value);
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="EditProgram__Controls flex justify-center w-full mt-8">
        <div className="">
          <Button
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
