import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import {
  CopyIconElement,
  PolygonIconElement,
  TFGTokenIconElement,
} from "@t4g/ui/icons";
import { DividerElement, LinkElement } from "@t4g/ui/elements";
import { useAppContext } from "@t4g/ui/providers";
import getConfig from "next/config";

export interface BlockchainWalletAddressProps {
  services: Array<{
    kind: "Student mentor" | "Guest lecturer" | "Jury member";
    title: string;
    cost: number;
    unit: string;
  }>;
  address: string;
}

export const BlockchainWalletAddress: React.FC<BlockchainWalletAddressProps> =
  function ({ services, address }: BlockchainWalletAddressProps) {
    const { setToaster } = useAppContext();
    const [copied, setCopied] = React.useState<boolean>(false);
    const POLYGONSCAN_BASEURL = getConfig().publicRuntimeConfig.polygonScanUrl;

    React.useEffect(() => {
      const timerHandle = setTimeout(() => setCopied(false), 1000);
      return () => {
        clearTimeout(timerHandle);
      };
    }, [copied]);

    return (
      <div className="WalletDetail px-8">
        <div className="CardSelectElement__Section w-full">
          <h2>Your wallet address</h2>
          <p className="text-blue-007 mt-5 text-base">
            Your wallet address is the unique identifier of your wallet on the
            blockchain. In just the same way that an email address is used to
            send and receive emails, a wallet address is used to send and
            receive transactions.
          </p>

          <div className="flex flex-col mt-12 text-base">
            <div className="BlockchainReceipt__TxHash flex">
              <div className="min-w-[200px] grow-0 text-blue-007">
                Public key:
              </div>
              <div className="text-ellipsis hover:underline text-blue-002 grow relative overflow-hidden text-blue-300 cursor-pointer">
                <CopyToClipboard
                  text={address}
                  onCopy={() => {
                    setCopied(true);
                  }}
                >
                  <div className="text-ellipsis overflow-hidden">
                    {copied && (
                      <span className="absolute -top-0.5 right-6">copied</span>
                    )}
                    <LinkElement
                      href={`${POLYGONSCAN_BASEURL}/address/${address}#tokentxns`}
                      openNewTab={true}
                    >
                      {address}
                    </LinkElement>
                    <div className="grow-0 absolute top-0 right-0 ml-4 cursor-pointer">
                      <CopyIconElement size="small" />
                    </div>
                  </div>
                </CopyToClipboard>
              </div>
            </div>
            <DividerElement bleeding spacing="py-4" />
            <div>
              <LinkElement
                href={`${POLYGONSCAN_BASEURL}/address/${address}#tokentxns`}
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
                Token for Good is using the Polygon blockchain. Polygonscan is
                the tool that allows a fully transparent view on all
                transactions happening on Polygon. It serves as a search engine
                for all data on the Polygon network, and gives info on all
                details of the transactions. Also this transaction can be
                tracked on the blockchain using Polygonscan.
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
