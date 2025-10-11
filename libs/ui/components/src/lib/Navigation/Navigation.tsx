import React from "react";
import { NavigationItem } from "./NavigationItem";
import { useRouter } from "next/router";
import { Components } from "@t4g/types";

export const Navigation: React.FC<Components.Navigation.Navigation.Props> =
  function ({
    items,
    variant = "horizontal",
  }: Components.Navigation.Navigation.Props) {
    const router = useRouter();
    return (
      <>
        <nav className="Navigation grid gap-0 text-center font-medium">
          {items.map((item) => (
            <NavigationItem
              key={item.link}
              href={item.link}
              variant={
                router.route.startsWith(item.link) ? "highlight" : "default"
              }
              external={item.external}
            >
              {item.title}
            </NavigationItem>
          ))}
        </nav>
        <style>
          {`
          .Navigation {
             grid-template-columns: repeat(${items.length}, minmax(0, 7.2rem));
          }
      `}
        </style>
      </>
    );
  };
