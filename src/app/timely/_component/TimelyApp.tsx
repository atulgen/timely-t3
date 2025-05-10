/* eslint-disable @next/next/no-html-link-for-pages */

"use client";
import { useState } from "react";
import TimelyForm from "./TimelyForm";
import { ActivitiesList } from "./ActivitiesList";

// Main Timely App with new layout
export default function TimelyApp() {
  const [activeView, setActiveView] = useState("daily"); // Options: "daily" or "weekly"

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white md:flex-row">
      {/* Sidebar */}
      <div className="w-full border-white/10 p-4 md:h-screen md:w-64 md:flex-shrink-0 md:border-r">
        <div className="flex h-full flex-col">
          <h1 className="mb-8 text-center text-3xl font-extrabold md:text-left">
            Timely
          </h1>

          {/* Navigation Options */}
          <nav className="mb-6 flex justify-center gap-4 md:flex-col md:justify-start">
            <button
              className={`rounded-lg px-6 py-3 font-medium transition ${
                activeView === "daily"
                  ? "bg-green-400 text-gray-800"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              onClick={() => setActiveView("daily")}
            >
              Daily
            </button>

            <button
              className={`rounded-lg px-6 py-3 font-medium transition ${
                activeView === "weekly"
                  ? "bg-green-400 text-gray-800"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              onClick={() => setActiveView("weekly")}
            >
              Weekly
            </button>
          </nav>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Logout Button */}
          <a
            href="/api/auth/signout"
            className="mt-auto rounded-lg bg-white/10 px-6 py-3 text-center font-medium transition hover:bg-white/20"
          >
            Logout
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4">
        <div className="mx-auto max-w-4xl">
          {/* Content Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {activeView === "daily" ? "Logger" : "Weekly Summary"}
            </h2>
            <div className="text-sm">
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Main Content */}
          {activeView === "daily" ? (
            <div className="rounded-lg bg-white/5 p-6">
              <TimelyForm />
              <ActivitiesList/>
            </div>
          ) : (
            <div className="rounded-lg bg-white/5 p-6">
              <h3 className="mb-4 text-xl font-semibold">Activity Summary</h3>
              {/* This would be your ActivitiesList component */}
              <div className="py-8 text-center text-gray-400">
                Weekly view is coming soon
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
