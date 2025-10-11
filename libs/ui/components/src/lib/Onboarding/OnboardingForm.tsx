// import React from "react";
// import { ButtonElement } from "@t4g/ui/elements";
// import { ArrowIconElement } from "@t4g/ui/icons";
// import { SelectServicesFormPage } from "./SelectServicesFormPage";
// import { SelectBenefitCategoriesFormPage } from "./SelectBenefitCategoriesFormPage";
// import { SetupProfileFormPage } from "./SetupProfileFormPage";
// import { ActivateWalletFormPage } from "./ActivateWalletFormPage";
// import { ClaimTokensFormPage } from "./ClaimTokensFormPage";
// import { OnboardingCompletedFormPage } from "./OnboardingCompletedFormPage";
// import { Components } from "@t4g/types";
// import { useSession } from "next-auth/react";
// import { SessionType, UserType } from "@shared/types";

// export const OnboardingForm: React.FC<Components.Onboarding.OnboardingForm.Props> =
//   function ({
//     totalPages,
//     setProgress,
//     animate = false,
//     className,
//     lang,
//   }: Components.Onboarding.OnboardingForm.Props) {
//     const session = useSession().data as SessionType;

//     const user: UserType = session!.user;

//     /**
//      * State
//      */
//     const initialState: {
//       preferences: {
//         services: string[];
//         benefits: string[];
//       };
//     } = {
//       preferences: {
//         services: [],
//         benefits: [],
//       },
//     };

//     function reducer(
//       state: {
//         preferences: {
//           services: string[];
//           benefits: string[];
//         };
//       },
//       action: {
//         type: "UPDATE_SERVICE_PREFERENCES" | "UPDATE_BENEFIT_PREFERENCES";
//         payload: any; //Partial<Components.Profile.Page.Props['user']>;//TODO
//       }
//     ) {
//       switch (action.type) {
//         case "UPDATE_SERVICE_PREFERENCES":
//           return {
//             ...state,
//             preferences: {
//               ...state.preferences,
//               services: action.payload,
//             },
//           };

//         case "UPDATE_BENEFIT_PREFERENCES":
//           return {
//             ...state,
//             preferences: {
//               ...state.preferences,
//               benefits: action.payload,
//             },
//           };
//         default:
//           throw new Error();
//       }
//     }

//     /**
//      * Data State
//      */
//     const [state, dispatch] = React.useReducer<any>(reducer, initialState);
//     const [disablePrevious, setDisablePrevious] = React.useState(true);
//     const [disableNext, setDisableNext] = React.useState(true);

//     const [walletStatus, setWalletStatus] = React.useState<
//       "PENDING" | "SUCCESS" | "ERROR"
//     >("PENDING");

//     /**
//      * UI State
//      */
//     const [currentPage, setCurrentPage] = React.useState<number>(1);
//     const [pageHeights, setPageHeights] = React.useState<number[]>([]);

//     /**
//      * Refs
//      */
//     const paginationRef = React.useRef<HTMLDivElement>(null);
//     const currentPageRef = React.useRef<number>(1);
//     const paginationControlsRef = React.useRef<HTMLDivElement>(null);

//     /**
//      * Effects
//      */
//     React.useEffect(() => {
//       const heights: any = [];
//       setTimeout(() => {
//         for (let i = 0; i < totalPages; i++) {
//           heights.push(
//             (paginationRef.current?.children[i] as HTMLElement)?.offsetHeight
//           );
//         }
//         setPageHeights(heights);
//       }, 5000);
//     }, [currentPage]);

//     React.useEffect(() => {
//       let timerHandle: NodeJS.Timeout;
//       if (animate) {
//         timerHandle = setTimeout(() => {
//           paginationControlsRef.current!.style.transition = "opacity 0.5s";
//           paginationControlsRef.current!.style.opacity = "1";
//         }, 300);
//       }
//       //
//       // if (currentPage === 2 && user.role === 'ALUMNI') {
//       //   (state as any).preferences.services.length === 0
//       //     ? setDisableNext(false)
//       //     : setDisableNext(false);
//       // }
//       //
//       // if (currentPage === 2 && user.role === 'STUDENT') {
//       //   (state as any).preferences.benefits.length === 0
//       //     ? setDisableNext(true)
//       //     : setDisableNext(false);
//       // }
//       //
//       // if (currentPage === 3 && user.role === 'ALUMNI') {
//       //   (state as any).preferences.benefits.length === 0
//       //     ? setDisableNext(true)
//       //     : setDisableNext(false);
//       // }
//       //
//       // if (currentPage === 3 && user.role === 'STUDENT') {
//       //   (state as any).preferences.services.length === 0
//       //     ? setDisableNext(true)
//       //     : setDisableNext(false);
//       // }

//       return () => {
//         clearTimeout(timerHandle);
//       };
//     }, [
//       currentPage,
//       // (state as any).preferences.services.length,
//       // (state as any).preferences.benefits.length,
//       // program,
//       // year,
//       // topic,
//     ]);

//     /**
//      * Data
//      */
//     const pageTitlesStudent = [
//       {
//         title: (
//           <span>
//             Welcome to Token for Good, {user?.firstname}! <br /> Let's get you
//             set up.
//           </span>
//         ),
//         subTitle: <span>Tell us a bit about yourself first.</span>,
//       },
//       {
//         title: (
//           <span>
//             Use your tokens to enjoy exclusive
//             <br /> benefits within the community
//           </span>
//         ),
//         subTitle: (
//           <span>
//             Select the benefits that interests you the most, so you won’t miss
//             out on anything!
//           </span>
//         ),
//       },
//       {
//         title: <span>Great! Here's a welcome gift for you!</span>,
//         subTitle: null,
//       },
//       {
//         title: <span>Activating your wallet...</span>,
//         //subTitle: <span>This will only take a few seconds.</span>,
//       },
//       {
//         title: <span>Transferring your tokens...</span>,
//         //subTitle: <span>This will only take a few seconds.</span>,
//       },
//     ];

//     const pageTitlesAlumni = [
//       {
//         title: (
//           <span>
//             Welcome to Token for Good, {user?.firstname}! <br /> Let's get you
//             set up.
//           </span>
//         ),
//         subTitle: <span>Tell us a bit about yourself first.</span>,
//       },
//       {
//         title: (
//           <span>
//             Earn tokens for different services,
//             <br /> and turn these into great benefits.
//           </span>
//         ),
//         subTitle: (
//           <span>
//             Select the services you'd like to deliver to the community.
//           </span>
//         ),
//       },
//       {
//         title: (
//           <span>
//             Use your tokens to enjoy exclusive
//             <br /> benefits within the community
//           </span>
//         ),
//         subTitle: (
//           <span>
//             Select the benefits that interests you the most, so you won’t miss
//             out on anything!
//           </span>
//         ),
//       },
//       {
//         title: <span>Great! Here's a welcome gift for you!</span>,
//         subTitle: null,
//       },
//       {
//         title: <span>Activating your wallet...</span>,
//         //subTitle: <span>This will only take a few seconds.</span>,
//       },
//       {
//         title: <span>Transferring your tokens...</span>,
//         //subTitle: <span>This will only take a few seconds.</span>,
//       },
//     ];

//     /**
//      * Render
//      */
//     return (
//       <div className={`OnboardingForm ${className}`}>
//         <div className="mt-7 flex flex-col items-center">
//           <h1 className="Onboarding__title text-h1 text-blue-005 w-full mt-8 font-medium leading-10 text-center">
//             {
//               (user?.role === "STUDENT" ? pageTitlesStudent : pageTitlesAlumni)[
//                 currentPageRef.current - 1
//               ].title
//             }
//           </h1>

//           {(user?.role === "STUDENT" ? pageTitlesStudent : pageTitlesAlumni)[
//             currentPageRef.current - 1
//           ].subTitle && (
//             <h4 className="Onboarding__subTitle text-h4 text-blue-004 w-full mt-6 text-center">
//               {
//                 (user?.role === "STUDENT"
//                   ? pageTitlesStudent
//                   : pageTitlesAlumni)[currentPageRef.current - 1].subTitle
//               }
//             </h4>
//           )}
//         </div>

//         <form className="OnboardingForm relative w-full pb-40 mt-2 overflow-hidden">
//           <div
//             ref={paginationRef}
//             className={`Form__Pages flex ${
//               animate ? "transition-transform duration-500" : ""
//             }`}
//             style={{ width: `${totalPages * 100}%` }}
//           >
//             <div
//               style={{ width: `${100 / totalPages}%` }}
//               className="Form__Page drop-shadow-sm lg:  lg:m-8 lg:px-18 self-start px-2 py-12 m-2 bg-white"
//             >
//               <SetupProfileFormPage setDisableNext={setDisableNext} />
//             </div>
//             {user?.role === "ALUMNI" && (
//               <div
//                 style={{ width: `${100 / totalPages}%` }}
//                 className="Form__Page drop-shadow-sm lg:  bg-white m-2 lg:m-8 px-2 lg:px-18 py-12 h-fit"
//               >
//                 <SelectServicesFormPage
//                   // services={data?.annotations}
//                   // serviceCategories={data?.serviceCategories}
//                   setDisableNext={setDisableNext}
//                   // dispatch={dispatch}
//                   lang={lang}
//                 />
//               </div>
//             )}
//             <div
//               style={{ width: `${100 / totalPages}%` }}
//               className="Form__Page drop-shadow-sm lg:  lg:m-8 lg:px-18 self-start px-4 py-12 m-2 bg-white"
//             >
//               <SelectBenefitCategoriesFormPage
//                 // categories={data?.serviceCategories}
//                 // role={user.role}
//                 setDisableNext={setDisableNext}
//                 dispatch={dispatch}
//                 lang={lang}
//               />
//             </div>
//             <div
//               style={{ width: `${100 / totalPages}%` }}
//               className="Form__Page drop-shadow-sm lg:  lg:m-8 lg:px-18 self-start px-4 py-12 m-2 bg-white"
//             >
//               <ActivateWalletFormPage
//                 airdrop={user?.role === "ALUMNI" ? 20 : 100}
//                 currentPageRef={currentPageRef}
//                 setCurrentPage={setCurrentPage}
//                 paginationRef={paginationRef}
//                 totalPages={totalPages}
//                 setProgress={setProgress}
//               />
//             </div>
//             <div
//               style={{ width: `${100 / totalPages}%` }}
//               className="Form__Page drop-shadow-sm lg:  lg:m-8 lg:px-18 self-start px-4 py-12 m-2 bg-white"
//             >
//               <img
//                 src="/assets/images/svg/wallet-t4g-empty.svg"
//                 className="center"
//               />
//               <ClaimTokensFormPage
//                 userId={user?.id}
//                 currentPageRef={currentPageRef}
//                 setCurrentPage={setCurrentPage}
//                 paginationRef={paginationRef}
//                 totalPages={totalPages}
//                 setProgress={setProgress}
//                 status={walletStatus}
//               />
//             </div>
//             <div
//               style={{ width: `${100 / totalPages}%` }}
//               className="Form__Page drop-shadow-sm lg:  lg:m-8 lg:px-18 self-start px-4 py-12 m-3 bg-white"
//             >
//               <img
//                 src="/assets/images/svg/wallet-t4g-full.svg"
//                 className="center"
//               />
//               <OnboardingCompletedFormPage
//                 user={user}
//                 currentPageRef={currentPageRef}
//                 setCurrentPage={setCurrentPage}
//                 paginationRef={paginationRef}
//                 totalPages={totalPages}
//                 setProgress={setProgress}
//                 status="PENDING"
//               />
//             </div>
//           </div>

