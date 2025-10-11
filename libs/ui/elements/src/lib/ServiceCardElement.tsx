import { Elements } from "@t4g/types";
import { ArrowIconElement } from "@t4g/ui/icons";
import Link from "next/link";
import React from "react";
import { DividerElement } from "./DividerElement";
import { TextElement } from "./TextElement";

export const ServiceCardElement: React.FC<
  Elements.ServiceCardElement.Props
> = ({
  components = {
    topLeft: <div />,
    topRight: <div />,
    bottomLeft: <div />,
    body: <div />,
  },
  title = "",
  body = "",
  link = {
    text: "",
    href: "#",
  },
}: Elements.ServiceCardElement.Props) => {
  return (
    <div className="ServiceCardElement p-4 text-base text-blue-005 bg-white  drop-shadow-md border-2 border-transparent hover:border-blue-002 hover:cursor-pointer">
      <Link href={link.href}>
        <div className="flex justify-between font-medium">
          <div>{components.topLeft}</div>
          <div>{components.topRight}</div>
        </div>

        <div className="mt-5">
          {components.body ? (
            components.body
          ) : (
            <>
              <h3 className="font-medium text-h3 text-blue-005">{title}</h3>
              <p className="my-4 text-base text-blue-007">{body}</p>
            </>
          )}

          <DividerElement bleeding />
          <div className="flex justify-between items-center pt-4">
            {components.bottomLeft ?? <div />}
            <div className="flex items-center">
              <TextElement className="hidden lg:inline-block" variant="link">
                {link.text}
              </TextElement>
              <span className="ml-2">
                <ArrowIconElement size="small" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
