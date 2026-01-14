// import React from "react";
// import { DividerElement } from "@t4g/ui/elements";
// import { TFGTokenIconElement } from "@t4g/ui/icons";
// import { Api, Components } from "@t4g/types";
// import { useAuth } from '@/contexts/AuthContext';
// import useSwr from "swr";
// import { Spinner } from "apps/dapp/components";
// import { ServiceCategory } from "@t4g/service/data";
// import { SessionType, UserType } from "@shared/types";

// export const SelectServicesFormPage: React.FC<Components.Onboarding.SelectServicesFormPage.Props> & {
//   auth: boolean;
// } = function ({
//   setDisableNext,
//   lang,
// }: Components.Onboarding.SelectServicesFormPage.Props) {
//   const session = useSession().data as SessionType;
//   const user: UserType = session!.user;

//   const fetcher = async (url: string) =>
//     await fetch(url).then((res) => res.json());
//   const { data: serviceCategories } = useSwr<ServiceCategory[]>(
//     `/api/service-categories`,
//     fetcher
//   ); //TODO error
//   const mentoringSubjects = [
//     //TODO move to api
//     "Knowledge sharing on your role, industry and location",
//     "How to position yourself in the job market ?",
//   ];
//   const { data: mentoringCategory } = useSwr<Api.Category>(
//     `/api/mentoring/category`,
//     fetcher
//   ); //TODO error
//   const { data: myServices, mutate: refreshMyServices } = useSwr(
//     `/api/users/me/proposed-services`,
//     fetcher,
//     {
//       revalidateOnFocus: false,
//     }
//   ); //TODO error

//   React.useEffect(() => {
//     console.log("use effect : ", myServices);

//     myServices && myServices.length > 0
//       ? setDisableNext(false)
//       : setDisableNext(true);
//   }, [myServices]);

//   async function updateProposedServices(payload: string[]) {
//     console.log("updateProposedServices", payload, myServices);

//     await refreshMyServices(payload, false);
//     await fetch(`/api/users/me/proposed-services`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   }

//   if (!serviceCategories || !myServices) return <Spinner lang={lang} />;

//   if (user?.role === "ALUMNI") {
//     // myServices && myServices.length > 0 ? setDisableNext(false)
//     // : setDisableNext(true);
//     return (
//       <div className="SelectServicesFormPage CardSelectElement w-full">
//         <div className="CardSelectElement__Section w-full">
//           <h2 className="text-25 text-blue-005 font-medium">Student mentor</h2>
//           <div className="md:grid-cols-2 flex grid gap-6">
//             {mentoringCategory &&
//               mentoringSubjects.map((subject, i) => (
//                 <CardElement
//                   key={`subject_${i}`}
//                   id={subject}
//                   title={subject}
//                   price={mentoringCategory.defaultPrice}
//                   unit={mentoringCategory.defaultUnit}
//                   isSelected={myServices.includes(subject)}
//                   onClick={async (id: string) => {
//                     let payload: any = [];
//                     if (!myServices.includes(subject)) {
//                       payload = [...myServices, id];
//                     } else {
//                       payload = myServices.filter((v: string) => v !== id);
//                     }
//                     updateProposedServices(payload);
//                   }}
//                 />
//               ))}
//           </div>
//         </div>
//       </div>
//     );
//   } else {
//     return <></>;
//   }
// };

// /**
//  * CardElement SubComponent
//  */
// interface CardElementProps {
//   id: string;
//   title: string;
//   price: number;
//   unit?: string;
//   isSelected: boolean;
//   onClick: any;
// }

// const CardElement= (function ({
//   id,
//   title,
//   price,
//   unit = "tokens / 1 hour session",
//   isSelected,
//   onClick,
// }: CardElementProps) {
//   return (
//     <div
//       className={`CardSelectElement__Card p-4  shadow-card border-2 ${
//         isSelected
//           ? "border-blue-002 text-blue-005"
//           : "border-transparent text-blue-007"
//       }  ${
//         isSelected
//           ? "hover:border-blue002 hover:text-blue-005"
//           : "hover:border-transparent hover:text-blue-007"
//       }`}
//       onClick={(e) => {
//         e.preventDefault();
//         onClick(id);
//       }}
//     >
//       <h3 className="text-h3 font-medium leading-6">{title}</h3>
//       <DividerElement bleeding spacing="py-5" />
//       <div className="text-orange-002 flex items-center text-base">
//         <TFGTokenIconElement size={"small"} />
//         <span className="ml-2 font-normal">{`Earn ${price} ${unit}`}</span>
//       </div>
//     </div>
//   );
// };

// SelectServicesFormPage.auth = true;