//           <div
//             ref={paginationControlsRef}
//             className={`Form__Controls absolute flex w-full justify-between p-8 mt-8 ${
//               animate ? "transition-opacity duration-1000 opacity-100" : ""
//             } ${
//               (user?.role === "ALUMNI" && currentPage >= 4) ||
//               (user?.role === "STUDENT" && currentPage >= 3)
//                 ? "hidden"
//                 : ""
//             }`}
//             style={{
//               top: pageHeights[currentPageRef.current - 1],
//               opacity: 1,
//             }}
//           >
//             {currentPage > 1 ? (
//               <ButtonElement
//                 icon={
//                   <ArrowIconElement
//                     size="small"
//                     color="currentColor"
//                     direction="left"
//                   />
//                 }
//                 disabled={disablePrevious}
//                 onClick={(e: any) => {
//                   e.preventDefault();
//                   if (currentPageRef.current > 1) {
//                     if (animate) {
//                       paginationControlsRef.current!.style.opacity = "0";
//                       paginationControlsRef.current!.style.transition = "none";
//                     }

//                     currentPageRef.current--;
//                     setCurrentPage(currentPageRef.current);
//                     currentPageRef.current === 1 && setDisablePrevious(true);
//                     if (paginationRef.current) {
//                       paginationRef.current.style.transform = `translateX(${
//                         (currentPageRef.current - 1) * (-100 / totalPages)
//                       }%)`;
//                     }
//                   }
//                 }}
//                 variant={{
//                   text: "font-semibold text-base",
//                   border: "border border-blue-003",
//                   height: "h-[52px] lg:h-48",
//                   width: "w-36",
//                   disabled: "bg-white text-blue-008",
//                   active: "bg-green-001 text-white",
//                   hover: "",
//                 }}
//               >
//                 PREVIOUS STEP
//               </ButtonElement>
//             ) : (
//               <div />
//             )}
//             <ButtonElement
//               disabled={disableNext}
//               icon={<ArrowIconElement size="small" color="currentColor" />}
//               iconPosition="right"
//               onClick={(e: any) => {
//                 e.preventDefault();
//                 setDisableNext(true);
//                 if (currentPageRef.current < totalPages) {
//                   if (animate) {
//                     paginationControlsRef.current!.style.opacity = "0";
//                     paginationControlsRef.current!.style.transition = "none";
//                   }
//                   currentPageRef.current++;
//                   setCurrentPage(currentPageRef.current);
//                   setProgress((currentPage + 1) * (100 / (totalPages + 1)));

//                   currentPageRef.current > 0
//                     ? setDisablePrevious(false)
//                     : setDisablePrevious(true);
//                   if (paginationRef.current) {
//                     paginationRef.current.style.transform = `translateX(${
//                       (currentPageRef.current - 1) * (-100 / totalPages)
//                     }%)`;
//                   }
//                 }
//               }}
//               variant={{
//                 text: "font-semibold text-base",
//                 border: "border border-blue-003",
//                 height: "h-[54px] lg:h-48",
//                 width: "w-36",
//                 disabled: "bg-white text-blue-008",
//                 active: "bg-green-001 text-white",
//                 hover: "",
//               }}
//             >
//               NEXT STEP
//             </ButtonElement>
//           </div>
//         </form>
//       </div>
//     );
//   };
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-ignore
// OnboardingForm.auth = true;
