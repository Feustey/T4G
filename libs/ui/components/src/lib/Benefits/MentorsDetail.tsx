// import React, { useEffect, useState } from "react";
// import {
//   CheckIconElement,
//   CoachingIconElement,
//   SpinnerIconElement,
//   TFGTokenIconElement,
// } from "@t4g/ui/icons";
// import {
//   AvatarElement,
//   ButtonElement,
//   CardElement,
//   DividerElement,
//   StarRatingElement,
//   TextElement,
// } from "@t4g/ui/elements";
// import { useAppContext } from "@t4g/ui/providers";
// import { ExperienceIconElement } from "@t4g/ui/icons";
// import { ExperienceCertificationIconElement } from "@t4g/ui/icons";
// import { Components } from "@t4g/types";
// import router, { NextRouter } from "next/router";
// import useSwr from "swr";
// import { Api } from "@t4g/types";
// import Service = Api.Service;
// import { AppProvider } from "../../../../../types/src/lib/providers/index.types";
// import Experience = Api.Experience;
// import { fetchMentorProposedServices } from "apps/dapp/services/proposedServicesAPI";
// import { alumniServices } from "apps/dapp/data/";

// export const MentorsDetail: React.FC<Components.Benefits.MentorsDetail.Props> =
//   function ({
//     service,
//     booked,
//     onServiceBooked = () => {
//       ("");
//     },
//   }: Components.Benefits.MentorsDetail.Props) {
//     const { setRightPanel, setNotification, setToaster } = useAppContext();

//     const fetcher = (url: string) => fetch(url).then((res) => res.json());
//     const { data: wallet } = useSwr(`/api/users/me/wallet`, fetcher); //TODO error
//     const { data: minicv } = useSwr(
//       `/api/users/${service.provider.id}/cv`,
//       fetcher
//     ); //TODO error

//     const [annotations, setAnnotations] = useState<string[] | undefined>([]);

//     async function getMentorAnnotations() {
//       const proposedServices: string[] = await fetchMentorProposedServices(
//         service.provider.id
//       );

//       const alumniStudentMentorServices: string[] =
//         alumniServices.studentMentor.map((service) => service.name);
//       let annotations;
//       switch (service.category.name) {
//         case "Mentoring":
//           annotations = proposedServices?.filter((service) =>
//             alumniStudentMentorServices.includes(service)
//           );
//           break;

//         default:
//           break;
//       }
//       return annotations;
//     }

//     useEffect(() => {
//       async function fetchAnnotations() {
//         const fetchedAnnotations = await getMentorAnnotations();
//         setAnnotations(fetchedAnnotations);
//       }
//       fetchAnnotations();
//     }, [alumniServices, service]);

//     useEffect(() => {
//       console.log("annotations : ", annotations);
//     }, [annotations]);

//     const [ctaDisabled, setCtaDisabled] = useState(false);

//     if (!wallet || !minicv) return <div></div>;

//     return (
//       <div>
//         <CardElement
//           variant="borderless"
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
//                   <span className="ml-2 font-normal">{`${service.price}  tokens / 1 hour`}</span>
//                 </div>
//               </div>
//             ),

//             body: (
//               <div className="flex pt-6 pb-8">
//                 <div className="min-w-[100px] h-[100px]">
//                   <AvatarElement
//                     size="fit"
//                     fetchUrl={`/api/users/${service.provider.id}/avatar`}
//                     user={{
//                       firstname: minicv.firstName ?? "",
//                       lastname: minicv.lastName ?? "",
//                       email: "",
//                     }}
//                   />
//                 </div>

//                 <div className="mt-4 ml-6">
//                   <h3 className="text-h1 text-blue-005 mb-4 font-medium leading-10">
//                     {service.name}
//                   </h3>
//                   <p className="text-blue-005 my-2 text-base">
//                     {minicv.experiences.length > 0
//                       ? minicv.experiences[0]?.title
//                       : ""}
//                     {" at "}
//                     {minicv.experiences.length > 0
//                       ? minicv.experiences[0]?.company
//                       : ""}
//                   </p>
//                   <StarRatingElement rating={service.rating} />
//                 </div>
//               </div>
//             ),
//           }}
//         />
//         <div className="BulletList mt-2">
//           <p className="text-blue-005 font-medium">Reach out to me for:</p>
//           {annotations && (
//             <ul role="list" >
//               {annotations.map((annotation: string, index: number) => (
//                 <li key={index}>
//                   <div className="flex items-center mt-4">
//                     <CheckIconElement size="small" />
//                     <p className="ml-2.5 text-blue-005">{annotation}</p>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}

//           {booked === true && (
//             <div className="mt-8">
//               <TextElement className="text-red-500">{`You have already booked a mentoring session with ${service.name}.`}</TextElement>
//             </div>
//           )}

