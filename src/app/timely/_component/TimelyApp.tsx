"use client";
import { useMemo } from "react";
import { Calendar, Clock, LogOut, PieChart, Moon, Sun } from "lucide-react";
import { useState } from "react";
import TimesheetUI from "./TimeSheet";
import { Bell, Settings } from "lucide-react";
import CalendarComponent from 'react-calendar';

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
            <span className="mr-2 flex h-12 w-12 items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="w-11 h-11">
                <circle cx="24" cy="24" r="22" fill="#6366f1" stroke="#4f46e5" strokeWidth="4"/>
                <line x1="24" y1="24" x2="24" y2="13" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                <line x1="24" y1="24" x2="33" y2="24" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="24" cy="24" r="2" fill="#fff"/>
              </svg>
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight">
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
            <button
              className={`sidebar-menu-item ${activeView === "calendar" ? "active" : ""}`}
              onClick={() => setActiveView("calendar")}
            >
              <Calendar className="sidebar-menu-item-icon" />
              Calendar
            </button>
          </nav>
          <div className="flex-grow"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-hidden">
        <div className="mx-auto max-w-7xl p-6">
          {/* Content Header */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex flex-col gap-130 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-['Poppins',sans-serif] md:text-4xl bg-gradient-to-r from-green-400 via-green-600 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
                  Track Productivity
                </h1>
                <div className="flex items-center gap-3">
                  <button className="hover:text-blue-600 dark:hover:text-green-400 transition" aria-label="Notifications">
                    <Bell className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                  </button>
                  <button className="hover:text-blue-600 dark:hover:text-green-400 transition" aria-label="Settings">
                    <Settings className="w-6 h-6 text-gray-400 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="flex items-center justify-center hover:text-blue-600 dark:hover:text-green-400 transition"
                    aria-label="Toggle Theme"
                  >
                    {isDarkMode ? (
                      <Sun className="w-6 h-6 text-yellow-200" />
                    ) : (
                      <Moon className="w-6 h-6 text-gray-700" />
                    )}
                  </button>
                  {/* User Avatar with dropdown */}
                  <div className="relative group">
                    <button
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white focus:outline-none"
                      tabIndex={0}
                    >
                      {developer?.name?.slice(0, 2).toUpperCase() || "NA"}
                    </button>
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                    <div
                      className="absolute right-0 mt-2 w-32 rounded-lg bg-white dark:bg-gray-800 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-all duration-200 z-50"
                    >
                      <a
                        href="/api/auth/signout"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <LogOut className="inline-block mr-2 h-4 w-4" />
                        Logout
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-sm md:text-base`}>
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Main Content Switch */}
           {activeView === "calendar" ? (
  <div
    className={`h-full w-full rounded-xl shadow-lg ${
      isDarkMode
        ? "bg-gray-900 border border-gray-700"
        : "bg-white border border-gray-200"
    } flex items-center justify-center p-8`}
    style={{ minHeight: "60vh" }}
  >
<CalendarComponent
  className="w-full h-full rounded-xl"
  showNeighboringMonth={false}
  prevLabel={<span className={`text-xl font-bold ${isDarkMode ? "text-grey dark:text-white" : "text-black"}`}>&lt;</span>}
  nextLabel={<span className={`text-xl font-bold ${isDarkMode ? "text-grey dark:text-white" : "text-black"}`}>&gt;</span>}
  navigationLabel={({ label }) => (
    <span className={`font-semibold text-base ${isDarkMode ? "text-grey dark:text-white" : "text-black"}`}>{label}</span>
  )}
  formatShortWeekday={(locale, date) =>
    date.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()
  }
  tileClassName={({ date, view }) => {
    if (view === "month") {
      const isSunday = date.getDay() === 0;
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();
      return [
        "text-base text-center",
        isSunday ? "text-red-500 font-bold" : isDarkMode ? "text-gray-100" : "text-gray-700",
        isToday ? "bg-indigo-600 text-white rounded-full font-bold" : "",
      ].join(" ");
    }
    return "";
  }}
  tileContent={({ date, view }) => null}
/>
  </div>
          ) : activeView === "daily" ? (
            <div
              className={`rounded-xl shadow-xl ${
                isDarkMode
                  ? "bg-gray-800/40 border border-gray-700/50"
                  : "bg-white border border-gray-100"
              }`}
            >
              <TimesheetUI />
            </div>
          ) : (
            <div
              className={`rounded-xl p-8 shadow-xl ${
                isDarkMode
                  ? "bg-gray-800/40 border border-gray-700/50"
                  : "bg-white border border-gray-100"
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