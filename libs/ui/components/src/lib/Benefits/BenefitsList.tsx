// import React from "react";
// import { useAppContext } from "@t4g/ui/providers";
// import { Components } from "@t4g/types";
// import useSwr from "swr";
// import { BenefitMentoring } from "./BenefitMentoring";
// import { Benefit } from "./Benefit";

// export const BenefitsList: React.FC<Components.Benefits.BenefitsList.Props> =
//   function ({
//     services,
//     variant,
//     bookedServices,
//     isLoading,
//     onServiceBooked = () => {
//       console.log("onServiceBooked ignored");
//     },
//   }: Components.Benefits.BenefitsList.Props) {
//     if (!services) {
//       return <p>loading</p>;
//     }
//     return (
//       <ul
//         className={`CoachingList grid grid-cols-1 ${
//           variant === "dashboard" ? "lg:grid-cols-2" : "lg:grid-cols-3"
//         } gap-6`}
//       >
//         {services.length > 0 &&
//           services
//             .filter((service) => service.category.name === "Mentoring")
//             .sort((a, b) => b.blockchainId - a.blockchainId)
//             .map((service, i) => (
//               <BenefitMentoring
//                 key={i}
//                 service={service}
//                 isLoading={isLoading}
//               />
//             ))}

//         {services
//           .filter(
//             (service) => service && service.category?.name !== "Mentoring"
//           )
//           .map((service, i) => (
//             <Benefit key={i} service={service} isLoading={isLoading} />
//           ))}
//       </ul>
//     );
//   };
