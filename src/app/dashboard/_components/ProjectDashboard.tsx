// /* eslint-disable @typescript-eslint/no-redundant-type-constituents */
// "use client";

// import { useState, useMemo } from "react";
// import { api } from "@/trpc/react";
// import { VerifyActivityModal } from "./VerifYActivity";

// type Activity = {
//   id: string;
//   about: string;
//   hoursWorked: number;
//   remark: string | null;
//   verifiedBy: string | null;
//   createdAt: Date;
// };

// type Project = {
//   id: string;
//   name: string;
//   activities: Activity[];
//   createdAt: Date;
// };

// export function ProjectDashboard() {
//   const { data: projects, isLoading } = api.project.getAll.useQuery();
//   const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");
//   const [timeRange, setTimeRange] = useState<"all" | "week" | "month">("all");
//   const [selectedActivity, setSelectedActivity] = useState<(Activity & { projectName: string }) | null>(null);
  
//   // Format date to a readable string
//   const formatDate = (date: Date) => {
//     return new Date(date).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   // Filter activities based on time range
//   const filterActivitiesByTime = (activities: Activity[]) => {
//     if (timeRange === "all") return activities;
    
//     const now = new Date();
//     const msInDay = 86400000;
//     let cutoffDate: Date;
    
//     if (timeRange === "week") {
//       cutoffDate = new Date(now.getTime() - 7 * msInDay);
//     } else {
//       // month
//       cutoffDate = new Date(now.getTime() - 30 * msInDay);
//     }
    
//     return activities.filter(
//       (activity) => new Date(activity.createdAt) >= cutoffDate
//     );
//   };

//   // Calculate summary data
//   const summary = useMemo(() => {
//     if (!projects) return null;
    
//     const allProjects = [...projects];
//     let totalHours = 0;
//     let totalActivities = 0;
//     let projectData: Array<{
//       id: string;
//       name: string;
//       hours: number;
//       activities: number;
//       percentage: number;
//     }> = [];
    
//     const filteredProjects = allProjects.map(project => {
//       const filteredActivities = filterActivitiesByTime(project.activities);
//       return { ...project, filteredActivities };
//     });
    
//     // Calculate total hours across all projects
//     filteredProjects.forEach(project => {
//       const hours = project.filteredActivities.reduce(
//         (acc, curr) => acc + curr.hoursWorked, 
//         0
//       );
//       totalHours += hours;
//       totalActivities += project.filteredActivities.length;
      
//       projectData.push({
//         id: project.id,
//         name: project.name,
//         hours,
//         activities: project.filteredActivities.length,
//         percentage: 0, // Will be calculated after totalHours is known
//       });
//     });
    
//     // Calculate percentages
//     projectData = projectData.map(project => ({
//       ...project,
//       percentage: totalHours > 0 ? (project.hours / totalHours) * 100 : 0,
//     }));
    
//     return {
//       totalProjects: allProjects.length,
//       totalActivities,
//       totalHours,
//       projectData: projectData.sort((a, b) => b.hours - a.hours),
//     };
//   }, [projects, timeRange]);

//   // Get filtered activities for the selected project
//   const filteredActivities = useMemo(() => {
//     if (!projects) return [];
    
//     let activities: (Activity & { projectName: string })[] = [];
    
//     if (selectedProjectId === "all") {
//       // Get activities from all projects
//       projects.forEach(project => {
//         const projectActivities = project.activities.map(activity => ({
//           ...activity, 
//           projectName: project.name
//         }));
//         activities = [...activities, ...projectActivities];
//       });
//     } else {
//       // Get activities from selected project
//       const project = projects.find(p => p.id === selectedProjectId);
//       if (project) {
//         activities = project.activities.map(activity => ({
//           ...activity, 
//           projectName: project.name
//         }));
//       }
//     }
    
//     // Apply time filter
//     activities = filterActivitiesByTime(activities);
    
//     // Sort by most recent first
//     return activities.sort(
//       (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );
//   }, [projects, selectedProjectId, timeRange]);

//   if (isLoading) {
//     return (
//       <div className="flex h-64 w-full items-center justify-center">
//         <div className="text-lg">Loading dashboard data...</div>
//       </div>
//     );
//   }

//   if (!projects || projects.length === 0) {
//     return (
//       <div className="rounded-lg bg-white/5 p-8 text-center">
//         <h2 className="text-xl font-medium">No Projects Found</h2>
//         <p className="mt-2 text-gray-300">
//           No projects have been created yet. Start by creating a new project.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full space-y-8">
//       {/* Summary Cards */}
//       {summary && (
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <div className="rounded-lg bg-white/10 p-6">
//             <h3 className="text-lg font-medium text-gray-300">Total Projects</h3>
//             <p className="mt-2 text-3xl font-bold">{summary.totalProjects}</p>
//           </div>
          
