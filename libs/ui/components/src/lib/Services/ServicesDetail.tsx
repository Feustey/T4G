import React from "react";
import { TFGTokenIconElement } from "@t4g/ui/icons";
import { CheckboxElement, DividerElement } from "@t4g/ui/elements";
import { Components } from "@t4g/types";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../../apps/dapp/hooks";
import {
  selectProposedServices,
  setProposedServicesState,
} from "../../../../../../apps/dapp/store/slices/proposedServicesSlice";
import { Icons, Message } from "apps/dapp/components";

export const ServicesDetail: React.FC<Components.Services.ServicesDetail.Props> =
  function ({ title, annotations }: Components.Services.ServicesDetail.Props) {
    const dispatch = useAppDispatch();
    const proposedServicesState = useAppSelector(selectProposedServices);
    return (
      <div className="ServicesDetail py-16 px-32 lg:min-w-[730px]">
        <div className="CardSelectElement__Section w-full">
          <h2 className="text-center">{title}</h2>
          <Message variant={'info'}>
                <p className="mb-0 u-text--bold"> People can reach out to you for:</p>
          </Message>
          <div className="grid grid-cols-1 gap-6 mt-6">
            {annotations &&
              annotations?.map((annotation: any, index: number) => (
                
                  <><CheckboxElement
                  checked={proposedServicesState?.includes(annotation.name)
                    ? true
                    : false}
                  name={annotation.name}
                  className="flex items-center"
                  label={annotation.name}
                  onChange={(e) => {
                    if (proposedServicesState?.includes(annotation.name)) {
                      dispatch(
                        setProposedServicesState(
                          proposedServicesState.filter(
                            (el: string) => el !== annotation.name
                          )
                        )
                      );
                    } else {
                      if (proposedServicesState) {
                        dispatch(
                          setProposedServicesState([
                            ...proposedServicesState,
                            annotation.name,
                          ])
                        );
                      } else {
                        dispatch(setProposedServicesState([annotation.name]));
                      }
                    }
                  } } />
                  </>
              ))}
          </div>
        </div>
      </div>
    );
  };

