/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import { Calendar, Clock, LogOut, PieChart, Moon, Sun } from "lucide-react";
import { useState } from "react";
import TimesheetUI from "./TimeSheet";

type AppProps = {
  developer?: { name: string | null; email: string | null };
};

// Main Timely App with enhanced premium layout
export default function TimelyApp({ developer }: AppProps) {
  const [activeView, setActiveView] = useState("daily"); // Options: "daily" or "weekly"
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Get current date information
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`flex min-h-screen flex-col transition-colors duration-300 ${
        isDarkMode
          ? "app-dark"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800"
      } md:flex-row`}
    >
      {/* Sidebar */}
      <div
        className={`w-full border-b transition-colors md:border-r md:border-b-0 ${
          isDarkMode ? "border-white/10" : "border-gray-200"
        } md:h-screen md:w-80 md:flex-shrink-0`}
      >
        <div className="sticky top-0 flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-center md:justify-start">
            <Clock className="mr-2 h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-extrabold tracking-tight">
              Timely<span className="text-indigo-400">.</span>
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="mb-8 space-y-1">
            <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Dashboard
            </div>
            <button
              className={`sidebar-menu-item ${activeView === "daily" ? "active" : ""}`}
              onClick={() => setActiveView("daily")}
            >
              <Calendar className="sidebar-menu-item-icon" />
              Daily Logger
            </button>

            <button
              className={`sidebar-menu-item ${activeView === "weekly" ? "active" : ""}`}
              onClick={() => setActiveView("weekly")}
            >
              <PieChart className="sidebar-menu-item-icon" />
              Weekly Reports
            </button>
          </nav>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Theme Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex w-full items-center justify-between rounded-lg p-3 ${
                isDarkMode ? "bg-gray-800/70 hover:bg-gray-800" : "border border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
              <div
                className={`flex h-6 w-12 items-center rounded-full p-1 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full transition-all ${
                    isDarkMode
                      ? "translate-x-6 bg-indigo-400"
                      : "translate-x-0 bg-gray-400"
                  }`}
                >
                  {isDarkMode ? (
                    <Moon className="h-3 w-3 text-gray-900" />
                  ) : (
                    <Sun className="h-3 w-3 text-gray-100" />
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* User Profile & Logout */}
          <div
            className={`mt-auto rounded-lg ${
              isDarkMode ? "bg-gray-800/50 border border-gray-700/50" : "border border-gray-200 bg-white"
            } p-4`}
          >
            <div className="mb-3 flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white">
                {developer?.name?.slice(0, 2).toUpperCase() ?? "NA"}
              </div>
              <div className="ml-3">
                <div className="font-medium">{developer?.name ?? "User"}</div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {developer?.email ?? "user@example.com"}
                </div>
              </div>
            </div>
            <a
              href="/api/auth/signout"
              className={`flex w-full items-center justify-center rounded-lg py-2.5 font-medium transition ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-hidden">
        <div className="mx-auto max-w-7xl p-6">
          {/* Content Header */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                {activeView === "daily" ? "Time Logger" : "Weekly Summary"}
              </h2>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm md:text-base`}>
                {formattedDate}
              </p>
            </div>
            
            {activeView === "daily" && (
              <button className="btn btn-primary self-start">
                + Add Entry
              </button>
            )}
          </div>

          {/* Main Content */}
          {activeView === "daily" ? (
            <div
              className={`rounded-xl shadow-xl ${
                isDarkMode ? "bg-gray-800/40 border border-gray-700/50" : "bg-white border border-gray-100"
              }`}
            >
              <TimesheetUI />
            </div>
          ) : (
            <div
              className={`rounded-xl p-8 shadow-xl ${
                isDarkMode ? "bg-gray-800/40 border border-gray-700/50" : "bg-white border border-gray-100"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Weekly Activity Summary
                </h3>
                <div className="flex space-x-2">
                  <button
                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                      isDarkMode
                        ? "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    className={`rounded-md px-4 py-2 text-sm font-medium ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    Last Week
                  </button>
                </div>
              </div>

              {/* Placeholder for weekly view */}
              <div className="flex flex-col items-center justify-center py-20">
                <div
                  className={`rounded-full p-6 ${
                    isDarkMode ? "bg-indigo-900/30 border border-indigo-800/30" : "bg-indigo-50"
                  }`}
                >
                  <PieChart className="h-12 w-12 text-indigo-400" />
                </div>
                <h4 className="mt-6 text-xl font-semibold">
                  Weekly Reports Coming Soon
                </h4>
                <p
                  className={`mt-4 max-w-md text-center ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  We&apos;re working on bringing you detailed weekly summaries
                  and charts. Stay tuned for this exciting new feature!
                </p>
                <button className="btn btn-primary mt-8">
                  Get Notified
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}