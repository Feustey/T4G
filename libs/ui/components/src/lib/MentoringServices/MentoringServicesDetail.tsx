import React from "react";
import { TFGTokenIconElement } from "@t4g/ui/icons";
import { ButtonElement, DividerElement } from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import { Components } from "@t4g/types";

export const MentoringServicesDetail: React.FC<Components.Services.ServicesDetail.Props> =
  function ({ title, serviceId }: Components.Services.ServicesDetail.Props) {
    const { setRightPanel, setNotification } = useAppContext();

    return (
      <div className="ServicesDetail px-8">
        <div className="CardSelectElement__Section w-full">
          <h2>{title}</h2>
          <p className="text-blue-005 mt-12 font-medium">
            Students can reach out to you for:
          </p>
          <div className="grid grid-cols-1 gap-6 mt-6">
            {/*{annotations*/}
            {/*  .filter((annotation) => annotation.category === 'Mentoring')*/}
            {/*  .map((annotation) => (*/}
            {/*    <CardElement*/}
            {/*      key={annotation.id}*/}
            {/*      id={annotation.id}*/}
            {/*      title={annotation.description}*/}
            {/*      price={serviceCategory?.defaultPrice}*/}
            {/*      unit={serviceCategory?.defaultUnit}*/}
            {/*      isSelected={_annotations.includes(annotation.id)}*/}
            {/*      onClick={(id: string) => {*/}
            {/*        let payload: any = {};*/}
            {/*        if (!_annotations.includes(annotation.id)) {*/}
            {/*          payload = {*/}
            {/*            id: serviceId,*/}
            {/*            annotations: [..._annotations, id],*/}
            {/*          };*/}
            {/*        } else {*/}
            {/*          payload = {*/}
            {/*            id: serviceId,*/}
            {/*            annotations: _annotations.filter(*/}
            {/*              (v: string) => v !== id*/}
            {/*            ),*/}
            {/*          };*/}
            {/*        }*/}
            {/*        setAnnotations(payload.annotations);*/}
            {/*      }}*/}
            {/*    />*/}
            {/*  ))}*/}
          </div>
        </div>

        <div className="flex items-center w-full mt-12">
          {/*<ButtonElement*/}
          {/*  disabled={_annotations.length === 0 ? true : false}*/}
          {/*  onClick={async () => {*/}
          {/*    dispatch({*/}
          {/*      type: 'UPDATE_SERVICE_PREFERENCES',*/}
          {/*      payload: {*/}
          {/*        id: serviceId,*/}
          {/*        annotations: _annotations,*/}
          {/*      },*/}
          {/*    });*/}
          {/*    await fetch(`/api/services/${serviceId}`, {*/}
          {/*      method: 'POST',*/}
          {/*      headers: { 'Content-Type': 'application/json' },*/}
          {/*      body: JSON.stringify(_annotations),*/}
          {/*    });*/}

          {/*    setRightPanel(null);*/}
          {/*  }}*/}
          {/*  variant={{*/}
          {/*    hover: 'hover:drop-shadow-md',*/}
          {/*    text: 'text-white',*/}
          {/*    border: 'bg-green-001',*/}
          {/*    height: 'h-40 lg:h-48',*/}
          {/*    width: 'w-full',*/}
          {/*    active: 'bg-white',*/}
          {/*    disabled: 'bg-green-002 text-white',*/}
          {/*  }}*/}
          {/*>*/}
          {/*  SAVE*/}
          {/*</ButtonElement>*/}
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
  price: number;
  unit?: string;
  isSelected: boolean;
  onClick: any;
}

const CardElement = ({
  id,
  title,
  price,
  unit = "tokens / 1 hour session",
  isSelected,
  onClick,
}: CardElementProps) => {
  return (
    <div
      className={`ServiceDetail__CardElement p-4  hover:cursor-pointer  border-2 ${
        isSelected
          ? "border-blue-002 text-blue-005"
          : "border-transparent text-blue-007"
      } ${
        isSelected
          ? "hover:border-blue002 hover:text-blue-005"
          : "hover:border-transparent hover:text-blue-007"
      }`}
      onClick={(e) => {
        e.preventDefault();
        onClick(id);
      }}
    >
      <h3
        className={`${
          isSelected
            ? "text-h3 hover:text-blue-005 font-medium leading-6"
            : "text-h3 hover:text-blue-007 font-medium leading-6"
        }`}
      >
        {title}
      </h3>
      <DividerElement bleeding spacing="py-5" />
      <div className="text-orange-002 flex items-center text-sm">
        <TFGTokenIconElement size={"small"} />
        <span className="ml-2 font-normal">{`Collect ${price} ${unit}`}</span>
      </div>
    </div>
  );
};
