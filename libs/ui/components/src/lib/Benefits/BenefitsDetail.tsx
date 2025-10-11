// import { Api, Components } from "@t4g/types";
// import React, { useState } from "react";
// import {
//   AvatarElement,
//   ButtonElement,
//   CardElement,
//   DividerElement,
// } from "@t4g/ui/elements";
// import { CoachingIconElement, TFGTokenIconElement } from "@t4g/ui/icons";
// import { EditorProps } from "react-draft-wysiwyg";
// import { convertFromRaw, EditorState } from "draft-js";
// import { mdToDraftjs } from "draftjs-md-converter";
// import dynamic, { LoaderComponent } from "next/dynamic";
// import { useAppContext } from "@t4g/ui/providers";
// import useSwr from "swr";
// import { useSession } from "next-auth/react";
// import { SessionType } from "@shared/types";

// const Editor = dynamic<EditorProps>(
//   () =>
//     import("react-draft-wysiwyg").then(
//       (mod) => mod.Editor
//     ) as LoaderComponent<EditorProps>,
//   { ssr: false }
// ) as React.FC<EditorProps>;

// export const BenefitsDetail: React.FC<Components.Benefits.BenefitsDetail.Props> =
//   function ({ service }: Components.Benefits.BenefitsDetail.Props) {
//     const { setRightPanel, setNotification } = useAppContext();

//     const fetcher = (url: string) => fetch(url).then((res) => res.json());
//     const { data: wallet } = useSwr(`/api/users/me/wallet`, fetcher); //TODO error
//     // const { data: session } = useSession()
//     const session = useSession().data as SessionType;

//     const [ctaDisabled, setCtaDisabled] = useState(false);
//     return (
//       <div className="BenefitsDetail">
//         <CardElement
//           variant="borderless"
//           divider={false}
//           components={{
//             topLeft: (
//               <div className="flex">
//                 <div className="Label flex items-center bg-blue-001 text-blue-002 px-4 py-1.75 rounded-full text-10">
//                   <CoachingIconElement size="small" />
//                   <span className="ml-2 tracking-wider uppercase">
//                     {service.category.name}
//                   </span>
//                 </div>
//                 <div className="text-orange-002 flex items-center ml-5 text-base">
//                   <TFGTokenIconElement size={"small"} />
//                   <span className="ml-2 font-normal">{`${service.price} tokens /  ${service.unit}`}</span>
//                 </div>
//               </div>
//             ),
//             body: (
//               <div className="flex pt-6 pb-6">
//                 <div className="min-w-[100px] h-[100px]">
//                   <AvatarElement size="fit" url={service.avatar} />
//                 </div>

//                 <div className="mt-4 ml-6">
//                   <h3>{service.name}</h3>
//                   <p className="text-blue-005 my-2 text-base">
//                     Provider: {service.provider.firstName}{" "}
//                     {service.provider.lastName}
//                   </p>
//                   <StarRatingElement rating={service.rating} />
//                 </div>
//               </div>
//             ),
//           }}
//         />

//         {wallet && session && service.id && (
//           <div className="flex items-center mt-2">
//             <ButtonElement
//               disabled={
//                 wallet.balance < service.price
//                   ? true
//                   : ctaDisabled === true
//                   ? true
//                   : false
//               }
//               onClick={async () => {
//                 setCtaDisabled(true);
//                 const response = await fetch(
//                   `/api/services/${service.id}/book`
//                 );
//                 const booking: Api.ServiceAction = await response.json();
//                 // sendNotification({
//                 //     payload: {
//                 //         to: session!.user?.email,
//                 //         name: service.name,
//                 //         serviceCategory: {
//                 //             name: service.category.name,
//                 //         },
//                 //         tokens: service.price,
//                 //     },
//                 //     type: 'SERVICE_REDEEMED_BY_ALUMNI',
//                 // });
//                 //
//                 // sendNotification({
//                 //     payload: {
//                 //         to: 'admin@token-for-good.com',
//                 //     },
//                 //     type: 'SERVICE_REDEEMED_BY_ALUMNI_ADMIN',
//                 // });

//                 console.log("booking", booking);
//                 setNotification({
//                   type: "spin",
//                   title: "Transaction",
//                   messageList: [
//                     {
//                       label: "Hash",
//                       value: booking.tx,
//                     },
//                     {
//                       label: "Type",
//                       value: "SERVICE_REDEEMED_BY_ALUMNI",
//                     },
//                   ],
//                 });
//                 setRightPanel(null);
//               }}
//               variant={{
//                 hover: "hover:drop-shadow-md",
//                 disabled: "bg-green-002",
//                 text: "text-white",
//                 border: "bg-green-001",
//                 height: "h-40 lg:h-48",
//                 width: "w-[582px]",
//               }}
//             >
//               <>
//                 <span>
//                   {" "}
//                   {wallet.balance > service.price
//                     ? "BOOK NOW"
//                     : "INSUFFICIENT BALANCE"}
//                 </span>{" "}
//               </>
//             </ButtonElement>
//           </div>
//         )}

//         {wallet && (
//           <div className="BulletList">
//             {wallet.balance > service.price && (
//               <div className="mt-3">
//                 <p className="text-blue-008 text-base">
//                   You will be contacted by the coach to arrange the
//                   practicalities of the session.
//                 </p>
//               </div>
//             )}

//             <DividerElement bleeding spacing="py-12" />

//             <p className="mb-6 text-base font-medium">More info</p>

//             <div className="MentorsDetail__Info w-[90%]">
//               <p className="text-blue-007 text-base leading-6">
//                 {service.summary}
//               </p>
//               <Editor
//                 editorClassName="editorClassName prose w-full self-stretch m-auto"
//                 readOnly
//                 toolbarHidden
//                 toolbar={{
//                   link: { showOpenOptionOnHover: false },
//                 }}
//                 editorState={
//                   service.description
//                     ? EditorState.createWithContent(
//                         convertFromRaw(mdToDraftjs(service.description))
//                       )
//                     : EditorState.createEmpty()
//                 }
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };
