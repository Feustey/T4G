import { DividerElement, LinkElement } from "@t4g/ui/elements";
import {
  CopyIconElement,
  PolygonIconElement,
  StatusIconElement,
  TFGTokenIconElement,
} from "@t4g/ui/icons";
import { Components } from "@t4g/types";
import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import moment from "moment";
import getConfig from "next/config";

export interface BlockchainReceiptProps {
  services: Array<{
    kind: "Student mentor" | "Guest lecturer" | "Jury member";
    title: string;
    cost: number;
    unit: string;
  }>;
  transaction: any;
}

export const BlockchainReceipt = ({
  services,
  transaction,
}: BlockchainReceiptProps) => {
  const POLYGONSCAN_BASEURL = getConfig().publicRuntimeConfig.polygonScanUrl;
  const [copiedTo, setCopiedTo] = React.useState<boolean>(false);
  const [copiedFrom, setCopiedFrom] = React.useState<boolean>(false);
  const [copiedHash, setCopiedHash] = React.useState<boolean>(false);

  React.useEffect(() => {
    const timerHandle = setTimeout(() => setCopiedTo(false), 1000);
    return () => {
      clearTimeout(timerHandle);
    };
  }, [copiedTo]);
  React.useEffect(() => {
    const timerHandle = setTimeout(() => setCopiedFrom(false), 1000);
    return () => {
      clearTimeout(timerHandle);
    };
  }, [copiedFrom]);
  React.useEffect(() => {
    const timerHandle = setTimeout(() => setCopiedHash(false), 1000);
    return () => {
      clearTimeout(timerHandle);
    };
  }, [copiedHash]);

  return (
    <div className="BlockchainReceipt px-8">
      <div className="CardSelectElement__Section ">
        <h2>Blockchain receipt</h2>
        <p className="text-blue-007 mt-5 text-base min-w-[200px]">
          This blockchain receipt shows you more details about the transaction.
          The ‘transaction hash’ is a unique identifier that is generated
          whenever a transaction is executed on the blockchain. It serves as
          proof the transaction has taken place. The ‘from’ and ‘to’ show the
          actors on both sides of the transaction, together with the identifier
          of their wallet on the blockchain.
        </p>

        <div className="flex flex-col mt-12 text-base">
          <div className="BlockchainReceipt__TxTo relative flex">
            <div className="min-w-[200px] grow-0 text-blue-007">
              Transaction hash:
            </div>
            <div className="text-ellipsis hover:underline text-blue-002 grow overflow-hidden cursor-pointer">
              <span className="text-blue-005"></span>

              <CopyToClipboard
                text={transaction.hash}
                onCopy={() => {
                  setCopiedHash(true);
                }}
              >
                <div className="">
                  {copiedHash && (
                    <span className="absolute -top-5.5 right-6 text-blue-300 overflow-hidden ">
                      copied
                    </span>
                  )}
                  <div className="text-ellipsis hover:underline cursor-pointer text-blue-002 w-[84%] overflow-hidden">
                    {transaction.hash}
                  </div>
                  <div className="grow-0 absolute top-0 right-0 ml-4 cursor-pointer">
                    <CopyIconElement size="small" />
                  </div>
                </div>
              </CopyToClipboard>
            </div>
          </div>
          <DividerElement bleeding spacing="py-4" />
          <div className="BlockchainReceipt__TxType flex overflow-hidden">
            <div className="min-w-[200px] grow-0 text-blue-007 overflow-hidden">
              Transaction type:
            </div>
            <div className="text-blue-005">{transaction.event}</div>
          </div>
          <DividerElement bleeding spacing="py-4" />
          <div className="BlockchainReceipt__TxFrom relative flex overflow-hidden">
            <div className="min-w-[200px] grow-0 text-blue-007 overflow-hidden">
              From:
            </div>
            <div className="text-ellipsis hover:underline text-blue-002 grow overflow-hidden cursor-pointer">
              <span className="text-blue-005">
                {transaction?.serviceBuyerInfo?.firstname}{" "}
                {transaction?.serviceBuyerInfo?.lastname?.toUpperCase()}
              </span>
              <br />
              <CopyToClipboard
                text={`${transaction?.serviceBuyerInfo?.firstname}
                ${" "}
                ${transaction?.serviceBuyerInfo?.lastname?.toUpperCase()}`}
                onCopy={() => {
                  setCopiedFrom(true);
                }}
              >
                <div className="">
                  {copiedFrom && (
                    <span className="absolute -top-5.5 right-6 text-blue-300 overflow-hidden">
                      copied
                    </span>
                  )}
                  <div className="text-ellipsis hover:underline cursor-pointer text-blue-002 w-[84%] overflow-hidden">
                    {transaction?.from}
                  </div>
                  <div className="grow-0 top-5 absolute right-0 ml-4 overflow-hidden cursor-pointer">
                    <CopyIconElement size="small" />
                  </div>
                </div>
              </CopyToClipboard>
            </div>
          </div>
          <DividerElement bleeding spacing="py-4" />
          <div className="BlockchainReceipt__TxTo relative flex overflow-hidden">
            <div className="min-w-[200px] grow-0 text-blue-007 overflow-hidden">
              To:
            </div>
            <div className="text-ellipsis hover:underline text-blue-002 grow overflow-hidden cursor-pointer">
              <span className="text-blue-005">
                {transaction?.serviceProviderInfo?.firstname}{" "}
                {transaction?.serviceProviderInfo?.lastname?.toUpperCase()}
              </span>
              <br />
              <CopyToClipboard
                text={`${transaction?.serviceProviderInfo?.firstname}
                ${" "}
                ${transaction?.serviceProviderInfo?.lastname?.toUpperCase()}`}
                onCopy={() => {
                  setCopiedTo(true);
                }}
              >
                <div className="">
                  {copiedTo && (
                    <span className="absolute -top-5.5 right-6 text-blue-300 overflow-hidden">
                      copied
                    </span>
                  )}
                  <div className="text-ellipsis hover:underline cursor-pointer overflow-hidden text-blue-002 w-[84%]">
                    {transaction?.to}
                  </div>
                  <div className="grow-0 top-5 absolute right-0 ml-4 overflow-hidden cursor-pointer">
                    <CopyIconElement size="small" />
                  </div>
                </div>
              </CopyToClipboard>
            </div>
          </div>
          <DividerElement bleeding spacing="py-4" />
          <div className="BlockchainReceipt__Status flex overflow-hidden">
            <div className="min-w-[200px] grow-0 text-blue-007 overflow-hidden">
              Status:
            </div>
            {transaction?.success && (
              <div
                className={`text-blue-005 ${
                  transaction?.success ? "bg-green-001" : "bg-red-001"
                } text-white rounded-full pl-2 pr-3 py-1.25 flex items-center overflow-hidden`}
              >
                <StatusIconElement
                  status={transaction?.success ? "SUCCESS" : "ERROR"}
                  size="small"
                  variant="white"
                />

                <span className="inline-block ml-2">
                  {transaction?.success ? "SUCCESS" : "ERROR"}
                </span>
              </div>
            )}
          </div>
          <DividerElement bleeding spacing="py-4" />
          <div className="BlockchainReceipt__Timestamp flex overflow-hidden">
            <div className="min-w-[200px] grow-0 text-blue-007 overflow-hidden">
              Date Time:
            </div>
            <div className="text-blue-005">
              {new Date(transaction?.ts).toLocaleDateString()}
            </div>
          </div>
          <DividerElement bleeding spacing="py-4" />
          <div>
            <LinkElement
              href={`${POLYGONSCAN_BASEURL}/tx/${transaction?.hash}`}
              openNewTab={true}
            >
              More details on Polygonscan
            </LinkElement>
          </div>
        </div>
        <div className="BlockchainReceipt__Polygon bg-gray-041 flex p-5 mt-12 ">
          <PolygonIconElement size="medium" />
          <div className="ml-4">
            <h3 className="text-blue-005 text-base font-medium">
              About Polygonscan
            </h3>
            <p className="mt-2.5 text-base text-blue-007">
              Token for Good is using the Polygon blockchain. Polygonscan is the
              tool that allows a fully transparent view on all transactions
              happening on Polygon. It serves as a search engine for all data on
              the Polygon network, and gives info on all details of the
              transactions. Also this transaction can be tracked on the
              blockchain using Polygonscan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CardElement SubComponent
 */
interface CardElementProps {
  title: string;
  cost: number;
  unit?: string;
}

const CardElement = ({
  title,
  cost,
  unit = "tokens / 1 hour session",
}: CardElementProps) => {
  return (
    <div className="CardSelectElement__Card   hover:border-blue-002 text-blue-007 hover:text-blue-005 p-4 text-base bg-white border-2 border-transparent">
      <h3 className="text-h3 hover:text-blue-005 font-medium leading-6">
        {title}
      </h3>
      <DividerElement bleeding spacing="py-5" />
      <div className="text-orange-002 flex items-center text-base">
        <TFGTokenIconElement size={"small"} />
        <span className="ml-2 font-normal">{`Collect ${cost} ${unit}`}</span>
      </div>
    </div>
  );
};
