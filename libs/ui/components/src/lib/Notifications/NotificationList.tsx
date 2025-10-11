import { Components } from "@t4g/types";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  ButtonElement,
  DividerElement,
  LinkElement,
} from "@t4g/ui/elements";
dayjs.extend(relativeTime);

export const NotificationList: React.FC<Components.Notifications.NotificationList.Props> =
  function ({ transactions }: Components.Notifications.NotificationList.Props) {
    return (
      <ul
        role="list"
        className="NotificationsList   text-blue-005 p-5 text-base bg-white"
      >
        {transactions.length <= 0 ? (
          <span
            style={{
              gridColumn: `span 5`,
              textAlign: "center",
              marginTop: "1rem",
            }}
          >
            Pas de données
          </span>
        ) : (
          transactions.map((transaction, i) => (
            <li
              id={"notif#" + transaction.tx}
              key={(transaction.ts?.valueOf()?.toString() || "") + i}
              className="NotificationsListItem text-blue-005"
            >
              <div>
                <span style={{ display: "none" }}>{transaction.tx}</span>
                <span className="text-blue-007">
                  {dayjs().to(dayjs(transaction.ts || Date.now()))}{" "}
                  {/* transaction.createdAt */}
                </span>
              </div>
              <div className="display-linebreak text-base">
                <span>{transaction.message} </span>
                <span className="ml-2"></span>
              </div>
              {i !== transactions.length - 1 && (
                <DividerElement spacing="pt-8" bleeding />
              )}
            </li>
          ))
        )}
      </ul>
    );
  };
