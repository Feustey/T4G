import { Elements } from "@t4g/types";
import React from "react";
import { AutocompleteElement } from "./AutocompleteElement";
import { SelectElement } from "./SelectElement";

export const SelectionFilterElement: React.FC<
  Elements.SelectFilterElement.Props
> = ({
  title,
  filters,
  labels,
  onChangeState,
}: Elements.SelectFilterElement.Props) => {
  const [activeFilter, setActiveFilter] = React.useState("");
  const [state, setState] = React.useState({});
  const [selected, setSelected] = React.useState({
    value: "",
    label: "Select a method to see a preview on the right",
  });
  return (
    <div className="SelectionFilterElement lg:grid-cols-4 grid items-center w-full grid-cols-1 gap-6">
      {title && <span className="text-blue-007 mr-4 text-base">{title}</span>}
      {filters.map((filter, i) => (
        <div
          key={filter.label}
          className=""
          style={{ zIndex: 20 + filters.length - i }}
        >
          <AutocompleteElement
            label={labels !== undefined ? labels[i] : filter.label}
            name={filter.label}
            options={filter.options}
            initialValue={selected}
            onChange={(payload: any) => {
              //setActiveFilter(filter.label);
              onChangeState(
                filter.label,
                payload.value
                //label: payload.label,
              );
            }}
          />
        </div>
      ))}
    </div>
  );
};
