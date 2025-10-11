import React, { useEffect } from "react";
import {
  ButtonElement,
  SelectElement,
  TextInputElement,
  MarkdownInputElement,
} from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import { DeleteIconElement, EditIconElement } from "@t4g/ui/icons";
import { Api } from "@t4g/types";
import { useAppDispatch } from "apps/dapp/hooks";
import { addUserNotificationsState } from "apps/dapp/store/slices";
import { apiFetch } from "apps/dapp/services/config";

interface ServiceCreateFormProps {
  serviceCategories: Api.Category[];
  provider: string;
  onServiceCreated: () => void;
}

export const ServiceCreateForm = ({
  serviceCategories,
  provider,
  onServiceCreated,
}: ServiceCreateFormProps): JSX.Element => {
  const [category, setCategory] = React.useState<Api.Category | null>(null);
  const [name, setName] = React.useState<string>("");
  const [summary, setSummary] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>("");
  const [unit, setUnit] = React.useState<string>("");
  const [totalSupply, setTotalSupply] = React.useState<string>("");

  const [selectedFileBase64, setSelectedFileBase64] = React.useState<any>(null);
  const [isFilePicked, setIsFilePicked] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const dispatch = useAppDispatch();

  const { setRightPanel, setNotification } = useAppContext();
  const fileRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="ServiceCreateForm px-8 pb-12">
      <h2 className="text-25 text-blue-005 font-medium">
        Add an alumni benefit
      </h2>
      <div className="mt-12">
        <div className="text-blue-005 mb-2">Select category</div>
        <SelectElement
          zIndex={20}
          inline={false}
          label="Please select"
          variant="theme"
          options={serviceCategories?.map((category) => ({
            label: category.name,
            value: category.name,
          }))}
          handleChange={(value) => {
            const selected = serviceCategories.find(
              (category: Api.Category) => category.name === value
            );
            if (selected) setCategory(selected);
            else console.warn("no category for name", value);
          }}
        />
      </div>
      <div className="mt-7">
        <TextInputElement
          label="Benefit name"
          placeholder="e.g. Scale your startup"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value);
          }}
        />
      </div>
      <div className="mt-7">
        <div className="flex justify-between">
          <label htmlFor="program" className="mr-2">
            Provider logo
          </label>

          {isFilePicked && (
            <div className="flex justify-between w-10 cursor-pointer">
              <span
                className="text-blue-007 hover:text-blue-005"
                onClick={() => {
                  fileRef.current?.click();
                }}
              >
                <EditIconElement size="small" />
              </span>
              <span
                className="text-blue-007 hover:text-blue-005"
                onClick={() => {
                  setSelectedFileBase64("");
                  setIsFilePicked(false);
                }}
              >
                <DeleteIconElement size="small" />
              </span>
            </div>
          )}
        </div>
        <div className="w-25 h-25 mt-6">
          <div
            style={{ cursor: "pointer" }}
            className="border-blue-001 hover:border-1 hover:border-blue-011 text-blue-008 hover:text-blue-002 relative flex flex-col items-center justify-center inline-block w-full h-full overflow-hidden text-base border border-dashed rounded-full"
          >
            <input
              ref={fileRef}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                opacity: 0,
                cursor: "pointer",
              }}
              type="file"
              name="file"
              onChange={(e: any) => {
                const reader = new FileReader();
                if (e.target.files[0]) {
                  reader.readAsDataURL(e.target.files[0]);
                  reader.onload = (e) => {
                    setSelectedFileBase64(e.target?.result);
                    setIsFilePicked(true);
                  };
                }
              }}
            />
            {!isFilePicked && (
              <>
                <span className="">+</span> <span className="">Add a logo</span>
              </>
            )}
            {isFilePicked && (
              <img
                className="rounded-full"
                src={selectedFileBase64}
                alt="avatar"
                width="100px"
                height="100px"
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <label htmlFor="shortDesc">Sort description (max 160 caracters)</label>
        <textarea
          name="shortDesc"
          id="shortDesc"
          value={summary}
          className="form-control--textarea"
          onChange={(e) => {
            if (e.target.value.split("").length > 160) {
              dispatch(
                addUserNotificationsState({
                  content: `Short description is more than 160 characters (${
                    e.target.value.split("").length
                  } characters)`,
                  status: "error",
                  id: Math.random(),
                })
              );
              setSummary(e.target.value.slice(0, 160));
            } else {
              setSummary(e.target.value);
            }
          }}
        ></textarea>
      </div>
      <div className="mt-7">
        <MarkdownInputElement
          label="Long description"
          name={"text"}
          onChange={(v: string) => {
            setDescription(v);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="mt-7">
          <TextInputElement
            label="Tokens"
            placeholder="e.g. 5"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPrice(e.target.value);
            }}
          />
        </div>
        <div className="mt-7">
          <TextInputElement
            label="Unit"
            placeholder="e.g. 1 hour"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUnit(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mt-7">
        <TextInputElement
          label="How many times can this benefit be redeemed"
          placeholder="e.g. 100"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTotalSupply(e.target.value);
          }}
        />
      </div>

      <div className="flex justify-end w-full mt-12">
        <div>
          <ButtonElement
            onClick={() => {
              setRightPanel(null);
            }}
            variant={{
              hover: "hover:drop-shadow-md",
              text: "font-semibold text-base text-blue-008",
              border: "border border-blue-003",
              height: "h-40 lg:h-48",
              active: "bg-white",
            }}
          >
            CANCEL
          </ButtonElement>
        </div>
        <div className="ml-4">
          <ButtonElement
            disabled={
              ![category?.id, name, summary, price, unit, totalSupply].every(
                (value) => value
              )
            }
            onClick={async () => {
              setSubmitting(true);
              const servicePayload = {
                kind: "Service",
                name,
                summary,
                audience: "ALUMNI",
                description,
                price,
                unit,
                totalSupply,
                rating: [],
                suggestion: true,
                circulatingSupply: totalSupply,
                avatar: selectedFileBase64,
                category: category?.id,
                serviceProvider: provider,
                annotations: [],
              };
              const response = await apiFetch(`/services`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(servicePayload),
              });

              if (!response.ok) {
                console.error(
                  "Service creation failed",
                  response.status,
                  await response.text()
                );
              }

              setRightPanel(null);
              setNotification({
                title: "Transaction",
                type: "spin",
                messageList: [
                  {
                    label: "Hash",
                    value:
                      "0xb5c8bd9430b6cc87a0e2fe110ece6bf527fa4f170a4bc8cd032f768fc5219838",
                  },
                  {
                    label: "Type",
                    value: "SERVICE_CREATED_BY_SERVICE_PROVIDER",
                  },
                ],
              });
              onServiceCreated();
            }}
            variant={{
              hover: "hover:drop-shadow-md",
              text: "font-semibold text-base",
              border: "border border-blue-003",
              height: "h-40 lg:h-48",
              active: "bg-green-001 text-white",
              disabled: "bg-white text-blue-008",
            }}
          >
            {submitting ? (
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
                role="status"
              >
                <span className="visually-hidden"></span>
              </div>
            ) : (
              "SAVE"
            )}
          </ButtonElement>
        </div>
      </div>
    </div>
  );
};
