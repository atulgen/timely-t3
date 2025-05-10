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

export default function TimelyForm() {
  const [entries, setEntries] = useState([{ id: 1 }]);
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

  // Add a new row to the timesheet
  const addRow = () => {
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;
    setEntries([...entries, { id: newId }]);
  };

  // Delete a row from the timesheet
  const deleteRow = (id: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  // Calculate total hours
  const totalHours = entries.reduce((sum, _, index) => {
    const hours = parseFloat(watch(`hoursWorked-${index}` as any)) || 0;
    return sum + hours;
  }, 0);

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      for (let i = 0; i < entries.length; i++) {
        let projectId = data[`projectId-${i}`];
        const about = data[`about-${i}`];
        const hoursWorked = data[`hoursWorked-${i}`];
        const remark = data[`remark-${i}`];
        const newProjectName = data[`newProjectName-${i}`];

        // If creating a new project, create it first and get the ID
        if (projectId === "new" && newProjectName) {
          const newProject = await createProject.mutateAsync({
            name: newProjectName,
          });
          projectId = newProject.id;
        }

        // Now create the activity with the project ID
        if (projectId && about && hoursWorked) {
          await createActivity.mutateAsync({
            projectId,
            about,
            hoursWorked,
            remark: remark ?? undefined,
          });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Timesheet Header */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-white">Daily Timesheet</h3>
        <p className="text-sm text-gray-400">Track your work hours efficiently</p>
      </div>
      
      {/* Timesheet Table */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 overflow-x-auto rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-gray-700 text-sm font-medium text-gray-300">
          <div className="col-span-1 border-r border-gray-600 p-3 text-center">#</div>
          <div className="col-span-3 border-r border-gray-600 p-3">Project</div>
          <div className="col-span-4 border-r border-gray-600 p-3">Activity</div>
          <div className="col-span-1 border-r border-gray-600 p-3 text-center">Hours</div>
          <div className="col-span-2 border-r border-gray-600 p-3">Remarks</div>
          <div className="col-span-1 p-3 text-center">Action</div>
        </div>
        
        {/* Table Body */}
        <div className="max-h-[500px] overflow-y-auto">
          {entries.map((entry, index) => (
            <div 
              key={entry.id} 
              className="grid grid-cols-12 border-t border-gray-700 text-sm hover:bg-gray-700/50"
            >
              <div className="col-span-1 flex items-center justify-center border-r border-gray-700 p-2 text-center text-gray-400">
                {index + 1}
              </div>
              
              {/* Project Column */}
              <div className="col-span-3 border-r border-gray-700 p-2">
                <select
                  {...register(`projectId-${index}` as const)}
                  className="w-full rounded bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" disabled className="bg-gray-800">
                    Select a project
                  </option>
                  {!projectsLoading &&
                    projects?.map((project) => (
                      <option key={project.id} value={project.id} className="bg-gray-800">
                        {project.name}
                      </option>
                    ))}
                  <option value="new" className="bg-gray-800">
                    + Create New Project
                  </option>
                </select>
                {watch(`projectId-${index}` as const) === "new" && (
                  <input
                    {...register(`newProjectName-${index}` as const)}
                    placeholder="New project name"
                    className="mt-2 w-full rounded bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
              </div>
              
              {/* Activity Column */}
              <div className="col-span-4 border-r border-gray-700 p-2">
                <input
                  {...register(`about-${index}` as const, { required: true })}
                  type="text"
                  placeholder="What did you work on?"
                  className="w-full rounded bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors[`about-${index}` as any] && (
                  <p className="mt-1 text-xs text-red-400">
                    Activity description is required
                  </p>
                )}
              </div>
              
              {/* Hours Column */}
              <div className="col-span-1 border-r border-gray-700 p-2">
                <input
                  {...register(`hoursWorked-${index}` as const, { valueAsNumber: true, required: true })}
                  type="number"
                  min="0.25"
                  step="0.25"
                  placeholder="0"
                  className="w-full rounded bg-gray-700 p-2 text-center text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors[`hoursWorked-${index}` as any] && (
                  <p className="mt-1 text-xs text-red-400">
                    Valid hours required
                  </p>
                )}
              </div>
              
              {/* Remarks Column */}
              <div className="col-span-2 border-r border-gray-700 p-2">
                <input
                  {...register(`remark-${index}` as const)}
                  type="text"
                  placeholder="Any notes? (Optional)"
                  className="w-full rounded bg-gray-700 p-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              {/* Action Column */}
              <div className="col-span-1 flex items-center justify-center p-2">
                <button
                  type="button"
                  onClick={() => deleteRow(entry.id)}
                  disabled={entries.length <= 1}
                  className={`rounded p-1 transition ${
                    entries.length <= 1 
                      ? "cursor-not-allowed text-gray-500" 
                      : "text-red-400 hover:bg-red-400/20"
                  }`}
                  title="Delete row"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Table Footer */}
        <div className="grid grid-cols-12 border-t border-gray-700 bg-gray-700 font-medium text-gray-300">
          <div className="col-span-8 border-r border-gray-600 p-3 text-right">
            Total Hours:
          </div>
          <div className="col-span-1 border-r border-gray-600 p-3 text-center font-mono">
            {totalHours.toFixed(2)}
          </div>
          <div className="col-span-3 p-3"></div>
        </div>
      </form>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between gap-4">
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </button>
        
        <div className="ml-auto flex gap-4">
          <button
            type="button"
            className="rounded-lg bg-gray-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-gray-500"
          >
            Save Draft
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || createProject.isPending || createActivity.isPending}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
          >
            {isSubmitting || createProject.isPending || createActivity.isPending
              ? "Submitting..."
              : "Submit Timesheet"}
          </button>
        </div>
      </div>
    </div>
  );
}