// import React from "react";
// import {
//   t4gIconElement,
//   ServiceCategoryIconElement,
//   TFGTokenIconElement,
// } from "@t4g/ui/icons";
// import { useAppContext } from "@t4g/ui/providers";
// import { Components } from "@t4g/types";
// import { BenefitsDetail } from "./BenefitsDetail";
// import useSwr from "swr";
// import { LinkCardElement } from "@t4g/ui/elements";

// export const Benefit= (function ({
//   service,
//   variant,
//   bookedServices,
//   isLoading,
//   onServiceBooked = () => {
//     console.log("onServiceBooked ignored");
//   },
// }: Components.Benefits.Benefit.Props) {
//   const fetcher = (url: string) => fetch(url).then((res) => res.json());
//   const { data: proposedServices } = useSwr<string[]>(
//     `/api/users/me/proposed-services`,
//     fetcher
//   ); //TODO error

//   console.log("service", proposedServices);

//   const { setRightPanel } = useAppContext();
//   if (!service) {
//     return <p>loading</p>;
//   }
//   return (
//     <li
//       // key={service}
//       onClick={() =>
//         setRightPanel({
//           component: <BenefitsDetail service={service} />,
//         })
//       }
//     >
//       <LinkCardElement
//         link={{ text: "View details", href: "#" }}
//         components={{
//           topLeft: (
//             <div className="Label flex items-center bg-blue-001 text-blue-002 px-4 py-1.75 rounded-full text-10">
//               <ServiceCategoryIconElement
//                 category={service.category?.name}
//                 size="small"
//               />
//               <span className="ml-2 tracking-wider uppercase">
//                 {service.category?.name}
//               </span>
//             </div>
//           ),
//           topRight: proposedServices?.includes(service.category?.id) ? (
//             <div className="Label flex items-center border border-blue-008 text-blue-002 px-4 py-1.5 rounded-full text-10">
//               <span className="text-blue-008 text-base">Suggestion</span>
//             </div>
//           ) : (
//             <></>
//           ),
//           bottomLeft: (
//             <div className="text-orange-002 flex items-center text-base">
//               <TFGTokenIconElement size={"small"} />
//               <span className="ml-2">{`${service.price} tokens / ${service.unit}`}</span>
//             </div>
//           ),
//           body: (
//             <div className="flex flex-col pt-1 pb-6">
//               <h3 className="text-h3 text-blue-005 mb-4 font-medium leading-6">
//                 {service.name}
//               </h3>
//               <p className="text-blue-007 my-1 text-base">{service.summary}</p>
//               <p className="text-blue-007 flex mt-3 text-base">
//                 <span>
//                   <t4gIconElement size="small" />
//                 </span>
//                 <span className="ml-2">
//                   Provider:{" "}
//                   <span className="text-blue-005">
//                     {service.provider?.firstName} {service.provider?.lastName}
//                   </span>
//                 </span>
//               </p>
//             </div>
//           ),
//         }}
//       />
//     </li>
//   );
// };
