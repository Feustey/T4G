// import React from "react";
// import { CoachingIconElement, TFGTokenIconElement } from "@t4g/ui/icons";
// import { AvatarElement, LinkCardElement } from "@t4g/ui/elements";
// import { useAppContext } from "@t4g/ui/providers";
// import { MentorsDetail } from "./MentorsDetail";
// import { Components } from "@t4g/types";

// export const MentorsList: React.FC<Components.Benefits.MentorsList.Props> =
//   function ({
//     services,
//     variant,
//     bookedServices,
//   }: Components.Benefits.MentorsList.Props) {
//     const { setRightPanel } = useAppContext();

//     //TODO get recommended services for user
//     const proposedServices = Array<string>(); //user.preferences.recommendedServices

//     return (
//       <ul
//         className={`MentorsList grid grid-cols-1 ${
//           variant === "dashboard" ? "lg:grid-cols-2" : "lg:grid-cols-3"
//         } gap-6`}
//       >
//         {services
//           .filter((service) => service.category.name === "Mentoring")
//           .sort((a, b) => b.blockchainId - a.blockchainId)
//           .map((service, i) => {
//             return (
//               <li
//                 key={service.id}
//                 onClick={() =>
//                   setRightPanel({
//                     component: (
//                       <MentorsDetail
//                         service={service}
//                         booked={bookedServices?.includes(
//                           service.blockchainId?.toString() || ""
//                         )}
//                       />
//                     ),
//                   })
//                 }
//               >
//                 <LinkCardElement
//                   link={{ text: "View details", href: "#" }}
//                   components={{
//                     topLeft: (
//                       <div className="Label flex items-center bg-blue-001 text-blue-002 px-4 py-1.75 rounded-full text-10">
//                         <CoachingIconElement size="small" />
//                         <span className="ml-2 tracking-wider uppercase">
//                           {service.category.name}
//                         </span>
//                       </div>
//                     ),
//                     topRight: proposedServices.includes(service.id) ? (
//                       <div className="Label flex items-center border border-blue-008 text-blue-002 px-4 py-1.5 rounded-full text-10">
//                         <span className="text-blue-008 text-base">
//                           Suggestion
//                         </span>
//                       </div>
//                     ) : (
//                       <></>
//                     ),
//                     bottomLeft: (
//                       <div className="text-orange-002 flex items-center text-base">
//                         <TFGTokenIconElement size={"small"} />
//                         <span className="ml-2">{`${service.price} tokens / ${service.unit}`}</span>
//                       </div>
//                     ),
//                     body: (
//                       <div className="flex pt-1 pb-6">
//                         <div className="min-w-[100px] h-[100px]">
//                           <AvatarElement
//                             size="fit"
//                             user={{
//                               firstname: service.name.split(" ")[0],
//                               lastname: service.name.split(" ")[1],
//                               email: "",
//                             }}
//                             fetchUrl={`/api/users/${service.provider.id}/avatar`}
//                           />
//                         </div>

//                         <div className="ml-6">
//                           <h3 className="text-h3 text-blue-005 mb-4 font-medium">
//                             {service.name}
//                           </h3>
//                           {/*<p className="text-blue-007 my-1 text-base">*/}
//                           {/*  {service.provider.experience.length > 0 ? service.provider.experience[0].title : ''}{' '}*/}
//                           {/*  {service.provider.experience.length > 0 ? ' at ' : ''}{' '}*/}
//                           {/*  {service.provider.experience.length > 0 ? service.provider.experience[0].company : ''}*/}
//                           {/*</p>*/}
//                           {/*<p className="text-blue-007 my-1 text-base">*/}
//                           {/*  {service.provider.experience.length > 0 ? service.provider.experience[0].country : ''}*/}
//                           {/*</p>*/}
//                           {/*<p className="text-blue-007 my-1 text-base">*/}
//                           {/*  {service.provider.experience.length > 0 ? service.provider.experience[0].industry : ''}*/}
//                           {/*  {service.provider.experience.length > 0 ? ' - ' : ''}*/}
//                           {/*  {service.provider.experience.length > 0 ? service.provider.experience[0].role : ''}*/}
//                           {/*</p>*/}
//                         </div>
//                       </div>
//                     ),
//                   }}
//                 />
//               </li>
//             );
//           })}
//       </ul>
//     );
//   };
