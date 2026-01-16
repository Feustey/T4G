import Link from "next/link";
import React from "react";

export interface LinkElementProps {
  href?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  openNewTab?: boolean;
  variant?: "default" | "highlight" | { hover?: string; text?: string };
}

export const LinkElement: React.FC<LinkElementProps> = ({
  href = "#",
  onClick,
  children,
  openNewTab,
  variant = "default",
}) => {
  return (
    <div className="LinkElement" onClick={onClick}>
      <Link
        href={href}
        className={` ${
          typeof variant === "object" ? variant.hover : "hover:underline"
        } ${
          typeof variant === "object" ? variant.text : "text-base text-blue-002"
        }`}
        target={`${openNewTab ? "_blank" : "_self"}`}
      >
        {variant === "highlight" ? (
          <span className="inline-block p-3 border ">{children}</span>
        ) : (
          children
        )}
      </Link>
    </div>
  );
};
