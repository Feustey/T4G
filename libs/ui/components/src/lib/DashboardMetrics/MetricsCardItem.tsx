import React from "react";

export interface MetricsCardItemProps {
  metrics: { label: string; value: number }[];
  variant?: "inverse" | "default";
}

export const MetricsCardItem = ({
  metrics,
  variant = "default",
}: MetricsCardItemProps) => {
  return (
    <li
      className={`MetricsCardItem py-4 mb-6 text-base text-blue-005 bg-white   border-2 ${
        variant === "default"
          ? "border-transparent hover:border-orange-003"
          : "border-transparent hover:border-green-001"
      } hover:cursor-pointer`}
    >
      <div className="flex">
        <div className="flex flex-col justify-around items-center mx-auto pt-4 w-1/2">
          <div
            className={`font-medium text-51 ${
              variant === "inverse" ? "text-green-001" : "text-orange-003"
            }`}
          >
            {metrics[0].value}
          </div>
          <div className="text-base mt-2">{metrics[0].label}</div>
        </div>
        <div className="border-l border-gray-020 h-20" />
        <div className="flex flex-col justify-around items-center mx-auto pt-4 w-1/2">
          <div
            className={`font-medium text-51 ${
              variant === "inverse" ? "text-green-001" : "text-orange-003"
            }`}
          >
            {metrics[1].value}
          </div>
          <div className="text-base mt-2">{metrics[1].label}</div>
        </div>
      </div>
    </li>
  );
};
