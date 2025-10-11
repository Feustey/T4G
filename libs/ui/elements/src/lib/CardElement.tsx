import { Elements } from "@t4g/types";
import React from "react";
import { DividerElement } from "./DividerElement";

export const CardElement: React.FC<Elements.CardElement.Props> = ({
  components = {
    topLeft: <div />,
    topRight: <div />,
    bottomLeft: <div />,
    body: <div />,
  },
  title = "",
  body = "",
  variant = "default",
  divider = true,
}: Elements.CardElement.Props) => {
  return (
    <div
      className={`CardElement ${
        variant === "borderless"
          ? ""
          : "p-4  drop-shadow-md border-2 border-transparent hover:border-blue-002 hover:cursor-pointer"
      } text-base text-blue-005 bg-white`}
    >
      <div className="flex justify-between font-medium">
        <div>{components.topLeft}</div>
        <div>{components.topRight}</div>
      </div>

      <div className="mt-5">
        {components.body ? (
          components.body
        ) : (
          <>
            <h3 className="text-h3 text-blue-005 font-medium">{title}</h3>
            <p className="text-blue-007 my-4 text-base">{body}</p>
          </>
        )}

        {divider && (
          <DividerElement
            bleeding
            spacing={`${variant === "borderless" ? "py-6" : "py-0" + ""}`}
          />
        )}
        <div className="flex items-center justify-between pt-4">
          {components.bottomLeft ?? <div />}
        </div>
      </div>
    </div>
  );
};
