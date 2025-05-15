// "use client";

// import { useState } from "react";
// import {
//   Clock,
//   Plus,
//   Trash2,
//   ChevronDown,
//   ChevronUp,
//   Calendar,
//   MoreHorizontal,
// } from "lucide-react";
// import { useFieldArray, useForm } from "react-hook-form";
// import { api } from "@/trpc/react";

// export default function TimesheetUI() {
//   const utils = api.useUtils();
//   const { data: projects, isLoading: projectsLoading } =
//     api.project.getToday.useQuery();

//   // Sort activities by descending creation date (newest first)
//   const sortedProjects = projects?.map((project) => ({
//     ...project,
//     activities: [...project.activities].sort(
//       (a, b) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//     ),
//   }));

//   const [isAdding, setIsAdding] = useState(false);
//   const [expandedProject, setExpandedProject] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     control,
//     watch,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     defaultValues: {
//       entries: [
//         {
//           about: "",
//           hoursWorked: 1,
//           remark: "",
//         },
//       ],
//     },
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "entries",
//   });

//   const createProject = api.project.create.useMutation({
//     onSuccess: async () => {
//       await utils.project.getAll.invalidate();
//     },
//   });

//   const createActivity = api.activity.create.useMutation({
//     onSuccess: async () => {
//       await utils.project.getAll.invalidate();
//       setIsAdding(false);
//     },
//   });

//   const deleteActivity = api.activity.delete.useMutation({
//     onSuccess: async () => {
//       await utils.project.getAll.invalidate();
//     },
//   });

//   const onSubmit = async (data) => {
//     try {
//       for (const entry of data.entries) {
//         let projectId = entry.projectId;

//         if (entry.projectId === "new" && entry.newProjectName) {
//           const newProject = await createProject.mutateAsync({
//             name: entry.newProjectName,
//           });
//           projectId = newProject.id;
//         }

//         if (projectId) {
//           await createActivity.mutateAsync({
//             projectId,
//             about: entry.about,
//             hoursWorked: entry.hoursWorked,
//             remark: entry.remark ?? undefined,
//           });
//         }
//       }
//       reset();
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     }
//   };

//   const addNewRow = () => {
//     append({
//       about: "",
//       hoursWorked: 1,
//       remark: "",
//     });
//   };

//   const handleDelete = async (activityId) => {
//     if (confirm("Are you sure you want to delete this activity?")) {
//       await deleteActivity.mutateAsync({ id: activityId });
//     }
//   };

//   // Format date to a readable string
//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   // Get total hours for current day
//   const totalHoursToday = sortedProjects
//     ? sortedProjects.reduce(
//         (acc, project) =>
//           acc +
//           project.activities.reduce(
//             (sum, activity) => sum + activity.hoursWorked,
//             0,
//           ),
//         0,
//       )
//     : 0;

//   // Toggle project expansion
//   const toggleProject = (projectId) => {
//     if (expandedProject === projectId) {
//       setExpandedProject(null);
//     } else {
//       setExpandedProject(projectId);
//     }
//   };

//   return (
//     <div className="flex h-full flex-col">
//       {/* Time Entry Form */}
//       <div className="space-y-6 p-6">
//         {/* Header with Stats */}
//         <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//           <div>
//             <h2 className="flex items-center text-2xl font-bold">
//               <Clock className="mr-2 h-6 w-6 text-green-400" />
//               Daily Timesheet
//             </h2>
//             <p className="mt-1 text-gray-500 dark:text-gray-400">
//               Track your time effectively
//             </p>
//           </div>

//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
//             <div className="flex items-center rounded-lg bg-green-50 px-4 py-2 dark:bg-green-900/30">
//               <div className="text-sm">
//                 <span className="block text-gray-500 dark:text-gray-400">
//                   Today's Hours
//                 </span>
//                 <span className="text-xl font-bold text-green-600 dark:text-green-400">
//                   {isNaN(totalHoursToday) ? "0" : totalHoursToday.toFixed(1)}
//                 </span>
//               </div>
//             </div>

