"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

type Activity = {
  id: string;
  about: string;
  hoursWorked: number;
  remark: string | null;
  verifiedBy: string | null;
  projectName: string;
  createdAt: Date;
};

interface VerifyActivityModalProps {
  activity: Activity | null;
  onClose: () => void;
}

export function VerifyActivityModal({ activity, onClose }: VerifyActivityModalProps) {
  const [verifierName, setVerifierName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useUtils();
  
  const verifyActivity = api.activity.update.useMutation({
    onSuccess: async () => {
      await utils.project.getAll.invalidate();
      onClose();
    },
  });
  
  if (!activity) return null;
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verifierName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await verifyActivity.mutateAsync({
        id: activity.id,
        verifiedBy: verifierName,
      });
    } catch (error) {
      console.error("Error verifying activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-[#1e1b4b] p-6 shadow-xl">
        <h2 className="text-xl font-bold">Verify Activity</h2>
        
        <div className="my-4 space-y-3 rounded-md bg-white/5 p-4">
          <div>
            <span className="text-sm text-gray-300">Project:</span>
            <p className="font-medium">{activity.projectName}</p>
          </div>
          
          <div>
            <span className="text-sm text-gray-300">Activity:</span>
            <p className="font-medium">{activity.about}</p>
          </div>
          
          <div className="flex gap-8">
            <div>
              <span className="text-sm text-gray-300">Hours:</span>
              <p className="font-medium">{activity.hoursWorked}</p>
            </div>
            
            <div>
              <span className="text-sm text-gray-300">Date:</span>
              <p className="font-medium">{formatDate(activity.createdAt)}</p>
            </div>
          </div>
          
          {activity.remark && (
            <div>
              <span className="text-sm text-gray-300">Remarks:</span>
              <p className="font-medium">{activity.remark}</p>
            </div>
          )}
          
          {activity.verifiedBy && (
            <div className="rounded-md bg-green-500/20 p-2 text-center">
              <p className="text-sm">
                Already verified by <span className="font-medium">{activity.verifiedBy}</span>
              </p>
            </div>
          )}
        </div>
        
        {!activity.verifiedBy && (
          <form onSubmit={handleVerify} className="mt-4">
            <div className="mb-4">
              <label htmlFor="verifier" className="block text-sm font-medium">
                Verify as (your name):
              </label>
              <input
                type="text"
                id="verifier"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                className="mt-1 w-full rounded-md bg-white/10 px-3 py-2 text-white"
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !verifierName.trim()}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Verify Activity"}
              </button>
            </div>
          </form>
        )}
        
        {activity.verifiedBy && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}