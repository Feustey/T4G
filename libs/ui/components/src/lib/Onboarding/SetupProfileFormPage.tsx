// import { Api } from "@t4g/types";
// import Resizer from "react-image-file-resizer";
// import {
//   ButtonElement,
//   DividerElement,
//   SelectElement,
//   TextInputElement,
//   yearsStudent,
//   programTopics,
// } from "@t4g/ui/elements";
// import {
//   DeleteIconElement,
//   EditIconElement,
//   ExperienceIconElement,
// } from "@t4g/ui/icons";
// import { useAppContext } from "@t4g/ui/providers";
// import React, { Dispatch, SetStateAction, useEffect } from "react";
// import { CreateExperienceForm } from "./CreateExperienceForm";
// import { EditExperienceForm } from "./EditExperienceForm";
// import useSwr from "swr";
// import moment from "moment/moment";
// import { useAuth } from '@/contexts/AuthContext';
// import { SessionType, UserType } from "@shared/types";

// interface SetupProfileFormPageProps {
//   setDisableNext: Dispatch<SetStateAction<boolean>>;
// }

// const resizeFile = (file: any) =>
//   new Promise((resolve) => {
//     Resizer.imageFileResizer(
//       file,
//       200,
//       200,
//       "JPEG",
//       100,
//       0,
//       (uri) => {
//         resolve(uri);
//       },
//       "base64"
//     );
//   });

// export const SetupProfileFormPage: React.FC<SetupProfileFormPageProps> & {
//   auth: boolean;
// } = function ({ setDisableNext }: SetupProfileFormPageProps) {
//   const { setModal } = useAppContext();
//   const fileRef = React.useRef<HTMLInputElement>(null);

//   const session = useSession().data as SessionType;
//   const user: UserType = session!.user;

//   const fetcher = (url: string) =>
//     fetch(url)
//       .then((res) => res.json())
//       .catch((e) => console.error(e));
//   const { data: experiences, mutate: refreshExperiences } = useSwr<
//     Api.Experience[]
//   >(`/api/experiences`, fetcher); //TODO error
//   const { data: cv, mutate: refreshCv } = useSwr<Api.CV>(
//     `/api/users/me/cv`,
//     fetcher
//   );
//   const { data: me } = useSwr<Api.User>(`/api/users/me`, fetcher);
//   const rawFetcher = (url: string) =>
//     fetch(url)
//       .then((res) => res.text())
//       .catch((e) => console.error(e));

//   const { data: avatarImage, mutate: refreshAvatar } = useSwr(
//     `/api/users/${user?.id}/avatar`,
//     rawFetcher
//   );

//   useEffect(() => {
//     setDisableNext(!cv?.program || !cv?.graduatedYear || !cv?.topic);
//   }, [experiences, cv]);

//   function deleteExperience(experienceId: string) {
//     fetch(`/api/experiences/${experienceId}`, {
//       method: "DELETE",
//     }).then((response) => {
//       return refreshExperiences();
//     });
//   }

//   if (!cv || !experiences) return <span>loading...</span>;

//   function updateAvatar(image: string | undefined) {
//     fetch(`/api/users/${user?.id}/avatar`, {
//       method: "POST",
//       headers: { "Content-Type": "text/plain" },
//       body: image,
//     }).then((response) => {
//       if (response.ok) {
//         refreshAvatar();
//       } else {
//         response.text().then(console.error);
//       }
//     });
//   }

//   function setYear(year: number) {
//     fetch(`/api/users/me/cv`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ graduatedYear: year }),
//     }).then(() => refreshCv());
//   }
//   function setProgram(program: string) {
//     fetch(`/api/users/me/cv`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ program }),
//     }).then(() => refreshCv());
//   }
//   function setTopic(topic: string) {
//     fetch(`/api/users/me/cv`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ topic }),
//     }).then(() => refreshCv());
//   }

