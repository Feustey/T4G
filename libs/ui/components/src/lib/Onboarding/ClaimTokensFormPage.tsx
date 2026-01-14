// import React from "react";
// import {
//   CheckIconElement,
//   ErrorExclamationIconElement,
//   SpinnerIconElement,
// } from "@t4g/ui/icons";
// import { ButtonElement } from "@t4g/ui/elements";
// import { useAuth } from '@/contexts/AuthContext';
// import { SessionType } from "@shared/types";

// interface ClaimTokensFormPageProps {
//   currentPageRef: any;
//   setCurrentPage: any;
//   setProgress: any;
//   paginationRef: any;
//   totalPages: any;
//   userId: string;
//   status: "PENDING" | "SUCCESS" | "ERROR";
// }

// export const ClaimTokensFormPage: React.FC<ClaimTokensFormPageProps> =
//   function ({
//     currentPageRef,
//     setCurrentPage,
//     paginationRef,
//     totalPages,
//     setProgress,
//     status,
//   }: ClaimTokensFormPageProps) {
//     const session = useSession().data as SessionType;

//     if (status === "PENDING") {
//       return (
//         <div className="ActivateWalletFormPage w-full">
//           <div className="text-blue-005 flex items-center justify-center text-base">
//             <div className="w-6 h-6">
//               <SpinnerIconElement size="small" />
//             </div>
//             <p className="ml-3">
//               Pending blockchain transaction: Activating wallet
//             </p>
//           </div>
//         </div>
//       );
//     }

//     if (status === "SUCCESS") {
//       return (
//         <div className="ActivateWalletFormPage w-full">
//           <div className="text-blue-005 flex items-center justify-center text-base">
//             <div className="w-6 h-6">
//               <CheckIconElement size="medium" />
//             </div>
//             <p className="ml-3">
//               Your blockchain wallet is activated! Now claim your tokens.
//             </p>
//           </div>

//           <div className="flex justify-center mt-12">
//             <ButtonElement
//               disabled={false}
//               onClick={async (e) => {
//                 e.preventDefault();
//                 if (currentPageRef.current < totalPages) {
//                   currentPageRef.current++;
//                   setCurrentPage(currentPageRef.current);
//                   setProgress(
//                     currentPageRef.current * (100 / (totalPages + 1))
//                   );
//                   if (paginationRef.current) {
//                     paginationRef.current.style.transform = `translateX(${
//                       (currentPageRef.current - 1) * (-100 / totalPages)
//                     }%)`;
//                   }
//                 }
//                 console.log("finish setup");
//                 try {
//                   const res = await fetch(
//                     "/api/users/" + session!.user.id + "/finish-setup"
//                   );
//                   const authUser = await res.json();
//                   console.log("finish setup", await res.json());
//                 } catch (error) {
//                   status = "ERROR";
//                   console.log(error);
//                 }
//               }}
//               variant={{
//                 text: "font-semibold text-base",
//                 border: "border border-blue-003",
//                 height: "h-40 lg:h-48",
//                 width: "",
//                 disabled: "bg-white text-blue-008",
//                 active: "bg-green-001 text-white",
//                 hover: "",
//               }}
//             >
//               CLAIM MY TOKENS
//             </ButtonElement>
//           </div>
//         </div>
//       );
//     }

//     if (status === "ERROR") {
//       return (
//         <div className="ActivateWalletFormPage w-full">
//           <div className="text-blue-005 flex justify-center text-base">
//             <img src="/assets/images/svg/wallet-t4g-empty.svg" alt="wallet" />
//             <div className="w-6 h-6">
//               <ErrorExclamationIconElement size="small" />
//             </div>
//             <div className="mt-1 ml-3">
//               <span>
//                 Something went wrong while activating your blockchain wallet.
//               </span>
//               <div className="flex -ml-3">
//                 <ButtonElement
//                   disabled={false}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     if (currentPageRef.current > 1) {
//                       currentPageRef.current--;
//                       setCurrentPage(currentPageRef.current);

//                       if (paginationRef.current) {
//                         paginationRef.current.style.transform = `translateX(${
//                           (currentPageRef.current - 1) * (-100 / totalPages)
//                         }%)`;
//                       }
//                     }
//                   }}
//                   variant={{
//                     text: "font-normal text-base underline",
//                     border: "",
//                     height: "",
//                     width: "",
//                     disabled: "",
//                     active: "bg-transparent text-blue-002",
//                     hover: "",
//                   }}
//                 >
//                   Please go back and try again.
//                 </ButtonElement>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return <></>;
//   };
