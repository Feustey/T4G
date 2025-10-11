import { Elements } from "@t4g/types";
import Link from "next/link";
import React from "react";

export const LogoElement: React.FC<Elements.LogoElement.Props> = ({
  className,
  variant = "default",
}: Elements.LogoElement.Props) => {
  return (
    <Link href={`/`}>
      <div className={`LogoElement flex ${className}`}>
        <img
          className="lg:h-48 w-auto h-40"
          src="/assets/icons/tfg-logo.svg"
          alt="SettleMint"
        />
        {variant === "t4g" ? (
          <>
            <div className="border-gray-020 mx-10 border-l" />
            <img
              className="lg:h-48 w-auto h-40"
              src="/assets/icons/t4g-logo.svg"
              alt="SettleMint"
            />
          </>
        ) : null}
      </div>
    </Link>
  );
};