//   return (
//     <>
//       <div className="OnboardingForm__Section text-blue-005 flex flex-col">
//         <h2 className="text-25 font-medium">You and t4g</h2>
//         <div className="mt-4">
//           <div className="lg:flex-row flex flex-col justify-between w-full">
//             <label htmlFor="program" className="inline-block mr-2">
//               At t4g Business school, I{" "}
//               {user?.role === "ALUMNI" ? "completed" : "follow"} the program:
//             </label>

//             <div className="lg:-mt-1 z-40 flex-grow inline-block">
//               <SelectElement
//                 id="program"
//                 value={cv?.program || "Please select"}
//                 label="Please select"
//                 variant="theme"
//                 options={[
//                   {
//                     value: "Grande Ecole",
//                     label: "Grande Ecole",
//                   },
//                   {
//                     value: "MBA",
//                     label: "MBA",
//                   },
//                   {
//                     value: "Master spécialisé",
//                     label: "Master spécialisé",
//                   },
//                   {
//                     value: "MSC",
//                     label: "MSC",
//                   },
//                   {
//                     value: "Bachelor & BBA",
//                     label: "Bachelor & BBA",
//                   },
//                   {
//                     value: "SciencesCom",
//                     label: "SciencesCom",
//                   },
//                   {
//                     value: "Executive Education / Formation Continue",
//                     label: "Executive Education / Formation Continue",
//                   },
//                   {
//                     value: "DBA",
//                     label: "DBA",
//                   },
//                 ]}
//                 handleChange={(value) => {
//                   setProgram(value);
//                 }}
//               />
//             </div>
//           </div>
//           <div className="flex justify-between w-full mt-4">
//             <label htmlFor="year" className="ml-2 mr-2">
//               {user?.role === "ALUMNI" ? "In" : "Which I started in"}
//             </label>
//             {user?.role === "STUDENT" && (
//               <div className="z-30 flex-grow inline-block -mt-2">
//                 <SelectElement
//                   id="yearStu"
//                   inline
//                   label="Please select"
//                   value={cv?.graduatedYear?.toString() || "Please select"}
//                   variant="theme"
//                   options={yearsStudent}
//                   handleChange={(value) => {
//                     setYear(+value);
//                   }}
//                 />
//               </div>
//             )}
//             {user?.role === "ALUMNI" && (
//               <div className="z-30 flex-grow inline-block -mt-4">
//                 <TextInputElement
//                   className="w-28"
//                   name="year"
//                   type="number"
//                   min={1950}
//                   max={new Date().getFullYear()}
//                   placeholder="e.g. 1998"
//                   value={cv?.graduatedYear?.toString() || "Please select"}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                     setYear(+e.target.value);
//                   }}
//                 />
//               </div>
//             )}
//           </div>
//           <div className="flex justify-between w-full mt-4">
//             <label htmlFor="topic" className="ml-2 mr-2">
//               on the topic
//             </label>
//             <div className="flex-grow inline-block -mt-2">
//               <SelectElement
//                 id="topic"
//                 inline
//                 listHeight={300}
//                 label="Please select"
//                 value={cv?.topic || "Please select"}
//                 variant="theme"
//                 options={programTopics}
//                 handleChange={(value) => {
//                   setTopic(value);
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//         <DividerElement bleeding spacing="py-12" />
//       </div>
//       {user?.role === "ALUMNI" && (
//         <div className="OnboardingForm__Section">
//           <h2 className="text-25 text-blue-005 font-medium">
//             Professional experience
//           </h2>