//             <button
//               onClick={() => setIsAdding(!isAdding)}
//               className="flex items-center justify-center rounded-lg bg-green-500 px-4 py-2 text-white transition-all hover:bg-green-600"
//             >
//               {isAdding ? (
//                 <>Cancel</>
//               ) : (
//                 <>
//                   <Plus className="mr-1 h-5 w-5" /> Add Time
//                 </>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Time Entry Form */}
//         {isAdding && (
//           <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-lg transition-all dark:border-gray-700 dark:bg-gray-800/70">
//             <h3 className="mb-4 flex items-center text-lg font-medium">
//               <Plus className="mr-2 h-5 w-5 text-green-400" />
//               New Time Entry
//             </h3>

//             <form onSubmit={handleSubmit(onSubmit)}>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                   <thead>
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                         Project
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                         Activity
//                       </th>
//                       <th className="w-20 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                         Hours
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                         Remarks
//                       </th>
//                       <th className="w-16 px-4 py-3"></th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                     {fields.map((field, index) => {
//                       const isCreatingNewProject =
//                         watch(`entries.${index}.projectId`) === "new";
//                       return (
//                         <tr key={field.id}>
//                           {/* Project */}
//                           <td className="px-4 py-3">
//                             <div className="flex flex-col space-y-2">
//                               <select
//                                 {...register(`entries.${index}.projectId`)}
//                                 className="block w-full rounded-md border-gray-300 bg-white text-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
//                               >
//                                 <option value="">Select project</option>
//                                 {!projectsLoading &&
//                                   projects?.map((project) => (
//                                     <option key={project.id} value={project.id}>
//                                       {project.name}
//                                     </option>
//                                   ))}
//                                 <option value="new">
//                                   + Create New Project
//                                 </option>
//                               </select>
//                               {isCreatingNewProject && (
//                                 <input
//                                   {...register(
//                                     `entries.${index}.newProjectName`,
//                                   )}
//                                   placeholder="New project name"
//                                   className="block w-full rounded-md border-gray-300 bg-white text-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
//                                   autoFocus
//                                 />
//                               )}
//                               {errors?.entries?.[index]?.projectId && (
//                                 <p className="text-xs text-red-600 dark:text-red-400">
//                                   {errors.entries[index]?.projectId?.message}
//                                 </p>
//                               )}
//                             </div>
//                           </td>

//                           {/* Activity */}
//                           <td className="px-4 py-3">
//                             <input
//                               {...register(`entries.${index}.about`)}
//                               className="block w-full rounded-md border-gray-300 bg-white text-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
//                               placeholder="Activity description"
//                             />
//                             {errors?.entries?.[index]?.about && (
//                               <p className="text-xs text-red-600 dark:text-red-400">
//                                 {errors.entries[index]?.about?.message}
//                               </p>
//                             )}
//                           </td>

//                           {/* Hours */}
//                           <td className="w-20 px-4 py-3">
//                             <input
//                               type="number"
//                               step="0.25"
//                               min="0.25"
//                               {...register(`entries.${index}.hoursWorked`)}
//                               className="block w-full rounded-md border-gray-300 bg-white text-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
//                             />
//                             {errors?.entries?.[index]?.hoursWorked && (
//                               <p className="text-xs text-red-600 dark:text-red-400">
//                                 {errors.entries[index]?.hoursWorked?.message}
//                               </p>
//                             )}
//                           </td>

//                           {/* Remarks */}
//                           <td className="px-4 py-3">
//                             <input
//                               {...register(`entries.${index}.remark`)}
//                               className="block w-full rounded-md border-gray-300 bg-white text-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
//                               placeholder="Optional notes"
//                             />
//                           </td>

