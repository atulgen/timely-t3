"use client";

import { useState } from "react";
import { z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";

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
    api.project.getAll.useQuery();

  // Sort activities by descending creation date (newest first)
  const sortedProjects = projects?.map((project) => ({
    ...project,
    activities: [...project.activities].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  }));

  const [isAdding, setIsAdding] = useState(false);

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Timesheet Manager
        </h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
        >
          {isAdding ? "Cancel" : "Add Time Entry"}
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            New Time Entry
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {fields.map((field, index) => {
                    const isCreatingNewProject =
                      watch(`entries.${index}.projectId`) === "new";
                    return (
                      <tr
                        key={field.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {/* Project */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            <select
                              {...register(`entries.${index}.projectId`)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                              <input
                                {...register(`entries.${index}.newProjectName`)}
                                placeholder="New project name"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                autoFocus
                              />
                            )}
                            {errors.entries?.[index]?.projectId && (
                              <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.entries[index]?.projectId?.message}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Activity */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            {...register(`entries.${index}.about`)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="Activity description"
                          />
                          {errors.entries?.[index]?.about && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {errors.entries[index]?.about?.message}
                            </p>
                          )}
                        </td>

                        {/* Hours */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            step="0.25"
                            min="0.25"
                            {...register(`entries.${index}.hoursWorked`)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          />
                          {errors.entries?.[index]?.hoursWorked && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {errors.entries[index]?.hoursWorked?.message}
                            </p>
                          )}
                        </td>

                        {/* Remarks */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            {...register(`entries.${index}.remark`)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="Optional notes"
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <td colSpan={5} className="px-6 py-3">
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={addNewRow}
                          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800"
                        >
                          Add Row
                        </button>
                        <button
                          type="submit"
                          disabled={
                            isSubmitting ||
                            createProject.isPending ||
                            createActivity.isPending
                          }
                          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:focus:ring-offset-gray-800"
                        >
                          {isSubmitting ||
                          createProject.isPending ||
                          createActivity.isPending
                            ? "Submitting..."
                            : "Submit Entries"}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </form>
        </div>
      )}

      {/* Timesheet Records */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Timesheet Records
          </h2>

          {projectsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                Loading your timesheet data...
              </div>
            </div>
          ) : !sortedProjects || sortedProjects.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="mb-2">No timesheet entries found</p>
                <p className="text-sm">
                  Add your first time entry to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {sortedProjects.flatMap((project) =>
                    project.activities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900 dark:text-white">
                            {activity.about}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900 dark:text-white">
                            {activity.hoursWorked}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500 dark:text-gray-300">
                            {formatDate(activity.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500 dark:text-gray-300">
                            {activity.remark ?? "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(activity.id)}
                            disabled={deleteActivity.isPending}
                            className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                          >
                            Delete
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

        {/* Timesheet Summary - Only shows user's own activities */}
        {sortedProjects && sortedProjects.length > 0 && (
          <div className="border-t border-gray-200 p-6 dark:border-gray-700">
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
              Summary
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/30">
                <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                  Total Projects
                </h4>
                <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {projects?.length ?? 0}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                  Your Activities
                </h4>
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {sortedProjects.reduce(
                    (acc, project) => acc + project.activities.length,
                    0,
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/30">
                <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">
                  Your Total Hours
                </h4>
                <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
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
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}