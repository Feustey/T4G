// import React from "react";
// import { Api, Components } from "@t4g/types";
// import { useSession } from "next-auth/react";
// import useSwr from "swr";
// import { ServiceCategory } from "@t4g/service/data";
// import { Spinner } from "../../../../../../apps/dapp/components";
// import { SessionType, UserType } from "@shared/types";

// export const SelectBenefitCategoriesFormPage: React.FC<Components.Onboarding.SelectBenefitCategoriesFormPage.Props> & {
//   auth: boolean;
// } = function ({
//   setDisableNext,
//   lang,
// }: Components.Onboarding.SelectBenefitCategoriesFormPage.Props) {
//   const session = useSession().data as SessionType;
//   const user: UserType = session!.user;

//   const fetcher = (url: string) => fetch(url).then((res) => res.json());
//   const { data: categories } = useSwr<Api.Category[]>(
//     `/api/service-categories/as_consumer`,
//     fetcher
//   ); //TODO error
//   const { data: myCategories, mutate: refreshMyCategories } = useSwr<string[]>(
//     `/api/users/me/preferred-categories`,
//     fetcher
//   ); //TODO error

//   React.useEffect(() => {
//     myCategories && myCategories.length > 0
//       ? setDisableNext(false)
//       : setDisableNext(true);
//   }, [myCategories]);

//   async function updatePreferredCategories(payload: string[]) {
//     console.log("updatePreferredCategories", payload, myCategories);

//     await refreshMyCategories(payload, false);
//     await fetch(`/api/users/me/preferred-categories`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });
//   }

//   if (!categories || !myCategories) return <Spinner lang={lang} />;
//   console.log("categories", categories);
//   return (
//     <div className="SelectBenefitsFormPage CardSelectElement w-full">
//       <div className="sm:grid-cols-1 md:grid-cols-2 grid w-full gap-6">
//         {categories.map((category) => (
//           <CardElement
//             id={category.id}
//             key={category.id}
//             title={category.name}
//             isSelected={myCategories.includes(category.id)}
//             disabled={category.disabled ?? false}
//             onClick={(id: string) => {
//               let payload: any = [];
//               if (!myCategories.includes(category.id)) {
//                 payload = [...myCategories, id];
//               } else {
//                 payload = myCategories.filter((v: string) => v !== id);
//               }
//               updatePreferredCategories(payload);
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// /**
//  * CardElement SubComponent
//  */
// interface CardElementProps {
//   id: string;
//   title: string;
//   isSelected: boolean;
//   disabled: boolean;
//   onClick: any;
// }

// const CardElement= (function ({
//   id,
//   title,
//   isSelected,
//   disabled,
//   onClick,
// }: CardElementProps) {
//   return (
//     <div
//       className={`CardSelectElement__Card flex items-center p-4 h-auto  border-2 ${
//         isSelected
//           ? "border-blue-002 text-blue-005"
//           : "border-transparent text-blue-005"
//       } ${
//         isSelected
//           ? "hover:border-blue002 hover:text-blue-005"
//           : "hover:border-transparent hover:text-blue-005"
//       } ${disabled ? "bg-gray-020" : "shadow-card cursor-pointer"}`}
//       onClick={(e) => {
//         e.preventDefault();
//         !disabled && onClick(id);
//       }}
//     >
//       <h3
//         className={`text-h3 font-medium leading-6 ${
//           disabled ? "text-gray-500" : ""
//         }`}
//       >
//         {title}
//       </h3>
//     </div>
//   );
// };

// SelectBenefitCategoriesFormPage.auth = true;
