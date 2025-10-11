import React from "react";
import {
  ButtonElement,
  SelectElement,
  TextInputElement,
  MarkdownInputElement,
} from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import { DeleteIconElement, EditIconElement } from "@t4g/ui/icons";
import { Api } from "@t4g/types";
import { addUserNotificationsState } from "apps/dapp/store/slices";
import { useAppDispatch } from "apps/dapp/hooks";
import { apiFetch } from "apps/dapp/services/config";

interface ServiceEditFormProps {
  service: Api.Service;
  serviceCategories: Api.Category[];
}

export const ServiceEditForm = ({
  service,
  serviceCategories,
}: ServiceEditFormProps) => {
  const [category, setCategory] = React.useState<string>(service.category.name);
  const [name, setName] = React.useState<string>(service.name);
  const [provider, setProvider] = React.useState<string>(service.provider.id);
  const [summary, setSummary] = React.useState<string>(service.summary);
  const [description, setDescription] = React.useState<string>(
    service.description
  );
  const [price, setPrice] = React.useState<number>(service.price);
  const [unit, setUnit] = React.useState<string>(service.unit);
  const [totalSupply, setTotalSupply] = React.useState<number>(service.supply);

  const [selectedFileBase64, setSelectedFileBase64] = React.useState<string>(
    service.avatar
  );
  const [isFilePicked, setIsFilePicked] = React.useState<boolean>(false);

  const { setRightPanel, setNotification } = useAppContext();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  return (
    <div className="ServiceEditForm px-8 pb-12">
      <h2 className="text-25 text-blue-005 font-medium">
        Edit an alumni benefit
      </h2>
      <div className="mt-12">
        <div className="text-blue-005 mb-2">Select category</div>
        <SelectElement
          value={category}
          zIndex={20}
          inline={false}
          label="Please select"
          variant="theme"
          options={serviceCategories.map((category) => ({
            value: category.name,
            label: category.name,
          }))}
          handleChange={(value) => {
            setCategory(
              serviceCategories.find((category) => category.name === value)
                ?.name || category
            );
          }}
        />
      </div>
      <div className="mt-7">
        <TextInputElement
          value={name}
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
                    setSelectedFileBase64(e.target?.result as string);
                    setIsFilePicked(true);
                  };
                }
              }}
            />
            {!isFilePicked && selectedFileBase64 === "" ? (
              <>
                <span className="">+</span> <span className="">Add a logo</span>
              </>
            ) : !isFilePicked && service.avatar !== "" ? (
              <img
                className="rounded-full"
                src={service.avatar}
                alt="avatar"
                width="100px"
                height="100px"
              />
            ) : (
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
          value={description}
          onChange={(v: string) => {
            setDescription(v);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="mt-7">
          <TextInputElement
            label="Tokens"
            value={price.toString()}
            placeholder="e.g. 5"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPrice(Number(e.target.value));
            }}
          />
        </div>
        <div className="mt-7">
          <TextInputElement
            label="Unit"
            value={unit}
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
          value={totalSupply.toString()}
          placeholder="e.g. 100"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTotalSupply(Number(e.target.value));
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
            onClick={async () => {
              const payload = {
                id: service.id,
                serviceCategory: category,
                name,
                provider,
                summary,
                description,
                price,
                unit,
                totalSupply,
                avatar: isFilePicked ? selectedFileBase64 : service.avatar,
              };
              const response = await apiFetch(`/services/${service.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                console.error(
                  "Service update failed",
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
                    value: "SERVICE_EDITED_BY_SERVICE_PROVIDER",
                  },
                ],
              });
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
            SAVE
          </ButtonElement>
        </div>
      </div>
    </div>
  );
};
