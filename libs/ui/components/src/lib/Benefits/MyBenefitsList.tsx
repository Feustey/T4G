// import React from "react";
// import {
//   t4gIconElement,
//   CoachingIconElement,
//   TFGTokenIconElement,
// } from "@t4g/ui/icons";
// import { LinkCardElement } from "@t4g/ui/elements";
// import { Components } from "@t4g/types";
// import { MentorsDetail } from "./MentorsDetail";
// import { useAppContext } from "@t4g/ui/providers";

// export const MyBenefitsList: React.FC<Components.Dasboard.MyBenefitsList.Props> =
//   function ({ list, recommended }: Components.Dasboard.MyBenefitsList.Props) {
//     const { setRightPanel } = useAppContext();
//     return (
//       <ul role="list" className="MyBenefitsList lg:grid-cols-2 grid grid-cols-1 gap-6">
//         {list.map((service) => (
//           <li
//             key={service.name}
//             onClick={(e) => {
//               e.preventDefault();
//               setRightPanel({
//                 component:
//                   service.category.name === "Mentoring" ? (
//                     <MentorsDetail service={service} />
//                   ) : (
//                     ""
//                   ),
//               });
//             }}
//           >
//             <LinkCardElement
//               link={{ text: "View details", href: "" }}
//               title={service.name}
//               components={{
//                 topLeft: (
//                   <div className="Label flex items-center bg-blue-001 text-blue-002 px-4 py-1.75 rounded-full text-10">
//                     <CoachingIconElement size="small" />
//                     <span className="ml-2 tracking-wider uppercase">
//                       {service.category.name}
//                     </span>
//                   </div>
//                 ),
//                 topRight: recommended.includes(service.id) ? (
//                   <div className="Label flex items-center border border-blue-008 text-blue-002 px-4 py-1.5 rounded-full text-10">
//                     <span className="text-blue-008 text-base">Suggestion</span>
//                   </div>
//                 ) : null,
//                 body: (
//                   <div className="flex flex-col pt-1 pb-6">
//                     <h3 className="text-h3 text-blue-005 mb-6 font-medium leading-6">
//                       {service.name}
//                     </h3>
//                     <p className="text-blue-007 text-base">{service.summary}</p>
//                     <p className="text-blue-007 flex mt-6 -mb-2 text-base">
//                       <span>
//                         <t4gIconElement size="small" />
//                       </span>
//                       <span className="ml-2">
//                         Provider:{" "}
//                         <span className="text-blue-005">
//                           {service.provider.firstName}{" "}
//                           {service.provider.lastName}
//                         </span>
//                       </span>
//                     </p>
//                   </div>
//                 ),
//                 bottomLeft: (
//                   <div className="text-orange-002 flex items-center text-base">
//                     <TFGTokenIconElement size={"small"} />
//                     <span className="ml-2">{`${service.price} tokens /  ${service.unit}`}</span>
//                   </div>
//                 ),
//               }}
//             />
//           </li>
//         ))}
//       </ul>
//     );
//   };
