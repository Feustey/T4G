import React from "react";
import { useRouter } from "next/router";
import { ButtonElement } from "@t4g/ui/elements";
import {
  DownloadIconElement,
  HiddenIconElement,
  UploadIconElement,
} from "@t4g/ui/icons";
import { useAppContext } from "@t4g/ui/providers";
import { BlockchainWalletAddress } from "./BlockchainWalletAddress";

export const Wallet: React.FC<{
  balance: number;
  variant: string;
  address?: string | undefined;
  userRole: string;
}> = function ({
  balance,
  variant,
  address,
  userRole,
}: {
  balance: number;
  variant: string;
  address?: string | undefined;
  userRole: string;
}) {
  const { setRightPanel } = useAppContext();
  const router = useRouter();

  return (
    <div className="Wallet relative">
      <div className="hidden 2xl:block w-full bg-wallet bg-no-repeat bg-cover h-[280px] rounded-2xl" />

      <div className="2xl:hidden">
        <img
          src="/assets/images/svg/wallet-onboarding.svg"
          alt="wallet"
          className="w-full"
        />
      </div>

      <div className=" absolute top-0 flex flex-col items-center justify-center w-full h-full text-white">
        <div
          className={`relative ${
            variant === "wallet" ? "top-7" : "top-7"
          } text-51 mt-12 pt-8`}
        >
          {balance ? balance : 0} tokens
        </div>
        <div className="text-gray-040 pt-8 text-base">
          {variant === "wallet" ? "Wallet address" : ""}
        </div>
        <div
          className="flex pt-2 cursor-pointer"
          onClick={() =>
            setRightPanel({
              component: (
                <BlockchainWalletAddress
                  services={[]}
                  address={address || ""}
                />
              ),
            })
          }
        >
          <span className="text-ellipsis hover:underline inline-block w-4/5 pl-24 overflow-hidden text-base">
            {variant === "wallet" ? address : ""}
          </span>
          <span className="-mt-1 -ml-1">
            {variant === "wallet" ? (
              <HiddenIconElement size="medium" />
            ) : (
              <span className="inline-block h-12" />
            )}
          </span>
        </div>
      </div>

      <div className="Wallet__buttons relative flex justify-around px-6 mx-auto -mt-6">
        {variant === "dashboard" && (
          <>
            <ButtonElement
              variant={{
                hover: "hover:text-orange-002 hover:border-orange-002",
                text: "font-semibold text-base xl:text-base",
                border: "border border-transparent drop-shadow-md",
                height: "h-40 lg:h-48",
                width: "w-[45%] xl:w-[40%]",
                active: "bg-white",
              }}
              onClick={() => router.push("/benefits")}
              icon={<UploadIconElement size="small" />}
            >
              USE TOKENS
            </ButtonElement>
            <ButtonElement
              variant={{
                hover:
                  userRole === "STUDENT"
                    ? "hover:text-gray-200"
                    : "hover:text-orange-002 hover:border-orange-002",
                text:
                  userRole === "STUDENT"
                    ? "font-semibold text-base xl:text-base text-gray-200"
                    : "font-semibold text-base xl:text-base",
                border: "border border-transparent drop-shadow-md",
                height: "h-40 lg:h-48",
                width: "w-[45%] xl:w-[40%]",
                active: "bg-white",
              }}
              onClick={
                userRole === "STUDENT"
                  ? () => router.push("/dashboard")
                  : () => router.push("/services")
              }
              icon={<DownloadIconElement size="small" />}
            >
              EARN TOKENS
            </ButtonElement>
          </>
        )}
      </div>
    </div>
  );
};