//           <div
//             className={
//               booked === true
//                 ? "relative flex items-center mt-2"
//                 : "relative flex items-center mt-8"
//             }
//           >
//             <ButtonElement
//               disabled={
//                 booked === true
//                   ? true
//                   : wallet.balance < service.price
//                   ? true
//                   : ctaDisabled === true
//                   ? true
//                   : false
//               }
//               onClick={async () =>
//                 bookService(
//                   setCtaDisabled,
//                   service,
//                   setToaster,
//                   onServiceBooked,
//                   setRightPanel,
//                   router
//                 )
//               }
//               variant={{
//                 hover: "hover:drop-shadow-md",
//                 disabled: "bg-green-002",
//                 text: "text-white",
//                 border: "bg-green-001",
//                 height: "h-40 lg:h-48",
//                 width: "w-[532px]",
//                 active: "",
//               }}
//               //disabled={ctaDisabled}
//             >
//               <>
//                 <span>
//                   {" "}
//                   {wallet.balance > service.price
//                     ? "BOOK A SESSION"
//                     : "INSUFFICIENT BALANCE"}
//                 </span>{" "}
//                 {ctaDisabled && (
//                   <div className="left-40 absolute w-6 h-6">
//                     <SpinnerIconElement size="small" />
//                   </div>
//                 )}
//               </>
//             </ButtonElement>
//           </div>

//           {wallet.balance > service.price && (
//             <div className="mt-3">
//               <p className="text-blue-008 text-base">
//                 You will be contacted by the mentor to arrange the
//                 practicalities of the session.
//               </p>
//             </div>
//           )}
//           <DividerElement bleeding spacing="py-12" />

//           <p className="text-blue-005 mb-6 font-medium">More info</p>

//           <div className="MentorsDetail__Info">
//             <p className="text-10 text-blue-007 tracking-wider">
//               PROFESSIONAL EXPERIENCE
//             </p>

//             <ul role="list" >
//               {minicv.experiences.map((experience: Experience, i: number) => (
//                 <li key={i + experience.title}>
//                   <div className="flex pt-5">
//                     <ExperienceIconElement size="small" />
//                     <div className="ml-5">
//                       <p className="text-blue-005 font-medium">
//                         {experience?.title}
//                         <span className="font-normal">
//                           {" — "}
//                           {experience?.company}
//                         </span>
//                         {i === 0 && (
//                           <span className="text-green-001 ml-2 text-base font-normal">
//                             current
//                           </span>
//                         )}
//                       </p>
//                       <p className="text-blue-007 text-base">
//                         <span>
//                           {experience?.city
//                             ? `${
//                                 experience?.city.charAt(0).toUpperCase() +
//                                 experience?.city.slice(1)
//                               } - `
//                             : ""}
//                           {experience.country}
//                         </span>{" "}
//                         {" / "}{" "}
//                         <span>
//                           {
//                             new Date(experience.from)
//                               .toDateString()
//                               .split(" ")[1]
//                           }{" "}
//                           {
//                             new Date(experience.from)
//                               .toDateString()
//                               .split(" ")[3]
//                           }
//                         </span>{" "}
//                         {" - "}{" "}
//                         <span>
//                           {experience.isCurrent ? (
//                             "Now"
//                           ) : experience?.to ? (
//                             <>
//                               {
//                                 new Date(experience?.to)
//                                   .toDateString()
//                                   .split(" ")[1]
//                               }{" "}
//                               {
//                                 new Date(experience?.to)
//                                   .toDateString()
//                                   .split(" ")[3]
//                               }
//                             </>
//                           ) : (
//                             "Now"
//                           )}
//                         </span>
//                       </p>
//                       <p className="text-blue-007 text-base">
//                         {experience?.industry}
//                       </p>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div className="MentorsDetail__Info mt-12">
//             <p className="text-10 text-blue-007 tracking-wider">
//               t4g PROGRAM
//             </p>

//             <div key={service.provider.id}>
//               <div className="flex pt-5">
//                 <ExperienceCertificationIconElement size="small" />
//                 <div className="ml-5">
//                   <p className="text-blue-005 font-medium">{minicv.program}</p>
//                   <p className="text-blue-007 text-base">
//                     Graduated: {minicv.graduated}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

// async function bookService(
//   setCtaDisabled: React.Dispatch<React.SetStateAction<boolean>>,
//   service: Service,
//   setToaster: React.Dispatch<
//     React.SetStateAction<AppProvider.INotification | undefined>
//   >,
//   onServiceBooked: () => any,
//   setRightPanel: (o: any) => any,
//   router: NextRouter
// ) {
//   setCtaDisabled(true);
//   fetch(`/api/services/${service.id}/book`)
//     .then((res) => res.json())
//     .then((response) => {
//       console.log("response", response);
//       if (response.status === "success") {
//         setToaster({
//           type: "success",
//           title: "Transaction",
//           link: "/wallet",
//           messageList: [
//             {
//               label: "Hash",
//               value: response.tx,
//             },
//             {
//               label: "Type",
//               value: `Benefits: Redeemed - Mentoring - Tokens out: ${service.price}`,
//               wrap: true,
//             },
//             {
//               label: "Message",
//               value: `  You have correctly requested a session and the Mentor ${service.provider.firstName} ${service.provider.lastName}will get back to you`,
//               wrap: true,
//             },
//           ],
//         });
//       }
//       if (onServiceBooked) {
//         onServiceBooked();
//       }
//       setRightPanel(null);
//       router.push("/dashboard");
//     });
// }