//                           {/* Actions */}
//                           <td className="w-16 px-4 py-3">
//                             <button
//                               type="button"
//                               onClick={() => remove(index)}
//                               className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="mt-4 flex justify-between">
//                 <button
//                   type="button"
//                   onClick={addNewRow}
//                   className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
//                 >
//                   <Plus className="mr-1 h-4 w-4" /> Add Row
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={
//                     isSubmitting ||
//                     createProject.isPending ||
//                     createActivity.isPending
//                   }
//                   className="inline-flex items-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   {isSubmitting ||
//                   createProject.isPending ||
//                   createActivity.isPending
//                     ? "Submitting..."
//                     : "Save Entries"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}

//         {/* Timesheet Records */}
//         <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800/70">
//           {/* Activity Records */}
//           <div className="p-5">
//             <h3 className="mb-4 flex items-center text-lg font-medium">
//               <Calendar className="mr-2 h-5 w-5 text-green-400" />
//               Today&apos;s Activities
//             </h3>

//             {projectsLoading ? (
//               <div className="flex h-32 items-center justify-center">
//                 <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
//                   <svg
//                     className="h-5 w-5 animate-spin text-green-500"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   <span>Loading your timesheet data...</span>
//                 </div>
//               </div>
//             ) : !sortedProjects || sortedProjects.length === 0 ? (
//               <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
//                 <div className="text-center text-gray-500 dark:text-gray-400">
//                   <p className="text-sm">No timesheet entries found</p>
//                   <button
//                     onClick={() => setIsAdding(true)}
//                     className="mt-2 inline-flex items-center rounded-md bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
//                   >
//                     <Plus className="mr-1 h-4 w-4" /> Add your first time entry
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {sortedProjects.map((project) => (
//                   <div
//                     key={project.id}
//                     className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
//                   >
//                     {/* Project Header */}
//                     <div
//                       className="flex cursor-pointer items-center justify-between bg-gray-50 p-4 dark:bg-gray-800"
//                       onClick={() => toggleProject(project.id)}
//                     >
//                       <div className="flex items-center">
//                         <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 font-bold text-white">
//                           {project.name.slice(0, 1)}
//                         </div>
//                         <div>
//                           <h4 className="font-medium">{project.name}</h4>
//                           <div className="text-sm text-gray-500 dark:text-gray-400">
//                             {project.activities.length}{" "}
//                             {project.activities.length === 1
//                               ? "activity"
//                               : "activities"}{" "}
//                             ·{" "}
//                             {project.activities
//                               .reduce(
//                                 (acc, activity) => acc + activity.hoursWorked,
//                                 0,
//                               )
//                               .toFixed(1)}{" "}
//                             hours
//                           </div>
//                         </div>
//                       </div>
//                       <div>
//                         {expandedProject === project.id ? (
//                           <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//                         ) : (
//                           <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
//                         )}
//                       </div>
//                     </div>

//                     {/* Project Activities */}
//                     {expandedProject === project.id && (
//                       <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                           <thead className="bg-gray-50 dark:bg-gray-800/50">
//                             <tr>
//                               <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                                 Activity
//                               </th>
//                               <th className="w-20 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                                 Hours
//                               </th>
//                               <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                                 Remarks
//                               </th>
//                               <th className="w-28 px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                                 Time
//                               </th>
//                               <th className="w-16 px-4 py-3"></th>
//                             </tr>
//                           </thead>
//                           <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                             {project.activities.map((activity) => (
//                               <tr
//                                 key={activity.id}
//                                 className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
//                               >
//                                 <td className="px-4 py-3">
//                                   <div className="font-medium">
//                                     {activity.about}
//                                   </div>
//                                 </td>
//                                 <td className="w-20 px-4 py-3">
//                                   <div className="rounded bg-green-50 px-2 py-1 text-center font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
//                                     {activity.hoursWorked}
//                                   </div>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   <div className="text-gray-500 dark:text-gray-400">
//                                     {activity.remark || "—"}
//                                   </div>
//                                 </td>
//                                 <td className="w-28 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
//                                   {formatDate(activity.createdAt)}
//                                 </td>
//                                 <td className="w-16 px-4 py-3">
//                                   <button
//                                     onClick={() => handleDelete(activity.id)}
//                                     disabled={deleteActivity.isPending}
//                                     className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
//                                   >
//                                     <Trash2 className="h-4 w-4" />
//                                   </button>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Timesheet Summary */}
//           {sortedProjects && sortedProjects.length > 0 && (
//             <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/90">
//               <h3 className="mb-4 text-lg font-medium">Today's Summary</h3>
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//                 <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/30">
//                   <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
//                     Projects Worked On
//                   </h4>
//                   <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//                     {projects?.length ?? 0}
//                   </p>
//                 </div>

//                 <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
//                   <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
//                     Activities Logged
//                   </h4>
//                   <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
//                     {sortedProjects.reduce(
//                       (acc, project) => acc + project.activities.length,
//                       0,
//                     )}
//                   </p>
//                 </div>

//                 <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/30">
//                   <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">
//                     Total Hours
//                   </h4>
//                   <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
//                     {sortedProjects
//                       .reduce(
//                         (acc, project) =>
//                           acc +
//                           project.activities.reduce(
//                             (sum, activity) => sum + activity.hoursWorked,
//                             0,
//                           ),
//                         0,
//                       )
//                       .toFixed(1)}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