//           <ul role="list" >
//             {experiences &&
//               experiences.map((experience, i) => (
//                 <li key={experience.id}>
//                   <div className="flex pt-5">
//                     <ExperienceIconElement size="small" />
//                     <div className="w-full ml-5">
//                       <div className="flex justify-between text-base font-medium">
//                         <div>
//                           <span>{experience.title}</span>
//                           <span className="font-normal">
//                             {" — "}
//                             {experience.company}
//                           </span>
//                         </div>
//                         <div className="flex justify-between w-10 cursor-pointer">
//                           <span
//                             className="EditIcon text-blue-007 hover:text-blue-005"
//                             onClick={(e) => {
//                               e.preventDefault();
//                               setModal({
//                                 component: (
//                                   <EditExperienceForm data={experience} />
//                                 ),
//                               });
//                             }}
//                           >
//                             <EditIconElement size="small" />
//                           </span>
//                           <span
//                             className="DeleteIcon text-blue-007 hover:text-blue-005"
//                             onClick={() => {
//                               deleteExperience(experience.id);
//                             }}
//                           >
//                             <DeleteIconElement size="small" />
//                           </span>
//                         </div>
//                       </div>
//                       <p className="text-blue-007 text-base">
//                         <span>{experience.country}</span> {" / "}{" "}
//                         <span>
//                           {moment(experience.from).format("MMM YYYY")}
//                         </span>{" "}
//                         {" - "}{" "}
//                         <span>
//                           {experience.isCurrent
//                             ? "Now"
//                             : moment(experience.to).format("MMM YYYY")}
//                         </span>
//                       </p>
//                       <p className="text-blue-007 text-base">
//                         {experience.industry}
//                       </p>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//           </ul>

//           <ButtonElement
//             onClick={(e) => {
//               e.preventDefault();
//               setModal({
//                 component: (
//                   <CreateExperienceForm onNewExperience={refreshExperiences} />
//                 ),
//               });
//             }}
//             variant={{
//               hover:
//                 "hover:border-1 hover:border-blue-011 hover:text-blue-002 hover:shadow-none hover:font-normal",
//               text: "text-base font-normal",
//               border: "border border-dashed border-blue-003",
//               height: "mt-8 h-40 lg:h-48",
//               width: "w-full",
//               active: "bg-white text-blue-008",
//             }}
//           >
//             + Add a professional experience
//           </ButtonElement>
//           <DividerElement bleeding spacing="py-12" />
//         </div>
//       )}
//       <div className="OnboardingForm__Section text-blue-005">
//         <h2 className="text-25 font-medium">Profile photo</h2>
//         <div className="mt-4">
//           <div className="flex justify-between">
//             <>
//               <label htmlFor="program" className="mr-2">
//                 People are more likely to reach out if they can see your photo.
//               </label>
//               {avatarImage && (
//                 <div className="flex justify-between w-10 cursor-pointer">
//                   <span
//                     className="text-blue-007 hover:text-blue-005"
//                     onClick={() => {
//                       fileRef.current?.click();
//                     }}
//                   >
//                     <EditIconElement size="small" />
//                   </span>
//                   <span
//                     className="text-blue-007 hover:text-blue-005"
//                     onClick={() => {
//                       updateAvatar(undefined);
//                     }}
//                   >
//                     <DeleteIconElement size="small" />
//                   </span>
//                 </div>
//               )}
//             </>
//           </div>
//           <div className="w-25 h-25 mt-6">
//             <div
//               style={{ cursor: "pointer" }}
//               className="border-blue-003 hover:border-1 hover:border-blue-011 text-blue-008 hover:text-blue-002 relative flex flex-col items-center justify-center inline-block w-full h-full overflow-hidden text-base border border-dashed rounded-full"
//             >
//               <>
//                 <input
//                   ref={fileRef}
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     position: "absolute",
//                     opacity: 0,
//                     cursor: "pointer",
//                   }}
//                   title=""
//                   type="file"
//                   name="file"
//                   onChange={async (e: any) => {
//                     const reader = new FileReader();
//                     if (e.target.files[0]) {
//                       const image = await resizeFile(e.target.files[0]);
//                       reader.readAsDataURL(e.target.files[0]);
//                       reader.onload = (e) => {
//                         updateAvatar(image as string);
//                       };
//                     }
//                   }}
//                 />
//                 {!avatarImage && (
//                   <>
//                     <span className="">+</span>{" "}
//                     <span className="">Add profile</span>
//                   </>
//                 )}
//                 {avatarImage && (
//                   <img
//                     className="object-cover rounded-full"
//                     src={avatarImage}
//                     alt="avatar"
//                     width="100px"
//                     height="100px"
//                   />
//                 )}
//               </>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// SetupProfileFormPage.auth = true;
