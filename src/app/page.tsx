import Link from "next/link";
import Image from "next/image";
import { LatestPost } from "@/app/_components/post";
import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/app/_components/AuthButtons";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/timely");
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              Timely
            </h1>
            <p className="text-xl text-gray-300 max-w-md text-center">
              The elegant solution for tracking time and productivity
            </p>
          </div>

          <div className="card p-8 w-full max-w-lg">
            <div className="flex flex-col items-center gap-6">
              <div className="w-40 h-16 flex items-center justify-center">
                <Image src="/logo.png" alt="Logo" width={192} height={80} />
              </div>
              <div className="flex flex-col items-center justify-center gap-6 w-full">
                <p className="text-center text-lg text-gray-300">
                  {session && (
                    <span>
                      Logged in as{" "}
                      <span className="font-medium">{session.user?.name}</span>
                    </span>
                  )}
                </p>
                {!session && <AuthButtons />}
                {session && (
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link
                      href="/api/auth/signout"
                      className="btn btn-secondary text-center w-full sm:w-auto"
                    >
                      Sign out
                    </Link>
                    <Link
                      href="/timely"
                      className="btn btn-primary text-center w-full sm:w-auto"
                    >
                      Track Time
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!session && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              <div className="card p-6 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300">
                <div className="flex flex-col gap-3 items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-100">Task Management</h3>
                  <p className="text-gray-300">Comprehensive tracking for all business activities and deliverables</p>
                </div>
              </div>
              <div className="card p-6 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300">
                <div className="flex flex-col gap-3 items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-100">Data Analytics</h3>
                  <p className="text-gray-300">Enterprise-level insights for productivity optimization</p>
                </div>
              </div>
              <div className="card p-6 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300">
                <div className="flex flex-col gap-3 items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-100">Performance Optimization</h3>
                  <p className="text-gray-300">Streamline workflows and maximize team efficiency</p>
                </div>
              </div>
            </div>
          )}

          {session?.user && <LatestPost />}
        </div>
      </main>
    </HydrateClient>
  );
}