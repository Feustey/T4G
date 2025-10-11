// import React from "react";
// import {
//   CheckIconElement,
//   ErrorExclamationIconElement,
//   SpinnerIconElement,
// } from "@t4g/ui/icons";
// import { ButtonElement } from "@t4g/ui/elements";
// import { useRouter } from "next/router";
// import { LocaleType } from "@shared/types";

// interface OnboardingCompletedFormPageProps {
//   user: any;
//   currentPageRef: any;
//   setCurrentPage: any;
//   paginationRef: any;
//   totalPages: any;
//   setProgress: any;
//   status: "PENDING" | "SUCCESS" | "ERROR";
// }

// export const OnboardingCompletedFormPage: React.FC<OnboardingCompletedFormPageProps> =
//   function ({
//     user,
//     currentPageRef,
//     setCurrentPage,
//     paginationRef,
//     totalPages,
//     setProgress,
//     status = "PENDING",
//   }: OnboardingCompletedFormPageProps) {
//     const [_status, setStatus] = React.useState(status);

//     const router = useRouter();
//     const locale = router.locale as LocaleType;

//     React.useEffect(() => {
//       if (currentPageRef.current === totalPages) {
//         if (_status === "SUCCESS") {
//           setProgress(100);
//         }
//       }
//     }, [_status]);

//     React.useEffect(() => {
//       let timerHandle: NodeJS.Timeout;
//       if (currentPageRef.current === totalPages) {
//         timerHandle = setTimeout(() => {
//           setStatus("SUCCESS");
//         }, 5000);
//       }
//       return () => {
//         clearTimeout(timerHandle);
//       };
//     }, [_status, currentPageRef.current]);

//     if (_status === "PENDING") {
//       return (
//         <div className="ActivateWalletFormPage w-full">
//           <div className="text-blue-005 flex items-center justify-center text-base">
//             <div className="w-6 h-6">
//               <SpinnerIconElement size="small" />
//             </div>
//             <p className="ml-3">
//               Pending blockchain transaction: Transferring tokens
//             </p>
//           </div>
//         </div>
//       );
//     }

//     if (_status === "SUCCESS") {
//       return (
//         <div className="ActivateWalletFormPage w-full">
//           <div className="text-blue-005 flex items-center justify-center text-base">
//             <div className="w-6 h-6">
//               <CheckIconElement size="medium" />
//             </div>
//             <p className="ml-3">
//               Your tokens are transferred to your wallet! You are ready to go!
//             </p>
//           </div>

//           <div className="flex justify-center mt-12">
//             <ButtonElement
//               disabled={false}
//               onClick={(e) => {
//                 e.preventDefault();
//                 router.push("/dashboard", "/dashboard", { locale: locale });
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
//               ENTER TOKEN FOR GOOD
//             </ButtonElement>
//           </div>
//         </div>
//       );
//     }

//     if (_status === "ERROR") {
//       return (
//         <div className="ActivateWalletFormPage w-full">
//           <div className="text-blue-005 flex justify-center text-base">
//             <div className="w-6 h-6">
//               <ErrorExclamationIconElement size="small" />
//             </div>
//             <div className="mt-1 ml-3">
//               <span>Something went wrong while transferring your tokens.</span>
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
