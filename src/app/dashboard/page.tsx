import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { ProjectDashboard } from "./_components/ProjectDashboard";

export default async function DashboardPage() {
  // Check authentication
  const session = await auth();

  // Redirect to signin if not authenticated
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <HydrateClient>
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] pb-16 text-white">
        <div className="container mx-auto px-4">
          {/* Header */}
          <header className="mb-8 border-b border-white/10 py-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-3xl font-bold">Management Dashboard</h1>
                <p className="mt-1 text-gray-300">
                  Overview of all projects and activities
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/timely"
                  className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                >
                  Timely App
                </Link>
                <Link
                  href="/"
                  className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                >
                  Home
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <ProjectDashboard />
        </div>
      </main>
    </HydrateClient>
  );
}