//           <div className="rounded-lg bg-white/10 p-6">
//             <h3 className="text-lg font-medium text-gray-300">Total Activities</h3>
//             <p className="mt-2 text-3xl font-bold">{summary.totalActivities}</p>
//           </div>
          
//           <div className="rounded-lg bg-white/10 p-6">
//             <h3 className="text-lg font-medium text-gray-300">Total Hours</h3>
//             <p className="mt-2 text-3xl font-bold">{summary.totalHours.toFixed(1)}</p>
//           </div>
          
//           <div className="rounded-lg bg-white/10 p-6">
//             <h3 className="text-lg font-medium text-gray-300">Avg Hours/Activity</h3>
//             <p className="mt-2 text-3xl font-bold">
//               {summary.totalActivities > 0 
//                 ? (summary.totalHours / summary.totalActivities).toFixed(1) 
//                 : "0.0"}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="flex flex-wrap gap-4">
//         <div className="flex-1">
//           <label htmlFor="project-filter" className="block text-sm font-medium text-gray-300">
//             Filter by Project
//           </label>
//           <select
//             id="project-filter"
//             value={selectedProjectId}
//             onChange={(e) => setSelectedProjectId(e.target.value)}
//             className="mt-1 w-full rounded-md bg-white/10 px-3 py-2 text-white"
//           >
//             <option value="all">All Projects</option>
//             {projects.map((project) => (
//               <option key={project.id} value={project.id}>
//                 {project.name}
//               </option>
//             ))}
//           </select>
//         </div>
        
//         <div className="flex-1">
//           <label htmlFor="time-filter" className="block text-sm font-medium text-gray-300">
//             Time Range
//           </label>
//           <select
//             id="time-filter"
//             value={timeRange}
//             onChange={(e) => setTimeRange(e.target.value as "all" | "week" | "month")}
//             className="mt-1 w-full rounded-md bg-white/10 px-3 py-2 text-white"
//           >
//             <option value="all">All Time</option>
//             <option value="week">Last 7 Days</option>
//             <option value="month">Last 30 Days</option>
//           </select>
//         </div>
//       </div>

//       {/* Project Breakdown */}
//       <div>
//         <h2 className="mb-4 text-xl font-bold">Project Time Distribution</h2>
//         <div className="space-y-3">
//           {summary?.projectData.map((project) => (
//             <div key={project.id} className="rounded-lg bg-white/5 p-4">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-medium">{project.name}</h3>
//                 <span className="text-sm">{project.hours.toFixed(1)} hours ({project.percentage.toFixed(1)}%)</span>
//               </div>
//               <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
//                 <div
//                   className="h-full rounded-full bg-purple-500"
//                   style={{ width: `${project.percentage}%` }}
//                 ></div>
//               </div>
//               <div className="mt-1 text-sm text-gray-300">
//                 {project.activities} {project.activities === 1 ? "activity" : "activities"}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Activity Log */}
//       <div>
//         <h2 className="mb-4 text-xl font-bold">Activity Log</h2>
        
//         <div className="overflow-hidden rounded-lg bg-white/5">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-white/10 bg-white/5">
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Project</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Activity</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Hours</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Date</th>
//                   <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Verified By</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-white/10">
//                 {filteredActivities.length > 0 ? (
//                   filteredActivities.map((activity) => (
//                     <tr key={activity.id} className="hover:bg-white/5">
//                       <td className="whitespace-nowrap px-6 py-4 text-sm">{activity.projectName}</td>
//                       <td className="px-6 py-4 text-sm">
//                         <div>{activity.about}</div>
//                         {activity.remark && (
//                           <div className="mt-1 text-xs text-gray-400">{activity.remark}</div>
//                         )}
//                       </td>
//                       <td className="whitespace-nowrap px-6 py-4 text-sm">{activity.hoursWorked}</td>
//                       <td className="whitespace-nowrap px-6 py-4 text-sm">{formatDate(activity.createdAt)}</td>
//                       <td className="whitespace-nowrap px-6 py-4 text-sm">
//                         {activity.verifiedBy ? (
//                           <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
//                             {activity.verifiedBy}
//                           </span>
//                         ) : (
//                           <button
//                             onClick={() => setSelectedActivity(activity)}
//                             className="rounded-md bg-purple-600/40 px-2 py-1 text-xs font-medium hover:bg-purple-600/60"
//                           >
//                             Verify
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
//                       No activities found for the selected filters.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Verification Modal */}
//       {selectedActivity && (
//         <VerifyActivityModal
//           activity={selectedActivity}
//           onClose={() => setSelectedActivity(null)}
//         />
//       )}
//     </div>
//   );
// }