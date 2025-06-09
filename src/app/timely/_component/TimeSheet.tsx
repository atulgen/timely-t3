"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Clock, Plus, Trash2, X } from "lucide-react";

// Define the form schema with Zod
const formSchema = z.object({
  entries: z.array(
    z.object({
      projectId: z.string().optional(),
      newProjectName: z.string().min(1, "Project name is required").optional(),
      about: z.string().min(1, "Activity description is required"),
      hoursWorked: z.coerce
        .number()
        .positive("Hours must be a positive number"),
      remark: z.string().optional(),
    }),
  ),
});

type FormValues = z.infer<typeof formSchema>;

export default function TimesheetUI() {
  const utils = api.useUtils();
  const { data: projects, isLoading: projectsLoading } =
    api.project.getToday.useQuery();

  // Sort activities by descending creation date (newest first)
  const sortedProjects = projects?.map((project) => ({
    ...project,
    activities: [...project.activities].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  }));

  const [isAdding, setIsAdding] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entries: [
        {
          about: "",
          hoursWorked: 1,
          remark: "",
        },
      ],
    },
  });

  useEffect(() => {
    setIsDarkMode(true);
  }, [isDarkMode]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const createProject = api.project.create.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate();
    },
  });

  const createActivity = api.activity.create.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate();
      await utils.project.getToday.invalidate();
      setIsAdding(false);
    },
  });

  const deleteActivity = api.activity.delete.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate();
      await utils.project.getToday.invalidate();
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      for (const entry of data.entries) {
        let projectId = entry.projectId;

        if (entry.projectId === "new" && entry.newProjectName) {
          const newProject = await createProject.mutateAsync({
            name: entry.newProjectName,
          });
          projectId = newProject.id;
        }

        if (projectId) {
          await createActivity.mutateAsync({
            projectId,
            about: entry.about,
            hoursWorked: entry.hoursWorked,
            remark: entry.remark ?? undefined,
          });
        }
      }

      await utils.project.getToday.invalidate();
      const refreshedData = await utils.project.getToday.fetch();
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const addNewRow = () => {
    append({
      about: "",
      hoursWorked: 1,
      remark: "",
    });
  };

  const handleDelete = async (activityId: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      await deleteActivity.mutateAsync({ id: activityId });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

 return (
  <div className="mx-auto max-w-7xl p-6">
    {/* Header */}
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
          Track and manage your daily activities
        </p>
      </div>
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="flex items-center gap-2 rounded-lg px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow transition-colors"
      >
        {isAdding ? (
          <>
            <X className="h-4 w-4" />
            Cancel
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add Entry
          </>
        )}
      </button>
    </div>

    {/* Add Entry Form */}
    {isAdding && (
      <div
        className={`mb-8 rounded-xl p-6 shadow-xl border ${
          isDarkMode
            ? "bg-gray-800/90 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
          New Time Entry
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {fields.map((field, index) => {
              const isCreatingNewProject =
                watch(`entries.${index}.projectId`) === "new";
              return (
                <div
                  key={field.id}
                  className={`rounded-lg p-4 border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-blue-50 border-blue-100"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Project */}
                    <div>
                      <label
                        htmlFor={`project-${index}`}
                        className={`mb-1 block text-sm font-semibold ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Project
                      </label>
                      <select
                        id={`project-${index}`}
                        {...register(`entries.${index}.projectId`)}
                        className={`block w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-gray-100 focus:border-green-400 focus:ring-green-400"
                            : "border-blue-200 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200"
                        }`}
                      >
                        <option value="">Select project</option>
                        {!projectsLoading &&
                          projects?.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        <option value="new">+ Create New Project</option>
                      </select>
                      {isCreatingNewProject && (
                        <div className="mt-2">
                          <input
                            {...register(`entries.${index}.newProjectName`)}
                            placeholder="New project name"
                            className={`block w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 ${
                              isDarkMode
                                ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                                : "border-blue-200 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-200"
                            }`}
                            autoFocus
                          />
                          {errors.entries?.[index]?.newProjectName && (
                            <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                              {errors.entries[index]?.newProjectName?.message}
                            </p>
                          )}
                        </div>
                      )}
                      {errors.entries?.[index]?.projectId && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                          {errors.entries[index]?.projectId?.message}
                        </p>
                      )}
                    </div>

                    {/* Activity */}
                    <div>
                      <label
                        htmlFor={`activity-${index}`}
                        className={`mb-1 block text-sm font-semibold ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Activity
                      </label>
                      <input
                        id={`activity-${index}`}
                        {...register(`entries.${index}.about`)}
                        className={`block w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                            : "border-blue-200 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-200"
                        }`}
                        placeholder="What did you work on?"
                      />
                      {errors.entries?.[index]?.about && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                          {errors.entries[index]?.about?.message}
                        </p>
                      )}
                    </div>

                    {/* Hours */}
                    <div>
                      <label
                        htmlFor={`hours-${index}`}
                        className={`mb-1 block text-sm font-semibold ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Hours
                      </label>
                      <input
                        id={`hours-${index}`}
                        type="number"
                        step="0.25"
                        min="0.25"
                        {...register(`entries.${index}.hoursWorked`)}
                        className={`block w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-gray-100 focus:border-green-400 focus:ring-green-400"
                            : "border-blue-200 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200"
                        }`}
                      />
                      {errors.entries?.[index]?.hoursWorked && (
                        <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                          {errors.entries[index]?.hoursWorked?.message}
                        </p>
                      )}
                    </div>

                    {/* Remarks */}
                    <div className="flex items-end gap-2">
                      <div className="flex-grow">
                        <label
                          htmlFor={`remarks-${index}`}
                          className={`mb-1 block text-sm font-semibold ${
                            isDarkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          Remarks
                        </label>
                        <input
                          id={`remarks-${index}`}
                          {...register(`entries.${index}.remark`)}
                          className={`block w-full rounded-lg border p-2 text-sm focus:outline-none focus:ring-2 ${
                            isDarkMode
                              ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                              : "border-blue-200 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-200"
                          }`}
                          placeholder="Optional notes"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className={`rounded-lg p-2 transition ${
                          isDarkMode
                            ? "text-red-400 hover:bg-red-900/30"
                            : "text-red-500 hover:bg-red-100"
                        }`}
                        title="Remove Entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={addNewRow}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition ${
                isDarkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              <Plus className="h-4 w-4" />
              Add Another Entry
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                createProject.isPending ||
                createActivity.isPending
              }
              className={`rounded-lg px-6 py-2 font-semibold text-white transition-colors shadow ${
                isSubmitting ||
                createProject.isPending ||
                createActivity.isPending
                  ? "bg-green-400/70 dark:bg-green-600/70"
                  : "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              }`}
            >
              {isSubmitting ||
              createProject.isPending ||
              createActivity.isPending
                ? "Saving..."
                : "Save Entries"}
            </button>
          </div>
        </form>
      </div>
    )}

    {/* Timesheet Records */}
    <div
      className={`rounded-2xl shadow-2xl border ${
        isDarkMode
          ? "bg-grey-400/40 border-gray-400/3"
          : "bg-blue-50 border-blue-900"
      }`}
    >
      <div className="p-6">
        <h2 className="mb-6 text-2xl font-bold text-gray-400 dark:text-white">
          Today&apos;s Activities
        </h2>

        {projectsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div
              className={`text-center ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Loading your timesheet data...
            </div>
          </div>
        ) : !sortedProjects || sortedProjects.length === 0 ? (
          <div
            className={`flex h-32 items-center justify-center rounded-lg border border-dashed ${
              isDarkMode
                ? "border-gray-700 bg-gray-800/50"
                : "border-blue-200 bg-blue-100"
            }`}
          >
            <div
              className={`text-center ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <p className="mb-2">No activities recorded today</p>
              <p className="text-sm">
                Add your first time entry to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold tracking-wider uppercase text-black-500 dark:text-gray-300">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold tracking-wider uppercase text-black-500 dark:text-gray-300">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold tracking-wider uppercase text-black-500 dark:text-gray-300">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold tracking-wider uppercase text-black-500 dark:text-gray-300">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold tracking-wider uppercase text-black-500 dark:text-gray-300">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold tracking-wider uppercase text-black-500 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sortedProjects.flatMap((project) =>
                  project.activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className={`transition hover:bg-blue-500/10 dark:hover:bg-gray-800`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-blue-700 dark:text-white">
                          {project.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-violet-500 dark:text-gray-200">
                          {activity.about}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {activity.hoursWorked}h
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-grey-600 dark:text-gray-400">
                          {new Date(activity.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-grey-600 dark:text-gray-400">
                          {activity.remark ?? "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(activity.id)}
                          disabled={deleteActivity.isPending}
                          className={`rounded p-1 transition ${
                            isDarkMode
                              ? "text-red-400 hover:bg-red-900/30"
                              : "text-red-600 hover:bg-red-100"
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Section */}
      {sortedProjects && sortedProjects.length > 0 && (
        <div
          className={`border-t p-6 ${
            isDarkMode ? "border-gray-700" : "border-blue-200"
          }`}
        >
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
            Daily Summary
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div
              className={`rounded-lg p-4 shadow-sm ${
                isDarkMode ? "bg-indigo-900/30" : "bg-indigo-50"
              }`}
            >
              <h4
                className={`text-sm font-semibold ${
                  isDarkMode ? "text-indigo-500" : "text-indigo-800"
                }`}
              >
                Projects Worked On
              </h4>
              <p
                className={`mt-2 text-2xl font-bold ${
                  isDarkMode ? "text-indigo-500" : "text-indigo-600"
                }`}
              >
                {projects?.length ?? 0}
              </p>
            </div>
            <div
              className={`rounded-lg p-4 shadow-sm ${
                isDarkMode ? "bg-green-900/30" : "bg-green-50"
              }`}
            >
              <h4
                className={`text-sm font-semibold ${
                  isDarkMode ? "text-green-500" : "text-green-800"
                }`}
              >
                Total Activities
              </h4>
              <p
                className={`mt-2 text-2xl font-bold ${
                  isDarkMode ? "text-green-500" : "text-green-600"
                }`}
              >
                {sortedProjects.reduce(
                  (acc, project) => acc + project.activities.length,
                  0,
                )}
              </p>
            </div>
            <div
              className={`rounded-lg p-4 shadow-sm ${
                isDarkMode ? "bg-purple-900/30" : "bg-purple-50"
              }`}
            >
              <h4
                className={`text-sm font-semibold ${
                  isDarkMode ? "text-purple-500" : "text-purple-800"
                }`}
              >
                Total Hours
              </h4>
              <p
                className={`mt-2 text-2xl font-bold ${
                  isDarkMode ? "text-purple-500" : "text-purple-600"
                }`}
              >
                {sortedProjects
                  .reduce(
                    (acc, project) =>
                      acc +
                      project.activities.reduce(
                        (sum, activity) => sum + activity.hoursWorked,
                        0,
                      ),
                    0,
                  )
                  .toFixed(2)}
                h
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}


// "use client";

// import { api } from "@/trpc/react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Plus, Trash2, X } from "lucide-react";
// import { useEffect, useState } from "react";
// import { useFieldArray, useForm } from "react-hook-form";
// import { z } from "zod";

// // Define the form schema with Zod
// const formSchema = z.object({
//   entries: z.array(
//     z.object({
//       projectId: z.string().optional(),
//       newProjectName: z.string().min(1, "Project name is required").optional(),
//       about: z.string().min(1, "Activity description is required"),
//       hoursWorked: z.coerce
//         .number()
//         .positive("Hours must be a positive number"),
//       remark: z.string().optional(),
//     }),
//   ),
// });

// type FormValues = z.infer<typeof formSchema>;

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
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     control,
//     watch,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
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

//   useEffect(() => {
//     setIsDarkMode(true);
//   }, [isDarkMode]);

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
//       await utils.project.getToday.invalidate();
//       setIsAdding(false);
//     },
//   });

//   const deleteActivity = api.activity.delete.useMutation({
//     onSuccess: async () => {
//       await utils.project.getAll.invalidate();
//       await utils.project.getToday.invalidate();
//     },
//   });

//   const onSubmit = async (data: FormValues) => {
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

//       await utils.project.getToday.invalidate();
//       const refreshedData = await utils.project.getToday.fetch();
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

//   const handleDelete = async (activityId: string) => {
//     if (confirm("Are you sure you want to delete this activity?")) {
//       await deleteActivity.mutateAsync({ id: activityId });
//     }
//   };

//   const formatDate = (date: Date) => {
//     return new Date(date).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   return (
//     <div className="mx-auto max-w-7xl p-6">
//       {/* Header */}
//       <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-white">
//             Time Logger
//           </h1>
//           <p className="text-gray-600 dark:text-gray-400">
//             Track and manage your daily activities
//           </p>
//         </div>
//         <button
//           onClick={() => setIsAdding(!isAdding)}
//           className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
//             isAdding
//               ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/20"
//               : "bg-green-500/10 text-green-500 hover:bg-green-500/20 dark:bg-green-400/10 dark:text-green-400 dark:hover:bg-green-400/20"
//           }`}
//         >
//           {isAdding ? (
//             <>
//               <X className="h-4 w-4" />
//               Cancel
//             </>
//           ) : (
//             <>
//               <Plus className="h-4 w-4" />
//               Add Entry
//             </>
//           )}
//         </button>
//       </div>

//       {/* Add Entry Form */}
//       {isAdding && (
//         <div
//           className={`mb-8 rounded-xl p-6 shadow-lg ${
//             isDarkMode ? "bg-gray-800/50" : "bg-white"
//           }`}
//         >
//           <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
//             New Time Entry
//           </h2>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <div className="space-y-4">
//               {fields.map((field, index) => {
//                 const isCreatingNewProject =
//                   watch(`entries.${index}.projectId`) === "new";
//                 return (
//                   <div
//                     key={field.id}
//                     className={`rounded-lg p-4 ${
//                       isDarkMode ? "bg-gray-800" : "bg-gray-50"
//                     }`}
//                   >
//                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
//                       {/* Project */}
//                       <div>
//                         <label
//                           htmlFor={`project-${index}`}
//                           className={`mb-1 block text-sm font-medium ${
//                             isDarkMode ? "text-gray-300" : "text-gray-700"
//                           }`}
//                         >
//                           Project
//                         </label>
//                         <select
//                           id={`project-${index}`}
//                           {...register(`entries.${index}.projectId`)}
//                           className={`block w-full rounded-lg border p-2 text-sm ${
//                             isDarkMode
//                               ? "border-gray-700 bg-gray-700 text-white focus:border-green-400 focus:ring-green-400"
//                               : "border-gray-300 bg-white text-gray-800 focus:border-green-500 focus:ring-green-500"
//                           }`}
//                         >
//                           <option value="">Select project</option>
//                           {!projectsLoading &&
//                             projects?.map((project) => (
//                               <option key={project.id} value={project.id}>
//                                 {project.name}
//                               </option>
//                             ))}
//                           <option value="new">+ Create New Project</option>
//                         </select>
//                         {isCreatingNewProject && (
//                           <div className="mt-2">
//                             <input
//                               {...register(`entries.${index}.newProjectName`)}
//                               placeholder="New project name"
//                               className={`block w-full rounded-lg border p-2 text-sm ${
//                                 isDarkMode
//                                   ? "border-gray-700 bg-gray-700 text-white focus:border-green-400 focus:ring-green-400"
//                                   : "border-gray-300 bg-white text-gray-800 focus:border-green-500 focus:ring-green-500"
//                               }`}
//                               autoFocus
//                             />
//                             {errors.entries?.[index]?.newProjectName && (
//                               <p className="mt-1 text-xs text-red-500 dark:text-red-400">
//                                 {errors.entries[index]?.newProjectName?.message}
//                               </p>
//                             )}
//                           </div>
//                         )}
//                         {errors.entries?.[index]?.projectId && (
//                           <p className="mt-1 text-xs text-red-500 dark:text-red-400">
//                             {errors.entries[index]?.projectId?.message}
//                           </p>
//                         )}
//                       </div>

//                       {/* Activity */}
//                       <div>
//                         <label
//                           htmlFor={`activity-${index}`}
//                           className={`mb-1 block text-sm font-medium ${
//                             isDarkMode ? "text-gray-300" : "text-gray-700"
//                           }`}
//                         >
//                           Activity
//                         </label>
//                         <input
//                           id={`activity-${index}`}
//                           {...register(`entries.${index}.about`)}
//                           className={`block w-full rounded-lg border p-2 text-sm ${
//                             isDarkMode
//                               ? "border-gray-700 bg-gray-700 text-white focus:border-green-400 focus:ring-green-400"
//                               : "border-gray-300 bg-white text-gray-800 focus:border-green-500 focus:ring-green-500"
//                           }`}
//                           placeholder="What did you work on?"
//                         />
//                         {errors.entries?.[index]?.about && (
//                           <p className="mt-1 text-xs text-red-500 dark:text-red-400">
//                             {errors.entries[index]?.about?.message}
//                           </p>
//                         )}
//                       </div>

//                       {/* Hours */}
//                       <div>
//                         <label
//                           htmlFor={`hours-${index}`}
//                           className={`mb-1 block text-sm font-medium ${
//                             isDarkMode ? "text-gray-300" : "text-gray-700"
//                           }`}
//                         >
//                           Hours
//                         </label>
//                         <input
//                           id={`hours-${index}`}
//                           type="number"
//                           step="0.25"
//                           min="0.25"
//                           {...register(`entries.${index}.hoursWorked`)}
//                           className={`block w-full rounded-lg border p-2 text-sm ${
//                             isDarkMode
//                               ? "border-gray-700 bg-gray-700 text-white focus:border-green-400 focus:ring-green-400"
//                               : "border-gray-300 bg-white text-gray-800 focus:border-green-500 focus:ring-green-500"
//                           }`}
//                         />
//                         {errors.entries?.[index]?.hoursWorked && (
//                           <p className="mt-1 text-xs text-red-500 dark:text-red-400">
//                             {errors.entries[index]?.hoursWorked?.message}
//                           </p>
//                         )}
//                       </div>

//                       {/* Remarks */}
//                       <div className="flex items-end gap-2">
//                         <div className="flex-grow">
//                           <label
//                             htmlFor={`remarks-${index}`}
//                             className={`mb-1 block text-sm font-medium ${
//                               isDarkMode ? "text-gray-300" : "text-gray-700"
//                             }`}
//                           >
//                             Remarks
//                           </label>
//                           <input
//                             id={`remarks-${index}`}
//                             {...register(`entries.${index}.remark`)}
//                             className={`block w-full rounded-lg border p-2 text-sm ${
//                               isDarkMode
//                                 ? "border-gray-700 bg-gray-700 text-white focus:border-green-400 focus:ring-green-400"
//                                 : "border-gray-300 bg-white text-gray-800 focus:border-green-500 focus:ring-green-500"
//                             }`}
//                             placeholder="Optional notes"
//                           />
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => remove(index)}
//                           className={`rounded-lg p-2 ${
//                             isDarkMode
//                               ? "text-red-400 hover:bg-red-900/30"
//                               : "text-red-500 hover:bg-red-100"
//                           }`}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
//               <button
//                 type="button"
//                 onClick={addNewRow}
//                 className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
//                   isDarkMode
//                     ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
//                     : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 }`}
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Another Entry
//               </button>
//               <button
//                 type="submit"
//                 disabled={
//                   isSubmitting ||
//                   createProject.isPending ||
//                   createActivity.isPending
//                 }
//                 className={`rounded-lg px-6 py-2 font-medium text-white transition-colors ${
//                   isSubmitting ||
//                   createProject.isPending ||
//                   createActivity.isPending
//                     ? "bg-green-400/70 dark:bg-green-600/70"
//                     : "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
//                 }`}
//               >
//                 {isSubmitting ||
//                 createProject.isPending ||
//                 createActivity.isPending
//                   ? "Saving..."
//                   : "Save Entries"}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Timesheet Records */}
//       <div
//         className={`rounded-xl shadow-lg ${
//           isDarkMode ? "bg-gray-800/50" : "bg-white"
//         }`}
//       >
//         <div className="p-6">
//           <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
//             Today&apos;s Activities
//           </h2>

//           {projectsLoading ? (
//             <div className="flex h-32 items-center justify-center">
//               <div
//                 className={`text-center ${
//                   isDarkMode ? "text-gray-400" : "text-gray-500"
//                 }`}
//               >
//                 Loading your timesheet data...
//               </div>
//             </div>
//           ) : !sortedProjects || sortedProjects.length === 0 ? (
//             <div
//               className={`flex h-32 items-center justify-center rounded-lg border border-dashed ${
//                 isDarkMode
//                   ? "border-gray-700 bg-gray-900/50"
//                   : "border-gray-300 bg-gray-50"
//               }`}
//             >
//               <div
//                 className={`text-center ${
//                   isDarkMode ? "text-gray-400" : "text-gray-500"
//                 }`}
//               >
//                 <p className="mb-2">No activities recorded today</p>
//                 <p className="text-sm">
//                   Add your first time entry to get started
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//                 <thead>
//                   <tr>
//                     <th
//                       className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
//                         isDarkMode ? "text-gray-300" : "text-gray-500"
//                       }`}
//                     >
//                       Project
//                     </th>
//                     <th
//                       className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
//                         isDarkMode ? "text-gray-300" : "text-gray-500"
//                       }`}
//                     >
//                       Activity
//                     </th>
//                     <th
//                       className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
//                         isDarkMode ? "text-gray-300" : "text-gray-500"
//                       }`}
//                     >
//                       Hours
//                     </th>
//                     <th
//                       className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
//                         isDarkMode ? "text-gray-300" : "text-gray-500"
//                       }`}
//                     >
//                       Time
//                     </th>
//                     <th
//                       className={`px-6 py-3 text-left text-xs font-medium tracking-wider uppercase ${
//                         isDarkMode ? "text-gray-300" : "text-gray-500"
//                       }`}
//                     >
//                       Notes
//                     </th>
//                     <th
//                       className={`px-6 py-3 text-right text-xs font-medium tracking-wider uppercase ${
//                         isDarkMode ? "text-gray-300" : "text-gray-500"
//                       }`}
//                     >
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                   {sortedProjects.flatMap((project) =>
//                     project.activities.map((activity) => (
//                       <tr
//                         key={activity.id}
//                         className={`${
//                           isDarkMode
//                             ? "hover:bg-gray-700/50"
//                             : "hover:bg-gray-50"
//                         }`}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="font-medium text-gray-900 dark:text-white">
//                             {project.name}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-gray-900 dark:text-gray-200">
//                             {activity.about}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div
//                             className={`font-medium ${
//                               isDarkMode ? "text-green-400" : "text-green-600"
//                             }`}
//                           >
//                             {activity.hoursWorked}h
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div
//                             className={`text-sm ${
//                               isDarkMode ? "text-gray-400" : "text-gray-500"
//                             }`}
//                           >
//                             {new Date(activity.createdAt).toLocaleTimeString(
//                               [],
//                               {
//                                 hour: "2-digit",
//                                 minute: "2-digit",
//                               },
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div
//                             className={`max-w-xs truncate ${
//                               isDarkMode ? "text-gray-400" : "text-gray-500"
//                             }`}
//                           >
//                             {activity.remark ?? "—"}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 text-right whitespace-nowrap">
//                           <button
//                             onClick={() => handleDelete(activity.id)}
//                             disabled={deleteActivity.isPending}
//                             className={`rounded p-1 ${
//                               isDarkMode
//                                 ? "text-red-400 hover:bg-red-900/30"
//                                 : "text-red-500 hover:bg-red-100"
//                             }`}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </td>
//                       </tr>
//                     )),
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Summary Section */}
//         {sortedProjects && sortedProjects.length > 0 && (
//           <div
//             className={`border-t p-6 ${
//               isDarkMode ? "border-gray-700" : "border-gray-200"
//             }`}
//           >
//             <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
//               Daily Summary
//             </h3>
//             <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//               <div
//                 className={`rounded-lg p-4 ${
//                   isDarkMode ? "bg-indigo-900/30" : "bg-indigo-50"
//                 }`}
//               >
//                 <h4
//                   className={`text-sm font-medium ${
//                     isDarkMode ? "text-indigo-300" : "text-indigo-800"
//                   }`}
//                 >
//                   Projects Worked On
//                 </h4>
//                 <p
//                   className={`mt-2 text-2xl font-bold ${
//                     isDarkMode ? "text-indigo-400" : "text-indigo-600"
//                   }`}
//                 >
//                   {projects?.length ?? 0}
//                 </p>
//               </div>
//               <div
//                 className={`rounded-lg p-4 ${
//                   isDarkMode ? "bg-green-900/30" : "bg-green-50"
//                 }`}
//               >
//                 <h4
//                   className={`text-sm font-medium ${
//                     isDarkMode ? "text-green-300" : "text-green-800"
//                   }`}
//                 >
//                   Total Activities
//                 </h4>
//                 <p
//                   className={`mt-2 text-2xl font-bold ${
//                     isDarkMode ? "text-green-400" : "text-green-600"
//                   }`}
//                 >
//                   {sortedProjects.reduce(
//                     (acc, project) => acc + project.activities.length,
//                     0,
//                   )}
//                 </p>
//               </div>
//               <div
//                 className={`rounded-lg p-4 ${
//                   isDarkMode ? "bg-purple-900/30" : "bg-purple-50"
//                 }`}
//               >
//                 <h4
//                   className={`text-sm font-medium ${
//                     isDarkMode ? "text-purple-300" : "text-purple-800"
//                   }`}
//                 >
//                   Total Hours
//                 </h4>
//                 <p
//                   className={`mt-2 text-2xl font-bold ${
//                     isDarkMode ? "text-purple-400" : "text-purple-600"
//                   }`}
//                 >
//                   {sortedProjects
//                     .reduce(
//                       (acc, project) =>
//                         acc +
//                         project.activities.reduce(
//                           (sum, activity) => sum + activity.hoursWorked,
//                           0,
//                         ),
//                       0,
//                     )
//                     .toFixed(2)}
//                   h
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
