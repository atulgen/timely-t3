/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import { Calendar, Clock, LogOut, PieChart } from "lucide-react";
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
          ? "bg-gradient-to-br from-[#1a1a30] via-[#232342] to-[#141428] text-gray-100"
          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800"
      } md:flex-row`}
    >
      {/* Sidebar */}
      <div
        className={`w-full border-b transition-colors md:border-r md:border-b-0 ${
          isDarkMode ? "border-white/10" : "border-gray-200"
        } md:h-screen md:w-72 md:flex-shrink-0`}
      >
        <div className="sticky top-0 flex h-full flex-col p-6">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-center md:justify-start">
            <Clock className="mr-2 h-8 w-8 text-green-400" />
            <h1 className="text-3xl font-extrabold tracking-tight">
              Timely<span className="text-green-400">.</span>
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="mb-6 space-y-1">
            <div className="mb-2 px-3 text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Dashboard
            </div>
            <button
              className={`flex w-full items-center rounded-lg px-4 py-3 font-medium transition ${
                activeView === "daily"
                  ? isDarkMode
                    ? "bg-green-500/10 text-green-400"
                    : "bg-green-100 text-green-700"
                  : isDarkMode
                    ? "hover:bg-white/5"
                    : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveView("daily")}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Daily Logger
            </button>

            <button
              className={`flex w-full items-center rounded-lg px-4 py-3 font-medium transition ${
                activeView === "weekly"
                  ? isDarkMode
                    ? "bg-green-500/10 text-green-400"
                    : "bg-green-100 text-green-700"
                  : isDarkMode
                    ? "hover:bg-white/5"
                    : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveView("weekly")}
            >
              <PieChart className="mr-3 h-5 w-5" />
              Weekly Reports
            </button>

            {/* <div className="mt-6 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              More Options
            </div>
            
            <button
              className={`flex w-full items-center rounded-lg px-4 py-3 font-medium transition ${
                isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Team Projects
            </button>
            
            <button
              className={`flex w-full items-center rounded-lg px-4 py-3 font-medium transition ${
                isDarkMode ? "hover:bg-white/5" : "hover:bg-gray-100"
              }`}
            >
              <Filter className="mr-3 h-5 w-5" />
              Filters & Tags
            </button> */}
          </nav>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Theme Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex w-full items-center justify-between rounded-lg p-3 ${
                isDarkMode ? "bg-gray-800" : "border border-gray-200 bg-white"
              }`}
            >
              <span className="font-medium">
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </span>
              <div
                className={`h-6 w-12 rounded-full p-1 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full transition-all ${
                    isDarkMode
                      ? "translate-x-6 bg-green-400"
                      : "translate-x-0 bg-gray-400"
                  }`}
                ></div>
              </div>
            </button>
          </div>

          {/* User Profile & Logout */}
          <div
            className={`mt-auto rounded-lg ${
              isDarkMode ? "bg-gray-800/50" : "border border-gray-200 bg-white"
            } p-4`}
          >
            <div className="mb-3 flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 font-bold text-white">
                {developer?.name?.toUpperCase().slice(0, 2)}
              </div>
              <div className="ml-3">
                <div className="font-medium">{developer?.name}</div>
                <div
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {developer?.email}
                </div>
              </div>
            </div>
            <a
              href="/api/auth/signout"
              className={`flex w-full items-center justify-center rounded-lg py-2 font-medium transition ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-1 text-2xl font-bold">
                {activeView === "daily" ? "Time Logger" : "Weekly Summary"}
              </h2>
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                {formattedDate}
              </p>
            </div>
            {/* <div className="mt-4 flex space-x-3 sm:mt-0">
              <button
                className={`rounded-lg px-4 py-2 ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "border border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                Export Data
              </button>
              <button className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                Quick Add
              </button>
            </div> */}
          </div>

          {/* Main Content */}
          {activeView === "daily" ? (
            <div
              className={`rounded-xl shadow-lg ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              }`}
            >
              <TimesheetUI />
            </div>
          ) : (
            <div
              className={`rounded-xl p-6 shadow-lg ${
                isDarkMode ? "bg-gray-800/50" : "bg-white"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Weekly Activity Summary
                </h3>
                <div className="flex space-x-2">
                  <button
                    className={`rounded px-3 py-1 text-sm ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    className={`rounded px-3 py-1 text-sm ${
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
              <div className="flex flex-col items-center justify-center py-16">
                <div
                  className={`rounded-full p-6 ${
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-100"
                  }`}
                >
                  <PieChart className="h-12 w-12 text-green-400" />
                </div>
                <h4 className="mt-4 text-lg font-medium">
                  Weekly Reports Coming Soon
                </h4>
                <p
                  className={`mt-2 text-center ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  We&apos;re working on bringing you detailed weekly summaries
                  and charts.
                </p>
                <button className="mt-6 rounded-lg bg-green-500 px-6 py-2 font-medium text-white hover:bg-green-600">
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
