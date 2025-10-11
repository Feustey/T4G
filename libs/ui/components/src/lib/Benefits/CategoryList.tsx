import { Components } from "@t4g/types";
import { LinkCardElement } from "@t4g/ui/elements";
import { ServiceCategoryIconElement } from "@t4g/ui/icons";
import React from "react";

export const CategoryList: React.FC<Components.Benefits.CategoryList.Props> =
  function ({ serviceCategories }: Components.Benefits.CategoryList.Props) {
    return (
      <ul
        role="list"
        className={`BenefitsList lg:grid-cols-3 grid grid-cols-1 gap-6`}
      >
        {serviceCategories?.map((category, index) => {
          const IconElement = (
            <ServiceCategoryIconElement
              key={index}
              category={category.name}
              size="large"
            />
          );

          return (
            <li key={category.id} className="items-stretch">
              <LinkCardElement
                footerOffset={68}
                link={{
                  text: "View benefits",
                  href: `/benefits/${encodeURIComponent(category.name)}`,
                }}
                title={category.name}
                body={category.description}
                components={{
                  topLeft: IconElement,
                }}
              />
            </li>
          );
        })}
      </ul>
    );
  };
