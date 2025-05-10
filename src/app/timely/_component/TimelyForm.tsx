/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

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

export default function TimelyForm() {
  const utils = api.useUtils();
  const { data: projects, isLoading: projectsLoading } =
    api.project.getAll.useQuery();

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
    onSuccess: async (newProject) => {
      await utils.project.getAll.invalidate();
      return newProject;
    },
  });

  const createActivity = api.activity.create.useMutation({
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
        Logger
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
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
                        className="mr-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <td colSpan={5} className="px-6 py-3">
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={addNewRow}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800"
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
                        : "Submit Timesheet"}
                    </button>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </form>
    </div>
  );
}
