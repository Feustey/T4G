// import React from "react";
// import { ButtonElement, StarRatingElement } from "@t4g/ui/elements";
// import { useAppContext } from "@t4g/ui/providers";
// import { Components } from "@t4g/types";
// import { SpinnerIconElement } from "@t4g/ui/icons";
// import dayjs from "dayjs";
// import { Api } from "@t4g/types";
// import { ReceiveServiceType } from "apps/dapp/types";

// export interface IServiceDeliveryDetail {
//   transaction: Api.Transaction;
//   service: ReceiveServiceType | undefined;
// }

// export const ServiceDeliveryDetail: React.FC<IServiceDeliveryDetail> =
//   function ({ transaction, service }: IServiceDeliveryDetail) {
//     const { setRightPanel, setNotification } = useAppContext();
//     const [isConsumed, setIsConsumed] = React.useState<boolean>(false);
//     const [isCanceled, setIsCanceled] = React.useState<boolean>(false);
//     const [rating, setRating] = React.useState<number>(0);
//     const [ctaDisabled, setCtaDisabled] = React.useState(false);

//     const { updateDisabled, setUpdateDisabled } = useAppContext();

//     return (
//       <div className="ServicesDetail px-8">
//         <div className="CardSelectElement__Section w-full">
//           <h2>Update</h2>
//           <h3 className="text-blue-005 mt-12 font-medium">
//             You booked a {service?.name} session .
//           </h3>
//           <span className="text-blue-008 p-0 m-0 text-sm">
//             #{transaction.dealId} (
//             {dayjs().to(dayjs(transaction.ts || Date.now()))})
//           </span>
//           <div className="grid grid-cols-2 gap-6 mt-6">
//             <CardElement
//               id={transaction.hash}
//               title="I want to confirm the session has taken place"
//               isSelected={isConsumed}
//               onClick={(id: string) => {
//                 setIsConsumed(true);
//                 setIsCanceled(false);
//               }}
//             />
//             <CardElement
//               id={transaction.hash}
//               title="I want to cancel this booking"
//               isSelected={isCanceled}
//               onClick={(id: string) => {
//                 setIsCanceled(true);
//                 setIsConsumed(false);
//               }}
//             />
//           </div>
//         </div>

//         {isConsumed && (
//           <div className="mt-12">
//             <p className="text-blue-005 my-2 text-base">
//               How would you rate this session?
//             </p>
//             <StarRatingElement
//               rating={rating}
//               onChange={(value: number) => setRating(value)}
//             />
//           </div>
//         )}

//         <div className="flex items-center w-full mt-12">
//           <ButtonElement
//             onClick={async () => {
//               setUpdateDisabled(false);
//               setCtaDisabled(true);
//               if (isCanceled) {
//                 await fetch(`/api/services/${transaction.dealId}/cancel`);
//                 console.log(
//                   "POST Transaction: Refund from escrow contract to Student"
//                 );
//                 setNotification({
//                   title: "Transaction",
//                   type: "spin",
//                   messageList: [
//                     {
//                       label: "Hash",
//                       value:
//                         "0xb5c8bd9430b6cc87a0e2fe110ece6bf527fa4f170a4bc8cd032f768fc5219838",
//                     },
//                     {
//                       label: "Type",
//                       value: "SERVICE_DELIVERY_CANCELED_BY_STUDENT",
//                     },
//                   ],
//                 });
//               } else {
//                 await fetch(`/api/services/${transaction.dealId}/validate`);
//                 setNotification({
//                   title: "Transaction",
//                   type: "spin",
//                   messageList: [
//                     {
//                       label: "Hash",
//                       value:
//                         "0xb5c8bd9430b6cc87a0e2fe110ece6bf527fa4f170a4bc8cd032f768fc5219838",
//                     },
//                     {
//                       label: "Type",
//                       value: "SERVICE_DELIVERY_CONFIRMED_BY_STUDENT",
//                     },
//                   ],
//                 });
//               }
//               // onUpdate()
//               setRightPanel(null);
//             }}
//             variant={{
//               hover: "hover:drop-shadow-md",
//               disabled: "bg-green-002",
//               text: "text-white",
//               border: "bg-green-001",
//               height: "h-40 lg:h-48",
//               width: "w-full",
//               active: "bg-white",
//             }}
//             disabled={ctaDisabled}
//           >
//             <>
//               <span>SAVE</span>{" "}
//               {ctaDisabled && (
//                 <div className="left-40 absolute w-6 h-6">
//                   <SpinnerIconElement size="small" />
//                 </div>
//               )}
//             </>
//           </ButtonElement>
//         </div>
//       </div>
//     );
//   };

// /**
//  * CardElement SubComponent
//  */
// interface CardElementProps {
//   id: string;
//   title: string;
//   isSelected: boolean;
//   onClick: any;
// }

// const CardElement= (function ({
//   id,
//   title,
//   isSelected,
//   onClick,
// }: CardElementProps) {
//   return (
//     <div
//       className={`ServiceDetail__CardElement  cursor-pointer text-blue-005 p-4  shadow-card border-2 ${
//         isSelected
//           ? "border-blue-002 text-blue-005"
//           : "border-transparent text-blue-007"
//       }  hover:border-blue-002  hover:text-blue-005 bg-white`}
//       onClick={(e) => {
//         e.preventDefault();
//         onClick(id);
//       }}
//     >
//       <h3 className="text-h3 text-blue-005 cursor-pointer hover:text-blue-005 font-medium leading-6">
//         {title}
//       </h3>
//     </div>
//   );
// };
