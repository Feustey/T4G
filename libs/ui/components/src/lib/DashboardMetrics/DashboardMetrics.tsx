import React from "react";
import { MetricsCardItem } from "./MetricsCardItem";
import { Components } from "@t4g/types";

export const DashboardMetrics: React.FC<Components.Wallet.DashboardMetrics.Props> =
  function ({
    set,
    metrics,
    userMetrics,
  }: Components.Wallet.DashboardMetrics.Props) {
    const serviceMetrics = [
      { label: "Services provided", value: userMetrics?.servicesProvided || 0 },
      { label: "Tokens earned", value: userMetrics?.tokensEarned || 0 },
    ];
    const benefitsMetrics = [
      { label: "Benefits enjoyed", value: userMetrics?.benefitsEnjoyed || 0 },
      { label: "Tokens used", value: userMetrics?.tokensUsed || 0 },
    ];
    const communityMetrics = [
      { label: "Members", value: metrics?.usersCount?.total || 0 },
      { label: "Transactions", value: metrics?.txsCount || 0 },
    ];
    //TODO rewrite in 2 components: 1 for impact/1 for facts
    return (
      <ul role="list" className="MyImpact flex flex-col">
        {set === "impact" && (
          <>
            <MetricsCardItem metrics={serviceMetrics} />
            <MetricsCardItem metrics={benefitsMetrics} />
          </>
        )}
        {set === "facts" && (
          <MetricsCardItem metrics={communityMetrics} variant="inverse" />
        )}
      </ul>
    );
  };
