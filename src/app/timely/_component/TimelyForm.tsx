/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";

// Define the form schema with Zod
const formSchema = z.object({
  projectId: z.string().optional(),
  newProjectName: z.string().min(1, "Project name is required").optional(),
  about: z.string().min(1, "Activity description is required"),
  hoursWorked: z.coerce.number().positive("Hours must be a positive number"),
  remark: z.string().optional(),
});

// TypeScript type derived from the schema
type FormValues = z.infer<typeof formSchema>;

// Original TimelyForm Component wrapped in the new layout
export default function TimelyForm() {
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const utils = api.useUtils();

  // Fetch all projects
  const { data: projects, isLoading: projectsLoading } =
    api.project.getAll.useQuery();

  // Initialize form with react-hook-form and zod resolver
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      about: "",
      hoursWorked: 1,
      remark: "",
    },
  });

  // Watch project ID to determine if we need to show the new project input
  const selectedProjectId = watch("projectId");

  useEffect(() => {
    if (selectedProjectId === "new") {
      setIsCreatingNewProject(true);
    } else {
      setIsCreatingNewProject(false);
    }
  }, [selectedProjectId]);

  // Create new project mutation
  const createProject = api.project.create.useMutation({
    onSuccess: async (newProject) => {
      await utils.project.getAll.invalidate();
      return newProject;
    },
  });

  // Create activity mutation
  const createActivity = api.activity.create.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate();
      reset();
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      let projectId = data.projectId;

      // If creating a new project, create it first and get the ID
      if (isCreatingNewProject && data.newProjectName) {
        const newProject = await createProject.mutateAsync({
          name: data.newProjectName,
        });
        projectId = newProject.id;
      }

      // Now create the activity with the project ID
      if (projectId) {
        await createActivity.mutateAsync({
          projectId,
          about: data.about,
          hoursWorked: data.hoursWorked,
          remark: data.remark ?? undefined,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Project Row */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-1/3">
            <label htmlFor="projectId" className="mb-2 block font-medium">
              Project
            </label>
            <select
              id="projectId"
              {...register("projectId")}
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-black"
              defaultValue=""
            >
              <option value="" disabled>
                Select a project
              </option>
              {!projectsLoading &&
                projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              <option value="new">+ Create New Project</option>
            </select>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-400">
                {errors.projectId.message}
              </p>
            )}
          </div>

          <div className="w-full md:w-2/3">
            <label htmlFor="about" className="mb-2 block font-medium">
              Activity
            </label>
            <input
              id="about"
              type="text"
              {...register("about")}
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
              placeholder="What did you work on?"
            />
            {errors.about && (
              <p className="mt-1 text-sm text-red-400">
                {errors.about.message}
              </p>
            )}
          </div>
        </div>

        {/* New Project Name (conditional) */}
        {isCreatingNewProject && (
          <div className="mt-4">
            <label htmlFor="newProjectName" className="mb-2 block font-medium">
              New Project Name
            </label>
            <input
              id="newProjectName"
              type="text"
              {...register("newProjectName")}
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
              placeholder="Enter project name"
            />
            {errors.newProjectName && (
              <p className="mt-1 text-sm text-red-400">
                {errors.newProjectName.message}
              </p>
            )}
          </div>
        )}

        {/* Hours & Remarks Row */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full md:w-1/3">
            <label htmlFor="hoursWorked" className="mb-2 block font-medium">
              Hours
            </label>
            <input
              id="hoursWorked"
              type="number"
              step="0.25"
              min="0.25"
              {...register("hoursWorked")}
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
            />
            {errors.hoursWorked && (
              <p className="mt-1 text-sm text-red-400">
                {errors.hoursWorked.message}
              </p>
            )}
          </div>

          <div className="w-full md:w-2/3">
            <label htmlFor="remark" className="mb-2 block font-medium">
              Remarks
            </label>
            <input
              id="remark"
              type="text"
              {...register("remark")}
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
              placeholder="Any additional notes? (Optional)"
            />
          </div>
        </div>

        {/* Add Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              createProject.isPending ||
              createActivity.isPending
            }
            className="rounded-md bg-white/10 px-4 py-2 font-medium transition hover:bg-white/20 disabled:opacity-50"
          >
            {isSubmitting || createProject.isPending || createActivity.isPending
              ? "Adding..."
              : "Add"}
          </button>
        </div>

        {/* Save & Submit Buttons */}
        <div className="flex justify-end space-x-4 border-t border-white/10 pt-6">
          <button
            type="button"
            className="rounded-md bg-white/10 px-6 py-2 font-medium transition hover:bg-white/20"
            disabled={
              isSubmitting ||
              createProject.isPending ||
              createActivity.isPending
            }
          >
            Save
          </button>
          <button
            type="button"
            className="rounded-md bg-white/10 px-6 py-2 font-medium transition hover:bg-white/20"
            disabled={
              isSubmitting ||
              createProject.isPending ||
              createActivity.isPending
            }
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
