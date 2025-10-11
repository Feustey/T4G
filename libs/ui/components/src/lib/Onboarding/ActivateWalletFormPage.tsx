// import { ButtonElement } from "@t4g/ui/elements";
// import React from "react";
// import { useSession } from "next-auth/react";
// import { SessionType, UserType } from "@shared/types";
// import { useRouter } from "next/router";

// interface ActivateWalletFormPageProps {
//   airdrop: number;
//   currentPageRef: any;
//   setCurrentPage: any;
//   setProgress: any;
//   paginationRef: any;
//   totalPages: any;
// }

// export const ActivateWalletFormPage: React.FC<ActivateWalletFormPageProps> & {
//   auth: boolean;
// } = function ({
//   airdrop,
//   currentPageRef,
//   setCurrentPage,
//   paginationRef,
//   setProgress,
//   totalPages,
// }: ActivateWalletFormPageProps) {
//   const session = useSession().data as SessionType;
//   if (!session) return <>Unauthenticated</>;
//   const router = useRouter();

//   async function submit() {
//     fetch(`/api/users/me/wallet`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({}),
//     }).then((response) => {
//       if (response.ok) {
//         router.push("/dashboard");
//       } else {
//         response.text().then(console.error);
//       }
//     });

//     if (currentPageRef.current < totalPages) {
//       currentPageRef.current++;
//       setCurrentPage(currentPageRef.current);
//       setProgress(currentPageRef.current * (100 / (totalPages + 1)));
//       if (paginationRef.current) {
//         paginationRef.current.style.transform = `translateX(${
//           (currentPageRef.current - 1) * (-100 / totalPages)
//         }%)`;
//       }
//     }
//   }

//   return (
//     <div className="ActivateWalletFormPage w-full">
//       <div className="ActivateWalletFormPage__wallet relative flex justify-center w-full">
//         <img src="/assets/images/svg/wallet-onboarding.svg" alt="wallet" />
//         <div className="mt-9 absolute inset-0 flex flex-col items-center justify-center text-white">
//           <h2 className="text-51 font-medium">{`${airdrop} tokens`}</h2>
//           <h4 className="text-lg text-white">
//             For you to turn into great benefits!
//           </h4>
//         </div>
//       </div>
//       <div className="text-blue-005 text-base">
//         <p className="mt-12 text-left">
//           To use your tokens you need a blockchain wallet. A blockchain wallet
//           is a digital solution for securely storing and managing your tokens,
//           and allows you to earn and use your tokens for services. Your wallet
//           also shows an up-to-date overview of all token movements, which can be
//           tracked transparently on the blockchain.
//         </p>
//         <p className="mt-6 text-left">
//           All you need to do is activate your wallet and claim your tokens to
//           get you started!
//         </p>
//       </div>
//       <div className="flex justify-center mt-12">
//         <ButtonElement
//           disabled={false}
//           onClick={(e) => {
//             e.preventDefault();
//             submit();
//           }}
//           variant={{
//             text: "font-semibold text-base",
//             border: "border border-blue-003",
//             height: "h-40 lg:h-48",
//             width: "",
//             disabled: "bg-white text-blue-008",
//             active: "bg-green-001 text-white",
//             hover: "",
//           }}
//         >
//           ACTIVATE MY WALLET
//         </ButtonElement>
//       </div>
//     </div>
//   );
// };

// ActivateWalletFormPage.auth = true;
