import React from "react";
import Link from "next/link";
import { Components } from "@t4g/types";

export const NavigationItem: React.FC<Components.Navigation.NavigationItem.Props> =
  function ({
    href = "/",
    children,
    variant = "default",
    external,
  }: Components.Navigation.NavigationItem.Props) {
    if (external === true) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener">
          <span className="inline-block py-3 px-4 text-base text-blue-005 hover:text-blue-002 hover:font-semibold transition-font cursor-pointer">
            {children}
          </span>
        </a>
      );
    }
    return (
      <div className="MenuItem w-32">
        <Link href={href} legacyBehavior>
          {variant === "highlight" ? (
            <span className="inline-block  py-3 px-4 text-base font-semibold bg-blue-001 text-blue-002 transition-font cursor-default">
              {children}
            </span>
          ) : (
            <span className="inline-block py-3 px-4 text-base text-blue-005 hover:text-blue-002 hover:font-semibold transition-font cursor-pointer">
              {children}
            </span>
          )}
        </Link>
      </div>
    );
  };
