import React from "react";
import { ButtonElement } from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import { Components } from "@t4g/types";
import { apiFetch } from "apps/dapp/services/config";

interface ServiceEditFormProps {
  service: Components.Admin.ServiceCataloguePage.Props["services"][number];
}

export const ServiceDeleteModal = ({
  service,
}: ServiceEditFormProps): JSX.Element => {
  const { setModal, setNotification } = useAppContext();
  return (
    <div className="flex flex-col items-start justify-center w-full p-8 bg-white  DeleteServiceModal ">
      <h2 className="w-full font-medium text-center text-25">
        Are you sure you want to delete this benefit?
      </h2>
      <div className="w-full mt-12">
        <div className="text-center text-blue-005 text-h3">{service.name}</div>

        <div className="flex items-center w-full">
          <div className="flex justify-end w-full mt-12 EditProgram__Controls">
            <div>
              <ButtonElement
                onClick={() => {
                  setModal(null);
                }}
                variant={{
                  hover: "",
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
                  setModal(null);
                  const deletePayload = {
                    id: service.id,
                  };
                  console.log("here service: ", service);
                  const response = await apiFetch(
                    `/services/${service.id}`,
                    {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(deletePayload),
                    }
                  );

                  if (!response.ok) {
                    console.error(
                      "Service deletion failed",
                      response.status,
                      await response.text()
                    );
                  }
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
                        value: "SERVICE_DELETED_BY_SERVICE_PROVIDER",
                      },
                    ],
                  });
                }}
                variant={{
                  disabled: "bg-white text-blue-008 border border-blue-003",
                  hover: "",
                  text: "text-base",
                  border: "",
                  height: "h-40 lg:h-48",
                  active: "border border-green-001 bg-green-001 text-white",
                }}
              >
                DELETE
              </ButtonElement>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
