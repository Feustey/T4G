// import { Components } from "@t4g/types";
// import React from "react";
// import { ButtonElement, DividerElement } from "@t4g/ui/elements";
// import { ServiceDeliveryDetail } from "./ServiceDeliveryDetail";
// import { useAppContext } from "@t4g/ui/providers";
// import { Api } from "@t4g/types";
// import dayjs from "dayjs";
// import { ReceiveServiceType } from "../../../../../../apps/dapp/types";

// export interface IBenefitDeliveryList {
//   transactions: Array<Api.Transaction>;
//   services: ReceiveServiceType[];
// }

// export const BenefitDeliveryList= (({
//   transactions,
//   services,
// }) => {
//   const { setRightPanel } = useAppContext();
//   const { updateDisabled } = useAppContext();

//   function getService(serviceId: number): ReceiveServiceType | undefined {
//     return services?.find((s) => s.blockchainId === serviceId);
//   }

//   return (
//     <ul role="list" className="ServiceDeliveryList text-blue-005 p-0 text-base" role="list">
//       {transactions.map((transaction, i) => (
//         <li
//           id={"tx#" + transaction.hash}
//           key={transaction.hash}
//           className="NotificationsListItem"
//         >
//           <div className="  text-blue-005 p-5 text-base bg-white">
//             <span className="text-blue-008 p-0 m-0 text-sm">
//               #{transaction.dealId} (
//               {dayjs().to(dayjs(transaction.ts || Date.now()))})
//             </span>
//             <h4 className="text-h4 font-medium text-blue-005">
//               You booked a {getService(Number(transaction.serviceId))?.name} session.
//             </h4>
//             <div className="flex items-center justify-between">
//               <p className="text-blue-007 pr-20 mt-2 text-base">
//                 Please update us once the session has taken place. If for any
//                 reason the session did not take place, you can cancel your
//                 booking and your tokens will be refunded.
//               </p>
//               <ButtonElement
//                 disabled={updateDisabled}
//                 onClick={(e) => {
//                   e.preventDefault();
//                   setRightPanel({
//                     component: (
//                       <ServiceDeliveryDetail
//                         transaction={transaction}
//                         service={getService(Number(transaction.serviceId))}
//                         // onUpdate={onUpdate}
//                       />
//                     ),
//                   });
//                 }}
//                 variant={{
//                   text: "font-semibold text-base text-white",
//                   border: "border border-blue-003",
//                   height: "h-40 lg:h-48",
//                   width: "",
//                   disabled: "bg-green-002",
//                   active: "bg-green-001 text-white",
//                   hover: "",
//                 }}
//               >
//                 {updateDisabled ? "PENDING TRANSACTION no" : "UPDATE"}
//               </ButtonElement>
//             </div>
//           </div>
//           {i !== transactions.length - 1 && (
//             <DividerElement spacing="pt-8" bleeding />
//           )}
//         </li>
//       ))}
//     </ul>
//   );
// };
