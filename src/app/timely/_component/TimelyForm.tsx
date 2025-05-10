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
  hoursWorked: z.coerce
    .number()
    .positive("Hours must be a positive number"),
  remark: z.string().optional(),
});

// TypeScript type derived from the schema
type FormValues = z.infer<typeof formSchema>;

export function TimelyForm() {
  const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
  const utils = api.useUtils();
  
  // Fetch all projects
  const { data: projects, isLoading: projectsLoading } = api.project.getAll.useQuery();
  
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
    <div className="w-full max-w-md rounded-lg bg-white/10 p-6 text-white">
      <h2 className="mb-6 text-2xl font-bold">Log Your Time</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Project Selection */}
        <div className="flex flex-col gap-1">
          <label htmlFor="projectId" className="font-medium">
            Select Project
          </label>
          <select
            id="projectId"
            {...register("projectId")}
            className="rounded-md bg-white/20 px-3 py-2 text-white"
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
            <p className="text-sm text-red-400">{errors.projectId.message}</p>
          )}
        </div>
        
        {/* New Project Name (conditional) */}
        {isCreatingNewProject && (
          <div className="flex flex-col gap-1">
            <label htmlFor="newProjectName" className="font-medium">
              New Project Name
            </label>
            <input
              id="newProjectName"
              type="text"
              {...register("newProjectName")}
              className="rounded-md bg-white/20 px-3 py-2 text-white"
              placeholder="Enter project name"
            />
            {errors.newProjectName && (
              <p className="text-sm text-red-400">
                {errors.newProjectName.message}
              </p>
            )}
          </div>
        )}
        
        {/* Activity Details */}
        <div className="flex flex-col gap-1">
          <label htmlFor="about" className="font-medium">
            Activity Description
          </label>
          <input
            id="about"
            type="text"
            {...register("about")}
            className="rounded-md bg-white/20 px-3 py-2 text-white"
            placeholder="What did you work on?"
          />
          {errors.about && (
            <p className="text-sm text-red-400">{errors.about.message}</p>
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <label htmlFor="hoursWorked" className="font-medium">
            Hours Worked
          </label>
          <input
            id="hoursWorked"
            type="number"
            step="0.25"
            min="0.25"
            {...register("hoursWorked")}
            className="rounded-md bg-white/20 px-3 py-2 text-white"
          />
          {errors.hoursWorked && (
            <p className="text-sm text-red-400">{errors.hoursWorked.message}</p>
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <label htmlFor="remark" className="font-medium">
            Remarks (Optional)
          </label>
          <textarea
            id="remark"
            {...register("remark")}
            className="rounded-md bg-white/20 px-3 py-2 text-white"
            placeholder="Any additional notes?"
            rows={3}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || createProject.isPending || createActivity.isPending}
          className="mt-4 rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20 disabled:opacity-50"
        >
          {isSubmitting || createProject.isPending || createActivity.isPending
            ? "Submitting..."
            : "Log Activity"}
        </button>
      </form>
    </div>
  );
}