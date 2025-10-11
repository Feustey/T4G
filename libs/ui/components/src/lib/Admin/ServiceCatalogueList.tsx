import { Components } from "@t4g/types";
import React from "react";
import { useAppContext } from "@t4g/ui/providers";
import { DividerElement, ButtonElement } from "@t4g/ui/elements";
import { ServiceEditForm } from "@t4g/ui/components";
import { DeleteIconElement, EditIconElement } from "@t4g/ui/icons";
import { ServiceDeleteModal } from "./ServiceDeleteModal";
import { TableSkeleton } from "../../../../../../apps/dapp/components";

export const ServiceCatalogueList = ({
    services,
    serviceCategories,
    provider,
  }: Components.Admin.ServiceCataloguePage.Props): JSX.Element => {
    const { setRightPanel, setModal } = useAppContext();

    return (
      <div>
        <div
          className="RedeemsList   text-blue-005 p-5 overflow-x-auto bg-white"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
          }}
        >
          <div className="ServiceCategory min-w-[180px] border-blue-003 font-medium border-b pb-4">
            Category
          </div>
          <div className="ServiceName min-w-[250px] border-blue-003 font-medium border-b pb-4">
            Name
          </div>
          <div className="ServiceProvider min-w-[120px] border-blue-003 font-medium border-b pb-4">
            Provider
          </div>
          <div className="ServicePrice min-w-[180px] border-blue-003 font-medium border-b pb-4">
            Tokens
          </div>
          <div className="ServiceSupply min-w-[150px] border-blue-003 font-medium border-b pb-4">
            Redeems
          </div>
          <div className="ServiceEdit min-w-[50px] text-center border-blue-003 font-medium border-b pb-4" />
          {!services ? (
            <TableSkeleton totalCol={6} totalRows={5} />
          ) : (
            services.map((service, i) => (
              <>
                <div className="ServiceCategory border-blue-003 flex items-center py-3 text-base border-b min-w-[180px]">
                  {service.category.name}
                </div>
                <div className="ServiceName border-blue-003 flex items-center py-3 text-base border-b min-w-[180px]">
                  {service.name}
                </div>
                <div className="ServiceProvider border-blue-003 flex items-center py-3 text-base border-b min-w-[180px]">
                  t4g Admin
                </div>
                <div className="ServicePrice border-blue-003 flex items-center py-3 text-base border-b min-w-[180px]">
                  {`${service.price} tokens / ${service.unit}`}
                </div>
                <div className="ServiceSupply border-blue-003 flex items-center py-3 text-base border-b min-w-[180px]">
                  {service.supply}
                </div>
                <div className="ServiceEdit border-blue-003 flex items-center py-3 text-base border-b min-w-[180px]">
                  <div className="flex justify-between w-10 cursor-pointer">
                    <span
                      className="text-blue-007 hover:text-blue-005"
                      onClick={() => {
                        setRightPanel({
                          component: (
                            <ServiceEditForm
                              service={service}
                              serviceCategories={serviceCategories}
                            />
                          ),
                        });
                      }}
                    >
                      <EditIconElement size="small" />
                    </span>
                    <span
                      className="text-blue-007 hover:text-blue-005"
                      onClick={() => {
                        setModal({
                          component: <ServiceDeleteModal service={service} />,
                        });
                      }}
                    >
                      <DeleteIconElement size="small" />
                    </span>
                  </div>
                </div>
              </>
            ))
          )}
        </div>
      </div>
    );
  };
