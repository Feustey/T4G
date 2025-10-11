import { Components } from "@t4g/types";
import React, { useState } from "react";
import dayjs from "dayjs";
import { HiddenIconElement, StatusIconElement } from "@t4g/ui/icons";
import { Icons, IconsT4G, TableSkeleton } from "../../../../../../apps/dapp/components";

export const TransactionList: React.FC<Components.Wallet.TransactionList.Props> =
  function ({
    transactions,
    isLoading,
  }: Components.Wallet.TransactionList.Props) {
    const [incr, setIncr] = useState(0); // Indice de début de la plage

    const incrementSlice = () => {
      setIncr(incr + 4); // Incrémenter l'indice de début de la plage de 6
    };
    return (
      <>
        <div className="grid grid-cols-[80px_auto_1fr_0px_50px] lg:grid-cols-[80px_auto_1fr_230px_50px] bg-white TransactionList text-blue-005">
          <style>{`
          .grid > *:nth-child(10n+2),
          .grid > *:nth-child(10n+3),
          .grid > *:nth-child(10n+4),
          .grid > *:nth-child(10n+5),
          .grid > *:nth-child(10n+6) {
            background-color: var(--app-color-background-primary);
          }
          `}</style>
          <div className="border-blue-003 p-4 font-medium border-b">Status</div>
          <div className="border-blue-003 p-4 font-medium border-b">Date</div>
          <div className="border-blue-003 p-4 font-medium border-b">
            Transaction type
          </div>
          <div className="border-blue-003 py-4 font-medium border-b">
            <span className="lg:inline hidden">Transaction hash</span>
          </div>
          <div className="border-blue-003 p-4 font-medium border-b"></div>
          {isLoading ? (
            <TableSkeleton totalCol={5} totalRows={4} isRightPadding={false} />
          ) : transactions.length <= 0 ? (
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
            transactions.slice(0, incr + 6).map((transaction, i) => (
              <React.Fragment key={i}>
                <div className="Status border-blue-003 py-4 border-b flex justify-center items-center">
                  <StatusIconElement status={"SUCCESS"} size="small" />
                </div>
                <div className="Date border-blue-003  py-4 text-base border-b flex justify-center items-center">
                  <span className="inline-block pt-0.5">
                    {dayjs().to(dayjs(transaction?.ts || Date.now()))}{" "}
                    {/* transaction.createdAt */}
                    <br />
                  </span>
                </div>
                <div className="TransactionType border-blue-003 text-blue-005 flex px-4 py-4 border-b items-center">
                  <span>{transaction.message}</span>
                </div>
                <div className="TransactionHash border-blue-003 text-ellipsis hover:underline py-4 overflow-hidden border-b cursor-pointer items-center flex">
                  <span className="overflow-hidden text-ellipsis u-text--bold text-blue-005">
                    {transaction.tx}
                  </span>
                </div>
                <div className="Link border-blue-003 py-4 pr-2 border-b cursor-pointer flex justify-center items-center">
                  <span className="text-blue-008 hover:text-white hover:bg-blue-008 ">
                    <HiddenIconElement size="medium" />
                  </span>
                </div>
              </React.Fragment>
            ))
          )}
        </div>
        {!(transactions.length<incr+6) && (
        <button className="w-full flex justify-center" onClick={incrementSlice}> 
          <span className="flex items-center mr-2 text-blue-008" >{Icons['down' as keyof IconsT4G]}</span>Show more transactions
        </button>
        )}
      </>
    );
  };
