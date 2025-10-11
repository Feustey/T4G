import React, { useEffect, useState } from "react";
import {
  ArrowIconElement,
  CheckIconElement,
  CloseIconElement,
} from "@t4g/ui/icons";
import { ServicesDetail } from "./ServicesDetail";
import { useAppContext } from "@t4g/ui/providers";
import { Components } from "@t4g/types";
import { Icons } from "apps/dapp/components/shared/Icons";
import { Button } from "apps/dapp/components/shared/Button";
import { Toggle } from "apps/dapp/components/shared/Toggle";
import { IconsT4G } from "apps/dapp/components/index";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "apps/dapp/hooks";
import {
  selectProposedServices,
  setProposedServicesState,
} from "../../../../../../apps/dapp/store/slices/proposedServicesSlice";

export const ServicesList: React.FC<Components.Services.ServicesList.Props> =
  function ({
    title,
    list,
    annotations,
    serviceId,
    icon,
    desc,
  }: Components.Services.ServicesList.Props) {
    const { setModal } = useAppContext();
    const dispatch = useAppDispatch();

    return (
      <>
        {annotations && annotations?.length > 0 ? (
          <div className="ServicesList p-4 mb-6 c-categorie-card justify-between">
            <div className="ServicesList__Header flex items-center justify-between">
              <h2 className="u-d--flex u-align-items-center u-gap--s heading-3">
                <span className={`c-icon--title--services u-margin--none`}>
                  {Icons[icon as keyof IconsT4G]}
                </span>
                {title}
              </h2>
              <Toggle
                type="GREEN"
                active={list && list?.length > 0}
                onClick={(e) => {
                  if (list && list?.length > 0) {
                    dispatch(setProposedServicesState([]));
                  } else {
                    
                    dispatch(setProposedServicesState(annotations.map((annotation:any)=>annotation.name)));
                  }
                }}
              />
            </div>

            <div className="text-blue-005 flex items-center">
              <span className="">{Icons.token}</span>
              <span className="ml-2 font-bold">
                {`Collect ${annotations[0].price} tokens / ${annotations[0].unit} session`}
              </span>
            </div>
            <p className="mb-0">People can reach out to you for:</p>
            <ul
              role="list"
              className="flex flex-col ml-5 -mt-0.5 text-blue-005"
            >
              {annotations &&
                list &&
                annotations?.map((service: any, index: number) => (
                  <li key={index} className="ServicesList__Service mb-2.5">
                    <div className="flex items-center">
                      <div className="w-4 h-4 text-red-500">
                        {list.includes(service.name) ? (
                          <CheckIconElement size="small" />
                        ) : (
                          <CloseIconElement size="small" />
                        )}
                      </div>
                      <p className="ml-2 mb-0">{service.name}</p>
                    </div>
                  </li>
                ))}
            </ul>

            <div className="flex">
              <Link
                href="#"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  setModal({
                    component: (
                      <ServicesDetail
                        title={title}
                        serviceId={serviceId}
                        annotations={annotations}
                      />
                    ),
                  });
                }}
              >
                {list && list?.length > 0 ? (
                  <Button
                    label={"Edit Service"}
                    className="w-full"
                    theme="SERVICES"
                    variant="secondary"
                  />
                ) : (
                  <Button
                    label={"Edit service"}
                    disabled
                    className="w-full"
                    theme="SERVICES"
                    variant="secondary"
                  />
                )}
              </Link>
            </div>
          </div>
        ) : (
          <div className="ServicesList p-4 mb-6 c-categorie-card--benefits--disabled justify-between">
            <div className="ServicesList__Header flex items-center justify-start">
              <h2 className="u-d--flex u-align-items-center u-gap--s heading-3">
                <span className={`c-icon--title--services u-margin--none`}>
                  {Icons[icon as keyof IconsT4G]}
                </span>
                {title}
                <span className="c-tag--soon">Soon</span>
              </h2>
            </div>
            <Button
              label={"Edit service"}
              className="w-full"
              disabled
              theme="BENEFITS"
              variant="primary"
            />
          </div>
        )}
      </>
    );
  };
