"use client";

import { useState } from "react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Calendar, Clock, Filter, Plus, Trash2, X } from "lucide-react";

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
  const [activeFilter, setActiveFilter] = useState("all");

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
      setIsAdding(false);
    },
  });

  const deleteActivity = api.activity.delete.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate();
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

  // Format date to a readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate total hours for today
  const totalHoursToday =
    sortedProjects?.reduce(
      (acc, project) =>
        acc +
        project.activities.reduce(
          (sum, activity) => sum + activity.hoursWorked,
          0,
        ),
      0,
    ) ?? 0;

  // Count total activities
  const totalActivities =
    sortedProjects?.reduce(
      (acc, project) => acc + project.activities.length,
      0,
    ) ?? 0;

  // Get current date information
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header with stats */}
      <div className="flex flex-col items-start justify-between border-b border-gray-100 px-8 py-6 lg:flex-row lg:items-center dark:border-gray-700">
        <div className="mb-4 flex items-center lg:mb-0">
          <div className="mr-6">
            <h2 className="flex items-center text-2xl font-bold">
              <Clock className="mr-2 h-6 w-6 text-green-400" />
              <span>Time Tracking</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-green-50 px-4 py-2 dark:bg-green-900/20">
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                Hours Today
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalHoursToday.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-indigo-50 px-4 py-2 dark:bg-indigo-900/20">
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                Activities
              </span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {totalActivities}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg bg-purple-50 px-4 py-2 dark:bg-purple-900/20">
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                Projects
              </span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {projects?.length ?? 0}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center rounded-lg px-4 py-2 font-medium transition-colors ${
              isAdding
                ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                : "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            }`}
          >
            {isAdding ? (
              <>
                <X className="mr-2 h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> New Entry
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-grow overflow-auto p-8">
        {/* New Entry Form */}
        {isAdding && (
          <div className="animate-in fade-in-0 slide-in-from-top-4 mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800/50">
            <h2 className="mb-4 flex items-center text-xl font-semibold">
              <Calendar className="mr-2 h-5 w-5 text-green-400" />
              New Time Entry
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Activity
                      </th>
                      <th className="w-24 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Remarks
                      </th>
                      <th className="w-20 px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {fields.map((field, index) => {
                      const isCreatingNewProject =
                        watch(`entries.${index}.projectId`) === "new";
                      return (
                        <tr
                          key={field.id}
                          className="bg-white transition-colors hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-700/50"
                        >
                          {/* Project */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-2">
                              <select
                                {...register(`entries.${index}.projectId`)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
                              >
                                <option value="">Select project</option>
                                {!projectsLoading &&
                                  projects?.map((project) => (
                                    <option key={project.id} value={project.id}>
                                      {project.name}
                                    </option>
                                  ))}
                                <option value="new">
                                  + Create New Project
                                </option>
                              </select>
                              {isCreatingNewProject && (
                                <input
                                  {...register(
                                    `entries.${index}.newProjectName`,
                                  )}
                                  placeholder="New project name"
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
                                  autoFocus
                                />
                              )}
                              {errors.entries?.[index]?.projectId && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                  {errors.entries[index]?.projectId?.message}
                                </p>
                              )}
                              {errors.entries?.[index]?.newProjectName && (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                  {
                                    errors.entries[index]?.newProjectName
                                      ?.message
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Activity */}
                          <td className="px-6 py-4">
                            <input
                              {...register(`entries.${index}.about`)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
                              placeholder="Activity description"
                            />
                            {errors.entries?.[index]?.about && (
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.entries[index]?.about?.message}
                              </p>
                            )}
                          </td>

                          {/* Hours */}
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              step="0.25"
                              min="0.25"
                              {...register(`entries.${index}.hoursWorked`)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
                            />
                            {errors.entries?.[index]?.hoursWorked && (
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.entries[index]?.hoursWorked?.message}
                              </p>
                            )}
                          </td>

                          {/* Remarks */}
                          <td className="px-6 py-4">
                            <input
                              {...register(`entries.${index}.remark`)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
                              placeholder="Optional notes"
                            />
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="inline-flex items-center justify-center rounded-full p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                              aria-label="Remove row"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={addNewRow}
                  className="flex items-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Row
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createProject.isPending ||
                    createActivity.isPending
                  }
                  className="flex items-center rounded-lg bg-green-500 px-6 py-2 text-sm font-medium text-white hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ||
                  createProject.isPending ||
                  createActivity.isPending
                    ? "Submitting..."
                    : "Submit Entries"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Timesheet Records */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex flex-col items-start justify-between border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center dark:border-gray-700">
            <h2 className="flex items-center text-xl font-semibold">
              <Calendar className="mr-2 h-5 w-5 text-green-400" />
              Timesheet Records
            </h2>

            <div className="mt-3 flex items-center space-x-2 sm:mt-0">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Filter:
              </span>
              <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    activeFilter === "all"
                      ? "bg-white shadow-sm dark:bg-gray-600"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("today")}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    activeFilter === "today"
                      ? "bg-white shadow-sm dark:bg-gray-600"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setActiveFilter("week")}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    activeFilter === "week"
                      ? "bg-white shadow-sm dark:bg-gray-600"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  This Week
                </button>
              </div>
            </div>
          </div>

          {projectsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div
                  className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-400 border-r-transparent align-[-0.125em]"
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Loading your timesheet data...
                </p>
              </div>
            </div>
          ) : !sortedProjects || sortedProjects.length === 0 ? (
            <div className="flex h-64 items-center justify-center p-8">
              <div className="mx-auto max-w-md text-center">
                <div className="mb-4 inline-flex rounded-full bg-gray-100 p-4 dark:bg-gray-700">
                  <Clock className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="mb-2 text-lg font-medium">
                  No timesheet entries found
                </h3>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  Track your time by adding your first entry using the &quot;New
                  Entry&quot; button above.
                </p>
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Entry
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Activity
                    </th>
                    <th className="w-24 px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Remarks
                    </th>
                    <th className="w-20 px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedProjects.flatMap((project) =>
                    project.activities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="bg-white transition-colors hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{project.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{activity.about}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-green-600 dark:text-green-400">
                            {activity.hoursWorked}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500 dark:text-gray-400">
                            {formatDate(activity.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500 dark:text-gray-400">
                            {activity.remark ?? "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(activity.id)}
                            disabled={deleteActivity.isPending}
                            className="inline-flex items-center justify-center rounded-full p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                            aria-label="Delete entry"
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

          {/* Timesheet Summary - Only shows if there are entries */}
          {sortedProjects && sortedProjects.length > 0 && (
            <div className="border-t border-gray-200 p-6 dark:border-gray-700">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-5 dark:from-green-900/30 dark:to-green-800/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                      Total Hours
                    </h4>
                    <div className="rounded-full bg-green-200 p-2 dark:bg-green-700">
                      <Clock className="h-4 w-4 text-green-600 dark:text-green-300" />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-green-600 dark:text-green-400">
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
                      .toFixed(1)}
                  </p>
                  <p className="mt-1 text-sm text-green-600/70 dark:text-green-400/70">
                    across all projects
                  </p>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 p-5 dark:from-indigo-900/30 dark:to-indigo-800/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                      Total Activities
                    </h4>
                    <div className="rounded-full bg-indigo-200 p-2 dark:bg-indigo-700">
                      <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {sortedProjects.reduce(
                      (acc, project) => acc + project.activities.length,
                      0,
                    )}
                  </p>
                  <p className="mt-1 text-sm text-indigo-600/70 dark:text-indigo-400/70">
                    time entries logged
                  </p>
                </div>

                <div className="rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-5 dark:from-purple-900/30 dark:to-purple-800/20">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      Active Projects
                    </h4>
                    <div className="rounded-full bg-purple-200 p-2 dark:bg-purple-700">
                      <Filter className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {projects?.length ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-purple-600/70 dark:text-purple-400/70">
                    you&apos;re working on
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
