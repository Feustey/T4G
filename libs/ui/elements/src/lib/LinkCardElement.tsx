import React from "react";
import { ArrowIconElement } from "@t4g/ui/icons";
import { DividerElement } from "./DividerElement";
import { TextElement } from "./TextElement";
import { Elements } from "@t4g/types";
import Link from "next/link";

export const LinkCardElement: React.FC<Elements.LinkCardElement.Props> =
  function ({
    footerOffset = 50,
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
  }: Elements.LinkCardElement.Props) {
    return (
      <div
        className={`LinkCardElement text-blue-005   h-full p-4 text-base bg-white border-2 border-transparent ${
          title.includes("Coming soon") ? "bg-gray-020 " : ""
        }`}
      >
        <div className="flex justify-between font-medium">
          <div>{components.topLeft}</div>
          <div>{components.topRight}</div>
        </div>

        <div
          className="flex flex-col justify-between mt-5"
          style={{ height: `calc(100% - ${footerOffset}px)` }}
        >
          {components.body ? (
            components.body
          ) : (
            <div>
              <h3 className="text-h3 text-blue-005 font-medium leading-6">
                {title}
              </h3>
              <p className="text-blue-007 my-4 text-base">{body}</p>
            </div>
          )}
          <div className="">
            <DividerElement bleeding spacing="pb-2" />
            <div className="flex items-center justify-between pt-4">
              {components.bottomLeft ?? <div />}
              <div className="flex items-center">
                {title.includes("Coming soon") ? null : (
                  <>
                    <Link href={link.href} className="inline-flex mt-0 ml-2">
                      <TextElement
                        className="lg:inline-block hover:cursor-pointer"
                        variant="link"
                      >
                        {link.text}
                      </TextElement>
                    </Link>
                    <span className="ml-2">
                      <ArrowIconElement size="small" />
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
