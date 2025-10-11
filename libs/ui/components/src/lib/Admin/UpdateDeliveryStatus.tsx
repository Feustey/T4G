import React from "react";
import { ButtonElement, DividerElement } from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import { apiFetch } from "apps/dapp/services/config";
export interface UpdateRedeemStatusProps {
  transaction: any;
  onUpdate: (dealId:number|undefined) => any;
}

export const UpdateDeliveryStatus = ({ transaction, onUpdate }: UpdateRedeemStatusProps): JSX.Element => {
    const { setRightPanel, setUpdateDisabled } =
      useAppContext();
    const [isConsumed, setIsConsumed] = React.useState<boolean>(false);
    const [isCanceled, setIsCanceled] = React.useState<boolean>(false);

    return (
      <div className="BlockchainReceipt px-8">
        <div className="CardSelectElement__Section w-full">
          <h2>Update delivery status</h2>

          <div className="flex flex-col mt-12 text-base">
            <div className="BlockchainReceipt__Timestamp flex">
              <div className="min-w-[200px] grow-0 text-blue-007">
                Timestamp:
              </div>
              <div className="text-blue-005">
                {new Date(transaction?.ts).toLocaleDateString()}
              </div>
            </div>
            <DividerElement bleeding spacing="py-4" />
            <div className="BlockchainReceipt__TxType flex">
              <div className="min-w-[200px] grow-0 text-blue-007">Alumni:</div>
              <div className="text-blue-005">
                {transaction?.serviceBuyerInfo?.firstname}{" "}
                {transaction?.serviceBuyerInfo?.lastname?.toUpperCase()}
              </div>
            </div>
            <DividerElement bleeding spacing="py-4" />
            <div className="BlockchainReceipt__TxType flex">
              <div className="min-w-[200px] grow-0 text-blue-007">
                Provider:
              </div>
              <div className="text-blue-005">
                {transaction?.serviceProviderInfo?.firstname}{" "}
                {transaction?.serviceProviderInfo?.lastname?.toUpperCase()}
              </div>
            </div>
            <DividerElement bleeding spacing="py-4" />
            <div className="BlockchainReceipt__TxType flex">
              <div className="min-w-[200px] grow-0 text-blue-007">
                Benefit category:
              </div>
              <div className="text-blue-005">
                {transaction?.serviceInfo?.category}
              </div>
            </div>
            <DividerElement bleeding spacing="py-4" />
            <div className="BlockchainReceipt__TxType flex">
              <div className="min-w-[200px] grow-0 text-blue-007">
                Benefit name:
              </div>
              <div className="text-blue-005">
                {transaction?.serviceInfo?.name}
              </div>
            </div>
            <DividerElement bleeding spacing="py-4" />
            <div className="grid grid-cols-2 gap-8 mt-12">
              <CardElement
                id={transaction?.dealId?.toString()}
                title="I want to confirm the service delivery"
                isSelected={isConsumed}
                onClick={(id: string) => {
                  setIsConsumed(true);
                  setIsCanceled(false);
                }}
              />
              <CardElement
                id={transaction?.dealId?.toString()}
                title="I want to cancel the service delivery"
                isSelected={isCanceled}
                onClick={(id: string) => {
                  setIsCanceled(true);
                  setIsConsumed(false);
                }}
              />
            </div>
          </div>
          <div className="BlockchainReceipt__Polygon flex justify-end mt-12">
            <div className="BlockchainReceipt__Polygon flex">
              <ButtonElement
                onClick={() => {
                  setRightPanel(null);
                }}
                variant={{
                  hover: "hover:drop-shadow-md",
                  text: "text-white",
                  border: "bg-green-001",
                  height: "h-40 lg:h-48",
                }}
              >
                CANCEL
              </ButtonElement>
              <ButtonElement
                onClick={async () => {
                  setUpdateDisabled(true);
                  setRightPanel(null);
                  if (isCanceled) {
                    try {
                      const response = await apiFetch(
                        `/services/${transaction?.dealId}/cancel-as-provider/${transaction?.to}`
                      );
                      if (!response.ok) {
                        console.error(
                          "Cancel delivery failed",
                          response.status,
                          await response.text()
                        );
                      } else {
                        await response.json();
                        onUpdate(transaction?.dealId);
                      }
                    } catch (error) {
                      console.error("Cancel delivery failed", error);
                    } finally {
                      setUpdateDisabled(false);
                    }

                    // sendNotification({
                    //   payload: {
                    //     to: transaction.to.email || process.env['EMAIL_ADMIN'],
                    //     name: transaction.service.name,
                    //     serviceCategory: {
                    //       name: transaction.service.serviceCategory.name,
                    //     },
                    //     tokens: transaction.txAmount,
                    //   },
                    //   type: 'SERVICE_DELIVERY_CANCELED_BY_SERVICE_PROVIDER',
                    // });
                    //
                    // setNotification({
                    //   title: "Transaction",
                    //   type: "spin",
                    //   messageList: [
                    //     {
                    //       label: "Hash",
                    //       value:
                    //         "0xb5c8bd9430b6cc87a0e2fe110ece6bf527fa4f170a4bc8cd032f768fc5219838",
                    //     },
                    //     {
                    //       label: "Type",
                    //       value:
                    //         "SERVICE_DELIVERY_CANCELED_BY_SERVICE_PROVIDER",
                    //     },
                    //   ],
                    // });
                  } else {
                    console.log(
                      "POST Update Identity with consumed Services. Release funds from escrow contract to Service Provider",
                      {
                        user: {
                          ...transaction?.from,
                          consumedServices: [transaction?.serviceId],
                        },
                      }
                    );
                    try {
                      const response = await apiFetch(
                        `/services/${transaction?.dealId}/validate-as-provider/${transaction?.to}`
                      );
                      if (!response.ok) {
                        console.error(
                          "Validate delivery failed",
                          response.status,
                          await response.text()
                        );
                      } else {
                        await response.json();
                        onUpdate(transaction?.dealId);
                      }
                    } catch (error) {
                      console.error("Validate delivery failed", error);
                    } finally {
                      setUpdateDisabled(false);
                    }

                    // const res = await fetch(
                    //   `/api/services/${transaction?.dealId}/validate-as-provider/${transaction?.to}`
                    // );
                    // const cancelResponse = await res.json();
                    //
                    // setNotification({
                    //   title: "Transaction",
                    //   type: "spin",
                    //   messageList: [
                    //     {
                    //       label: "Hash",
                    //       value:
                    //         "0xb5c8bd9430b6cc87a0e2fe110ece6bf527fa4f170a4bc8cd032f768fc5219838",
                    //     },
                    //     {
                    //       label: "Type",
                    //       value:
                    //         "SERVICE_DELIVERY_CONFIRMED_BY_SERVICE_PROVIDER",
                    //     },
                    //   ],
                    // });
                  }
                  // onUpdate();
                }}
                variant={{
                  hover: "hover:drop-shadow-md",
                  text: "text-white",
                  border: "bg-green-001",
                  height: "h-40 lg:h-48",
                  width: "ml-5",
                }}
              >
                SAVE
              </ButtonElement>
            </div>
          </div>
        </div>
      </div>
    );
  };

/**
 * CardElement SubComponent
 */
interface CardElementProps {
  id: string;
  title: string;
  isSelected: boolean;
  onClick: any;
}

const CardElement = ({
  id,
  title,
  isSelected,
  onClick,
}: CardElementProps) => {
  return (
    <div
      className={`ServiceDetail__CardElement p-4  shadow-card border-2 ${
        isSelected
          ? "border-blue-002 text-blue-005"
          : "border-transparent text-blue-007"
      }  hover:border-blue-002  hover:text-blue-005 bg-white`}
      onClick={(e) => {
        e.preventDefault();
        onClick(id);
      }}
    >
      <h3 className="text-h3 hover:text-blue-005 font-medium leading-6">
        {title}
      </h3>
    </div>
  );
};
