"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

type Activity = {
  id: string;
  about: string;
  hoursWorked: number;
  remark: string | null;
  createdAt: Date;
};

type Project = {
  id: string;
  name: string;
  activities: Activity[];
};

export function ActivitiesList() {
  const { data: projects, isLoading } = api.project.getAll.useQuery();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  
  const utils = api.useUtils();
  
  // Delete activity mutation
  const deleteActivity = api.activity.delete.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate();
    },
  });
  
  const handleDelete = async (activityId: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      await deleteActivity.mutateAsync({ id: activityId });
    }
  };
  
  const toggleProject = (projectId: string) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
    }
  };
  
  if (isLoading) {
    return <div className="text-center">Loading your projects...</div>;
  }
  
  if (!projects || projects.length === 0) {
    return (
      <div className="rounded-lg bg-white/5 p-6 text-center">
        <p>No projects found. Create a new project to get started!</p>
      </div>
    );
  }
  
  // Format date to a readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  return (
    <div className="w-full max-w-4xl space-y-4">
      <h2 className="text-2xl font-bold">Your Projects</h2>
      
      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="overflow-hidden rounded-lg bg-white/10"
          >
            <div
              className="flex cursor-pointer items-center justify-between p-4"
              onClick={() => toggleProject(project.id)}
            >
              <div>
                <h3 className="text-xl font-semibold">{project.name}</h3>
                <p className="text-sm text-gray-300">
                  {project.activities.length} {project.activities.length === 1 ? "activity" : "activities"} ・ 
                  {project.activities.reduce((acc, curr) => acc + curr.hoursWorked, 0)} hours total
                </p>
              </div>
              <div className="text-2xl">
                {expandedProject === project.id ? "▼" : "►"}
              </div>
            </div>
            
            {expandedProject === project.id && (
              <div className="border-t border-white/10">
                {project.activities.length === 0 ? (
                  <div className="p-4 text-center text-gray-300">
                    No activities logged for this project yet.
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {project.activities.map((activity) => (
                      <div key={activity.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{activity.about}</h4>
                            <div className="mt-1 flex flex-wrap text-sm text-gray-300">
                              <span className="mr-4">
                                {activity.hoursWorked} {activity.hoursWorked === 1 ? "hour" : "hours"}
                              </span>
                              <span>{formatDate(activity.createdAt)}</span>
                            </div>
                            {activity.remark && (
                              <p className="mt-2 text-sm">{activity.remark}</p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDelete(activity.id);
                            }}
                            className="rounded-full bg-red-500/20 p-2 text-sm hover:bg-red-500/30"
                            disabled={deleteActivity.isPending}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}